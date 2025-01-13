// src/interfaces/merchant.interface.ts

import { InventoryItem } from "../inventory/inventory.interface";

export interface IMerchantInventoryItem extends InventoryItem {
  price: number;

  maxQuantity: number;
  restockTime?: number; // Time in milliseconds
}



export interface IMerchantConfig {
  id: string;
  name: string;
  type: "merchant-blacksmith" | "merchant-general";
  startingGold: number;
  maxGold: number;
  restockInterval: number; // Time in milliseconds
  possibleItems: IMerchantInventoryItem[];
  dialogue: {
    greeting: string[];
    farewell: string[];
    noGold: string[];
    playerNoGold: string[];
  };
}
