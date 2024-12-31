/* eslint-disable @typescript-eslint/no-explicit-any */
// src/shared/middleware/phaser-sync.middleware.ts
import { Middleware } from "@reduxjs/toolkit";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import {
  INVENTORY_EVENTS,
  PLATFORM_EVENTS,
} from "@/slices/events/events.types";
import {
  updateItems,
  setSelectedItem,
} from "@slices/inventory/inventory.slice";
import {
  toggleSound,
  enableSound,
  disableSound,
} from "@/slices/platform/game.slice";
import { InventoryItem } from "@/slices/inventory/inventory.interface";

export const phaserSyncMiddleware: Middleware =
  () => (next) => (action: any) => {
    // Handle Redux -> Phaser sync
    if (action.type === "inventory/setSelectedItem") {
      console.log("SET INVETORY");
      PhaserEventBus.emit("inventory:seedSelected", action.payload);
    }

    if (action.type === toggleSound.type) {
      if (action.payload) {
        PhaserEventBus.emit(PLATFORM_EVENTS.ENABLE_MUSIC);
      } else {
        PhaserEventBus.emit(PLATFORM_EVENTS.DISABLE_MUSIC);
      }
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

  PhaserEventBus.on(PLATFORM_EVENTS.ENABLE_MUSIC, () => {
    console.log("PHASER MIDDLEWARE - EVENT ON - ENABLE MUSIC");
    store.dispatch(enableSound());
  });

  PhaserEventBus.on(PLATFORM_EVENTS.DISABLE_MUSIC, () => {
    console.log("PHASER MIDDLEWARE - EVENT ON - DISABLE_MUSIC");
    store.dispatch(disableSound());
  });

  PhaserEventBus.on("inventory:itemSelected", (itemId: any) => {
    store.dispatch(setSelectedItem(itemId));
  });
};
