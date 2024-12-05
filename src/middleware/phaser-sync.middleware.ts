/* eslint-disable @typescript-eslint/no-explicit-any */
// src/shared/middleware/phaser-sync.middleware.ts
import { Middleware } from "@reduxjs/toolkit";
import { PhaserEventBus } from "@services/phaser.service";
import { INVENTORY_EVENTS } from "@/slices/events/events.types";
import {
  updateItems,
  setSelectedItem,
} from "@slices/inventory/inventory.slice";

import { InventoryItem } from "@/slices/inventory/inventory.interface";

export const phaserSyncMiddleware: Middleware =
  () => (next) => (action: any) => {
    // Handle Redux -> Phaser sync
    if (action.type === "inventory/setSelectedItem") {
      PhaserEventBus.emit("inventory:seedSelected", action.payload);
    }

    const result = next(action);

    return result;
  };

// Set up event listeners for Phaser -> Redux sync
export const initializePhaserSync = (store: any) => {
  PhaserEventBus.on("inventory:update", (items: any) => {
    store.dispatch(updateItems(items));
  });

  PhaserEventBus.on(
    INVENTORY_EVENTS.GET_ALL_ITEMS,
    (items: InventoryItem[]) => {
      store.dispatch(updateItems(items));
    }
  );

  PhaserEventBus.on("inventory:itemSelected", (itemId: any) => {
    store.dispatch(setSelectedItem(itemId));
  });
};
