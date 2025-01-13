/* eslint-disable @typescript-eslint/no-explicit-any */
// src/shared/middleware/phaser-sync.middleware.ts
import { Middleware } from "@reduxjs/toolkit";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import {
  PLAYER_EVENTS,
  INVENTORY_EVENTS,
  SYSTEM_EVENTS,
  EventPayloads,
  MERCHANT_EVENTS,
} from "@/slices/events/phaser-events.types";
import {
  updateItems,
  setSelectedItem,
  setGold,
} from "@slices/inventory/inventory.slice";
import {
  toggleSound,
  enableSound,
  disableSound,
  setIsMerchantStoreOpen,
  setMerchantItems,
} from "@/slices/platform/game.slice";
import {
  updateHealth,
  updateMaxHealth,
} from "@/slices/character/player-character.slice";
import { InventoryItem } from "@/slices/inventory/inventory.interface";
// import { PLAYER_EVENTS } from "@/slices/events/phaser-events.types";

export const phaserSyncMiddleware: Middleware =
  () => (next) => (action: any) => {
    // Handle Redux -> Phaser sync
    // if (action.type === "inventory/setSelectedItem") {
    //   console.log("SELECT ITEM - REDUX: ", action.payload);
    //   PhaserEventBus.emit("inventory:seedSelected", action.payload);
    // }

    if (action.type === toggleSound.type) {
      if (action.payload) {
        PhaserEventBus.emit(SYSTEM_EVENTS.ENABLE_MUSIC);
      } else {
        PhaserEventBus.emit(SYSTEM_EVENTS.DISABLE_MUSIC);
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

  PhaserEventBus.on(SYSTEM_EVENTS.SET_MERCHANT_STORE_UI, (isOpen: boolean) => {
    store.dispatch(setIsMerchantStoreOpen(isOpen));
  });

  PhaserEventBus.on(MERCHANT_EVENTS.GET_ITEMS, (data: any) => {
    store.dispatch(setMerchantItems(data));
  });

  PhaserEventBus.on(INVENTORY_EVENTS.GET_GOLD, (gold: number) => {
    store.dispatch(setGold(gold));
  });

  PhaserEventBus.on(SYSTEM_EVENTS.ENABLE_MUSIC, () => {
    console.log("PHASER MIDDLEWARE - EVENT ON - ENABLE MUSIC");
    store.dispatch(enableSound());
  });

  PhaserEventBus.on(SYSTEM_EVENTS.DISABLE_MUSIC, () => {
    console.log("PHASER MIDDLEWARE - EVENT ON - DISABLE_MUSIC");
    store.dispatch(disableSound());
  });

  PhaserEventBus.on(PLAYER_EVENTS.SELECT_ITEM, (itemId: string) => {
    store.dispatch(setSelectedItem(itemId));
  });

  PhaserEventBus.on(
    PLAYER_EVENTS.HEALTH_INITIALIZED,
    (health: EventPayloads[PLAYER_EVENTS.HEALTH_INITIALIZED]) => {
      store.dispatch(updateHealth(health));
    }
  );

  // Listen for health changes
  PhaserEventBus.on(
    PLAYER_EVENTS.HEALTH_CHANGED,
    (health: EventPayloads[PLAYER_EVENTS.HEALTH_CHANGED]) => {
      store.dispatch(updateHealth(health));
    }
  );

  // Listen for max health changes
  PhaserEventBus.on(
    PLAYER_EVENTS.MAX_HEALTH_CHANGED,
    (maxHealth: EventPayloads[PLAYER_EVENTS.MAX_HEALTH_CHANGED]) => {
      store.dispatch(updateMaxHealth(maxHealth));
    }
  );
};
