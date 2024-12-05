export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: IFarmingInventoryCategories;
}

export type IFarmingInventoryCategories = "seeds" | "crops";