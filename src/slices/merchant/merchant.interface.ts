// src/interfaces/merchant.interface.ts
export interface IMerchantInventoryItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  restockTime?: number; // Time in milliseconds
  description?: string;
  type: "weapon" | "armor" | "potion" | "misc";
}

export interface IMerchantConfig {
  id: string;
  name: string;
  type: "weaponsmith" | "alchemist" | "generalStore";
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
