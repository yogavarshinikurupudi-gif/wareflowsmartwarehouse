import { NavProvider, useNav } from '@/store/nav';
import { WarehouseProvider } from '@/store/WarehouseContext';
import { Layout } from '@/components/Layout';
import { Toaster } from '@/components/Toaster';
import { CommandCenter } from '@/pages/CommandCenter';
import { Orders } from '@/pages/Orders';
import { Inventory } from '@/pages/Inventory';
import { SmartAllocation } from '@/pages/SmartAllocation';
import { PickPack } from '@/pages/PickPack';
import { Exceptions } from '@/pages/Exceptions';
import { WarehouseMap } from '@/pages/WarehouseMap';
import { Analytics } from '@/pages/Analytics';
import { DecisionCenter } from '@/pages/DecisionCenter';

function Router() {
  const { page } = useNav();
  switch (page) {
    case 'command':
      return <CommandCenter />;
    case 'orders':
      return <Orders />;
    case 'inventory':
      return <Inventory />;
    case 'allocation':
      return <SmartAllocation />;
    case 'pickpack':
      return <PickPack />;
    case 'exceptions':
      return <Exceptions />;
    case 'map':
      return <WarehouseMap />;
    case 'analytics':
      return <Analytics />;
    case 'decisions':
      return <DecisionCenter />;
    default:
      return <CommandCenter />;
  }
}

export default function App() {
  return (
    <WarehouseProvider>
      <NavProvider>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </NavProvider>
    </WarehouseProvider>
  );
}
