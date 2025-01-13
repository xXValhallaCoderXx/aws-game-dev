// src/slices/inventory/inventory.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { InventoryItem } from "./inventory.interface";

interface InventoryState {
  items: InventoryItem[];
  gold: number;
  selectedItem: string | null;
}

const initialState: InventoryState = {
  items: [],
  gold: 0,
  selectedItem: null,
};

export const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    updateItems: (state, action: PayloadAction<InventoryItem[]>) => {
      state.items = action.payload;
    },
    setSelectedItem: (state, action: PayloadAction<string | null>) => {
      state.selectedItem = action.payload;
    },
    setGold: (state, action: PayloadAction<number>) => {
      state.gold = action.payload;
    },
  },
});

export const { updateItems, setSelectedItem, setGold } = inventorySlice.actions;
export default inventorySlice.reducer;
