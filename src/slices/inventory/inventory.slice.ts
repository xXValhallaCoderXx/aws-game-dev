// src/slices/inventory/inventory.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { InventoryItem } from "./inventory.interface";

interface InventoryState {
  items: InventoryItem[];
  selectedItem: string | null;
}

const initialState: InventoryState = {
  items: [],
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
  },
});

export const { updateItems, setSelectedItem } = inventorySlice.actions;
export default inventorySlice.reducer;
