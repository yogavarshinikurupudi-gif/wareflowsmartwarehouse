import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Sparkles,
  ClipboardCheck,
  TriangleAlert,
  Map,
  BarChart3,
  Gavel,
  Warehouse,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { useNav, type PageId } from '@/store/nav';
import { useWarehouse } from '@/store/WarehouseContext';

const NAV: Array<{ id: PageId; label: string; icon: typeof Package; accent: string }> = [
  { id: 'command', label: 'Command Center', icon: LayoutDashboard, accent: 'text-brand-blue' },
  { id: 'orders', label: 'Orders', icon: Package, accent: 'text-brand-blue' },
  { id: 'inventory', label: 'Inventory', icon: Boxes, accent: 'text-brand-green' },
  { id: 'allocation', label: 'Smart Allocation', icon: Sparkles, accent: 'text-brand-purple' },
  { id: 'pickpack', label: 'Pick & Pack', icon: ClipboardCheck, accent: 'text-brand-orange' },
  { id: 'exceptions', label: 'Exceptions', icon: TriangleAlert, accent: 'text-brand-red' },
  { id: 'map', label: 'Warehouse Map', icon: Map, accent: 'text-brand-orange' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, accent: 'text-brand-blue' },
  { id: 'decisions', label: 'Decision Center', icon: Gavel, accent: 'text-brand-purple' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { page, navigate } = useNav();
  const { exceptions, orders } = useWarehouse();
  const [open, setOpen] = useState(false);

  const openExceptions = exceptions.filter((e) => e.status !== 'Resolved').length;
  const current = NAV.find((n) => n.id === page);

  const NavList = () => (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = page === item.id;
        const badge = item.id === 'exceptions' ? openExceptions : undefined;
        return (
          <button
            key={item.id}
            onClick={() => {
              navigate(item.id);
              setOpen(false);
            }}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? 'bg-slate-100 text-ink shadow-sm'
                : 'text-muted hover:bg-slate-50 hover:text-ink'
            }`}
          >
            <Icon className={`h-[18px] w-[18px] ${active ? item.accent : 'text-slate-400 group-hover:text-ink'}`} />
            <span className="flex-1 text-left">{item.label}</span>
            {badge ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-red px-1.5 text-[11px] font-bold text-white">
                {badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-canvas">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <Brand />
        <div className="mt-2 flex-1 overflow-y-auto pb-6">
          <NavList />
        </div>
        <FooterCard />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-lift animate-slide-in">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setOpen(false)} className="mr-4 rounded-lg p-2 text-muted hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex-1 overflow-y-auto pb-6">
              <NavList />
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-muted hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-ink sm:text-lg">{current?.label}</h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-brand-green ring-1 ring-green-200 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-green" />
            Live · {orders.length} orders
          </div>
          <button className="relative rounded-lg p-2 text-muted hover:bg-slate-100">
            <Bell className="h-5 w-5" />
            {openExceptions > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-red" />
            )}
          </button>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-6 py-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple shadow-md">
        <Warehouse className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-base font-extrabold leading-none text-ink">WareFlow</p>
        <p className="mt-1 text-[11px] font-medium text-muted">One decision ahead</p>
      </div>
    </div>
  );
}

function FooterCard() {
  return (
    <div className="m-3 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 p-4 ring-1 ring-slate-200">
      <p className="text-xs font-semibold text-ink">Exception → Decision → Resolution</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted">
        WareFlow doesn't just show data. It recommends the next move.
      </p>
    </div>
  );
}
