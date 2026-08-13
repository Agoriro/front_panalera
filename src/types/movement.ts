import { InventoryItem } from './inventory';
import { Supplier } from './catalog';

export type MovementType = 'BUY' | 'SELL';

export interface Movement {
  id: string;
  id_inventory: string;
  type_movement: MovementType;
  id_supplier: string | null;
  quantity: number;
  value: number; // cost value for BUY, sale price for SELL
  created_at: string;
  inventory?: InventoryItem;
  supplier?: Supplier | null;
}

export interface MovementFormInput {
  id_inventory: string;
  type_movement: MovementType;
  id_supplier: string | null;
  quantity: number;
  value: number;
}
