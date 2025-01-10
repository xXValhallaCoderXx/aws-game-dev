import { GAME_ITEM_KEYS } from "../items/items.interface";

export interface InventoryItem {
  id: GAME_ITEM_KEYS;
  quantity: number;
}

export interface InventoryModifyDTO {
  id: GAME_ITEM_KEYS;
  quantity: number;
}
