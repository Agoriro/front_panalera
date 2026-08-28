import { InventoryItem } from './inventory';
import { Supplier } from './catalog';

export type MovementType = 'BUY' | 'SELL';

export interface Movement {
  id: string;
  id_inventory: string;
  type_movement: MovementType;
  id_supplier: string | null;
  quantity: number;
  value: string;
  unit_cost: string;
  created_at: string;
  inventory?: InventoryItem;
  supplier?: Supplier | null;
}

export interface MovementFormInput {
  id_inventory: string;
  quantity: number;
}

export interface PurchaseFormInput extends MovementFormInput {
  id_supplier: string;
  value: number;
}

export interface SaleFormInput extends MovementFormInput {
  value: number;
}
