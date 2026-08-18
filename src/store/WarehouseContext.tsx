import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  Order,
  Product,
  Worker,
  Zone,
  Exception,
  Toast,
  ToastKind,
  OrderStage,
} from '@/types';
import { PRODUCTS } from '@/data/products';
import { INITIAL_ORDERS } from '@/data/orders';
import { INITIAL_WORKERS, INITIAL_ZONES } from '@/data/workers';
import { INITIAL_EXCEPTIONS } from '@/data/exceptions';

export type AllocationStrategy = 'critical-first' | 'split' | 'wait';

interface WarehouseState {
  products: Product[];
  orders: Order[];
  workers: Worker[];
  zones: Zone[];
  exceptions: Exception[];
  toasts: Toast[];
}

interface WarehouseContextValue extends WarehouseState {
  pushToast: (kind: ToastKind, title: string, message?: string) => void;
  dismissToast: (id: number) => void;
  approveAllocation: (orderId: string, strategy: AllocationStrategy) => void;
  assignPicker: (orderId: string, workerId: string) => void;
  startException: (excId: string) => void;
  advanceException: (excId: string) => void;
  replenish: (sku: string, qty: number) => void;
  rebalanceZone: (zoneId: string) => void;
}

const WarehouseContext = createContext<WarehouseContextValue | null>(null);

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

let toastSeq = 1;

export function WarehouseProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    PRODUCTS.map((p) => ({ ...p }))
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    INITIAL_ORDERS.map((o) => ({ ...o, items: o.items.map((i) => ({ ...i })), timeline: [...o.timeline] }))
  );
  const [workers, setWorkers] = useState<Worker[]>(() => INITIAL_WORKERS.map((w) => ({ ...w })));
  const [zones, setZones] = useState<Zone[]>(() => INITIAL_ZONES.map((z) => ({ ...z })));
  const [exceptions, setExceptions] = useState<Exception[]>(() =>
    INITIAL_EXCEPTIONS.map((e) => ({ ...e }))
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const pushToast = useCallback(
    (kind: ToastKind, title: string, message?: string) => {
      const id = toastSeq++;
      setToasts((t) => [...t, { id, kind, title, message }]);
      setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast]
  );

  const approveAllocation = useCallback(
    (orderId: string, strategy: AllocationStrategy) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      if (strategy === 'wait') {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  stage: 'Allocation' as OrderStage,
                  timeline: [
                    ...o.timeline,
                    { stage: 'Allocation', label: 'Held for replenishment', time: nowTime() },
                  ],
                }
              : o
          )
        );
        pushToast('warning', `${orderId} held for replenishment`, 'Order will resume when incoming stock arrives.');
        return;
      }

      // Reserve available units for each item (critical-first reserves as much as possible).
      setProducts((prev) =>
        prev.map((p) => {
          const item = order.items.find((it) => it.sku === p.sku);
          if (!item) return p;
          const avail = Math.max(0, p.physical - p.reserved - p.damaged);
          const take = strategy === 'split' ? Math.ceil(Math.min(avail, item.qty) / 2) : Math.min(avail, item.qty);
          return { ...p, reserved: p.reserved + take };
        })
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                stage: 'Picking' as OrderStage,
                timeline: [
                  ...o.timeline,
                  {
                    stage: 'Allocation',
                    label: strategy === 'split' ? 'Split allocation approved' : 'Critical-first allocation approved',
                    time: nowTime(),
                  },
                  { stage: 'Picking', label: 'Released to picking', time: nowTime() },
                ],
              }
            : o
        )
      );

      // Resolve any open stock-shortage exception tied to this order.
      setExceptions((prev) =>
        prev.map((e) =>
          e.orderId === orderId && e.type === 'Stock shortage' && e.status !== 'Resolved'
            ? { ...e, status: 'Resolved', currentStep: e.steps.length }
            : e
        )
      );

      pushToast(
        'success',
        `Decision approved for ${orderId}`,
        strategy === 'split'
          ? 'Inventory split across orders. Order released to picking.'
          : 'Units allocated. Order moved to picking.'
      );
    },
    [orders, pushToast]
  );

  const assignPicker = useCallback(
    (orderId: string, workerId: string) => {
      const worker = workers.find((w) => w.id === workerId);
      const order = orders.find((o) => o.id === orderId);
      if (!worker || !order) return;

      setWorkers((prev) =>
        prev.map((w) =>
          w.id === workerId
            ? { ...w, assignedItems: w.assignedItems + order.items.length, available: w.assignedItems + order.items.length < 8 }
            : w
        )
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                assignedPicker: worker.name,
                stage: o.stage === 'Picking' ? o.stage : ('Picking' as OrderStage),
                timeline: [
                  ...o.timeline,
                  { stage: 'Picking', label: `Assigned to ${worker.name}`, time: nowTime() },
                ],
              }
            : o
        )
      );
      pushToast('success', `${worker.name} assigned to ${orderId}`, `Picking in ${worker.zone}.`);
    },
    [workers, orders, pushToast]
  );

  const startException = useCallback(
    (excId: string) => {
      setExceptions((prev) =>
        prev.map((e) => (e.id === excId ? { ...e, status: 'In Progress' } : e))
      );
      pushToast('info', 'Resolution started', 'Follow the recommended steps to resolve.');
    },
    [pushToast]
  );

  const advanceException = useCallback(
    (excId: string) => {
      const exc = exceptions.find((e) => e.id === excId);
      if (!exc) return;
      const next = exc.currentStep + 1;
      const done = next >= exc.steps.length;

      setExceptions((prev) =>
        prev.map((e) =>
          e.id === excId
            ? { ...e, currentStep: next, status: done ? 'Resolved' : 'In Progress' }
            : e
        )
      );

      if (done) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === exc.orderId
              ? {
                  ...o,
                  flagged: false,
                  timeline: [
                    ...o.timeline,
                    { stage: o.stage, label: `Exception resolved: ${exc.type}`, time: nowTime() },
                  ],
                }
              : o
          )
        );
        pushToast('success', `${exc.id} resolved`, `${exc.type} on ${exc.orderId} cleared.`);
      }
    },
    [exceptions, pushToast]
  );

  const replenish = useCallback(
    (sku: string, qty: number) => {
      setProducts((prev) =>
        prev.map((p) => (p.sku === sku ? { ...p, incoming: p.incoming + qty } : p))
      );
      pushToast('info', 'Replenishment raised', `${qty} units of ${sku} added to incoming.`);
    },
    [pushToast]
  );

  const rebalanceZone = useCallback(
    (zoneId: string) => {
      setZones((prev) =>
        prev.map((z) => {
          if (z.id === zoneId) {
            return {
              ...z,
              pickers: z.pickers + 2,
              workload: Math.max(35, z.workload - 28),
              status: 'Busy',
              recommendation: undefined,
            };
          }
          if (z.id === 'zone-d') {
            return { ...z, pickers: Math.max(0, z.pickers - 2), workload: Math.min(100, z.workload + 10) };
          }
          return z;
        })
      );
      pushToast('success', 'Pickers reassigned', '2 pickers moved. Workload rebalanced.');
    },
    [pushToast]
  );

  const value = useMemo<WarehouseContextValue>(
    () => ({
      products,
      orders,
      workers,
      zones,
      exceptions,
      toasts,
      pushToast,
      dismissToast,
      approveAllocation,
      assignPicker,
      startException,
      advanceException,
      replenish,
      rebalanceZone,
    }),
    [
      products,
      orders,
      workers,
      zones,
      exceptions,
      toasts,
      pushToast,
      dismissToast,
      approveAllocation,
      assignPicker,
      startException,
      advanceException,
      replenish,
      rebalanceZone,
    ]
  );

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>;
}

export function useWarehouse(): WarehouseContextValue {
  const ctx = useContext(WarehouseContext);
  if (!ctx) throw new Error('useWarehouse must be used within WarehouseProvider');
  return ctx;
}
