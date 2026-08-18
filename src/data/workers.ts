import type { Worker, Zone } from '@/types';

export const INITIAL_WORKERS: Worker[] = [
  { id: 'W1', name: 'Arun Kapoor', zone: 'Zone B', assignedItems: 3, performance: 96, available: true },
  { id: 'W2', name: 'Meera Nair', zone: 'Zone A', assignedItems: 8, performance: 91, available: false },
  { id: 'W3', name: 'Sofia Reyes', zone: 'Zone C', assignedItems: 5, performance: 88, available: true },
  { id: 'W4', name: 'Liam Okafor', zone: 'Zone B', assignedItems: 9, performance: 84, available: false },
  { id: 'W5', name: 'Hana Suzuki', zone: 'Zone D', assignedItems: 2, performance: 93, available: true },
  { id: 'W6', name: 'Diego Alvarez', zone: 'Zone A', assignedItems: 6, performance: 79, available: true },
  { id: 'W7', name: 'Priya Menon', zone: 'Zone C', assignedItems: 4, performance: 90, available: true },
  { id: 'W8', name: 'Tomas Novak', zone: 'Zone D', assignedItems: 7, performance: 82, available: false },
  { id: 'W9', name: 'Grace Kim', zone: 'Zone B', assignedItems: 1, performance: 95, available: true },
  { id: 'W10', name: 'Omar Haddad', zone: 'Zone A', assignedItems: 5, performance: 86, available: true },
];

export const INITIAL_ZONES: Zone[] = [
  { id: 'receiving', name: 'Receiving', workload: 42, activeOrders: 6, pickers: 2, status: 'Balanced' },
  { id: 'zone-a', name: 'Zone A', workload: 61, activeOrders: 12, pickers: 3, status: 'Busy' },
  {
    id: 'zone-b',
    name: 'Zone B',
    workload: 87,
    activeOrders: 18,
    pickers: 3,
    status: 'Bottleneck',
    recommendation: 'Move 2 pickers to Zone B',
  },
  { id: 'zone-c', name: 'Zone C', workload: 54, activeOrders: 9, pickers: 3, status: 'Balanced' },
  { id: 'zone-d', name: 'Zone D', workload: 28, activeOrders: 4, pickers: 2, status: 'Idle' },
  { id: 'packing', name: 'Packing', workload: 66, activeOrders: 11, pickers: 3, status: 'Busy' },
  { id: 'qc', name: 'QC', workload: 39, activeOrders: 5, pickers: 2, status: 'Balanced' },
  { id: 'dispatch', name: 'Dispatch', workload: 48, activeOrders: 7, pickers: 2, status: 'Balanced' },
];
