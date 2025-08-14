export interface InventoryItem {
  id?: string;
  itemName: string;
  requested: number;
  onHand?: number;
  received?: number;
  missing?: number;
  verified?: boolean;
  returned?: boolean;
  custodian: string;
  location: string;
  email: string;
  phone?: string;
  expendable: boolean;
  timestamp?: number;
}

export interface RequestItem {
  id?: string;
  itemName: string;
  requested: number;
  custodian: string;
  location: string;
  email: string;
  phone?: string;
  expendable: boolean;
  timestamp: number;
}

export type ItemStatus = 'missing' | 'received' | 'assigned' | 'returned';

export interface StatusFilter {
  status: ItemStatus | null;
  label: string;
  color: string;
}
