export const INVENTORY_EVENTS = {
  ITEM_ADDED: "inventory:itemAdded",
  ITEM_REMOVED: "inventory:itemRemoved",
  ITEM_UPDATED: "inventory:itemUpdated",
  INVENTORY_CHANGED: "inventory:changed",
  GET_ALL_ITEMS: "inventory:getAllItems",
  GET_GOLD: "inventory:getGold",
} as const;

export enum SYSTEM_EVENTS {
  ENABLE_MUSIC = "game:disableMusic",
  DISABLE_MUSIC = "game:enableMusic",
  SET_MERCHANT_STORE_UI = "game:setMerchantStoreUi",
}

export enum PLAYER_EVENTS {
  HEALTH_CHANGED = "player:health-changed",
  HEALTH_INITIALIZED = "player:health-initialized",
  MAX_HEALTH_CHANGED = "player:max-health-changed",
  SELECT_ITEM = "player:select-item",
  GET_PLAYER_STATS = "player:get-stats",
  INITIALIZE_PLAYER = "player:initialize",
}

export enum MERCHANT_EVENTS {
  GET_ITEMS = "merchant:get-items",
  BUY_ITEMS = "merchant:buy-items",
  SELL_ITEMS = "merchant:sell-items",
  GET_GOLD = "merchant:get-gold",
  TRANSACTION_RESULT = "merchant:transaction-result",
}



export interface EventPayloads {
  [PLAYER_EVENTS.HEALTH_CHANGED]: number;
  [PLAYER_EVENTS.HEALTH_INITIALIZED]: number;
  [PLAYER_EVENTS.MAX_HEALTH_CHANGED]: number;
  [PLAYER_EVENTS.SELECT_ITEM]: number;
  [SYSTEM_EVENTS.SET_MERCHANT_STORE_UI]: boolean;
}