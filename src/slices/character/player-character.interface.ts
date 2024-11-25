import { EFarmingCropTypes } from "../farming/farming.interface";

// Create a type that appends 'Seeds' to each crop type
type InventoryItem = `${EFarmingCropTypes}Seeds`;

// Define the Inventory type as a record where each key is an InventoryItem and the value is a number
type Inventory = Record<InventoryItem, number>;

export type { InventoryItem, Inventory };
