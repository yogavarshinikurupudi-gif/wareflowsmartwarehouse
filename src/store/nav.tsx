import { createContext, useContext, useState, type ReactNode } from 'react';

export type PageId =
  | 'command'
  | 'orders'
  | 'inventory'
  | 'allocation'
  | 'pickpack'
  | 'exceptions'
  | 'map'
  | 'analytics'
  | 'decisions';

interface NavValue {
  page: PageId;
  focusOrder?: string;
  navigate: (page: PageId, focusOrder?: string) => void;
}

const NavContext = createContext<NavValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<PageId>('command');
  const [focusOrder, setFocusOrder] = useState<string | undefined>('ORD-204');

  const navigate = (next: PageId, order?: string) => {
    setPage(next);
    if (order !== undefined) setFocusOrder(order);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavContext.Provider value={{ page, focusOrder, navigate }}>{children}</NavContext.Provider>
  );
}

export function useNav(): NavValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
