export const INVENTORY_EVENTS = {
  ITEM_ADDED: "inventory:itemAdded",
  ITEM_REMOVED: "inventory:itemRemoved",
  ITEM_UPDATED: "inventory:itemUpdated",
  INVENTORY_CHANGED: "inventory:changed",
  GET_ALL_ITEMS: "inventory:getAllItems",
  GET_GOLD: "inventory:getGold",
} as const;

export const SYSTEM_EVENTS = {
  ENABLE_MUSIC: "game:disableMusic",
  DISABLE_MUSIC: "game:enableMusic",
};


export enum PLAYER_EVENTS {
  HEALTH_CHANGED = "player:health-changed",
  HEALTH_INITIALIZED = "player:health-initialized",
  MAX_HEALTH_CHANGED = "player:max-health-changed",
  SELECT_ITEM = "player:select-item",
  GET_PLAYER_STATS = "player:get-stats",
}

export interface EventPayloads {
  [PLAYER_EVENTS.HEALTH_CHANGED]: number;
  [PLAYER_EVENTS.HEALTH_INITIALIZED]: number;
  [PLAYER_EVENTS.MAX_HEALTH_CHANGED]: number;
  [PLAYER_EVENTS.SELECT_ITEM]: number;
}