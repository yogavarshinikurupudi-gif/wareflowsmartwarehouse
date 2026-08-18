export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type OrderStage =
  | 'Created'
  | 'Priority'
  | 'Inventory'
  | 'Allocation'
  | 'Picking'
  | 'Packing'
  | 'QC'
  | 'Dispatch';

export const STAGE_ORDER: OrderStage[] = [
  'Created',
  'Priority',
  'Inventory',
  'Allocation',
  'Picking',
  'Packing',
  'QC',
  'Dispatch',
];

export type CustomerTier = 'Premium' | 'Standard' | 'New';

export type StockStatus = 'Healthy' | 'Watch' | 'High Risk' | 'Stockout';

export interface Product {
  sku: string;
  name: string;
  category: string;
  zone: string;
  physical: number;
  reserved: number;
  damaged: number;
  incoming: number;
  projectedDemand: number;
  safetyStock: number;
}

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
}

export interface TimelineEvent {
  stage: OrderStage;
  label: string;
  time: string;
  note?: string;
}

export interface Order {
  id: string;
  customer: string;
  tier: CustomerTier;
  value: number;
  priority: Priority;
  priorityScore: number;
  deadlineMins: number;
  items: OrderItem[];
  stage: OrderStage;
  timeline: TimelineEvent[];
  assignedPicker?: string;
  flagged?: boolean;
}

export interface Worker {
  id: string;
  name: string;
  zone: string;
  assignedItems: number;
  performance: number;
  available: boolean;
}

export type ZoneStatus = 'Balanced' | 'Busy' | 'Bottleneck' | 'Idle';

export interface Zone {
  id: string;
  name: string;
  workload: number;
  activeOrders: number;
  pickers: number;
  status: ZoneStatus;
  recommendation?: string;
}

export type ExceptionType =
  | 'Missing item'
  | 'Damaged item'
  | 'Stock shortage'
  | 'Picking delay'
  | 'Packing issue'
  | 'QC failure';

export type ExceptionStatus = 'Open' | 'In Progress' | 'Resolved';

export interface Exception {
  id: string;
  orderId: string;
  type: ExceptionType;
  severity: 'Critical' | 'Warning' | 'Info';
  detail: string;
  steps: string[];
  status: ExceptionStatus;
  currentStep: number;
  createdAt: string;
}

export type ToastKind = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}
