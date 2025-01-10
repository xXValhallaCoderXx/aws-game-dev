import { ICON_SPRITE_SHEETS } from "@/shared/constants/sprite-sheet-names";
import {
  GameItem,
  ItemCategory,
  ItemRarity,
  GAME_ITEM_KEYS,
} from "./items.interface";

export const ITEM_REGISTRY: Record<string, GameItem> = {
  [GAME_ITEM_KEYS.HEALTH_POTION_SMALL]: {
    id: GAME_ITEM_KEYS.HEALTH_POTION_SMALL,
    name: "Small Health Potion",
    description: "Restores a small amount of health",
    category: ItemCategory.CONSUMABLE,
    rarity: ItemRarity.COMMON,
    sprite: {
      name: ICON_SPRITE_SHEETS.POTIONS.file,
      frame: 0, // Update with actual frame number
      size: 16,
      path: ICON_SPRITE_SHEETS.POTIONS.path,
    },
    stackable: true,
    maxStack: 99,
    effects: [
      {
        type: "heal",
        value: 20,
        description: "Heals 20 HP",
      },
    ],
    value: 50,
  },
  [GAME_ITEM_KEYS.CARROT_SEEDS]: {
    id: GAME_ITEM_KEYS.CARROT_SEEDS,
    name: "Carrot Seeds",
    description: "Plant these to grow carrot crops",
    category: ItemCategory.SEED,
    rarity: ItemRarity.COMMON,
    sprite: {
      name: ICON_SPRITE_SHEETS.FARMING.file,
      frame: 26, // Update with actual frame number
      size: 16,
      path: ICON_SPRITE_SHEETS.FARMING.path,
    },
    stackable: true,
    maxStack: 99,
    effects: [],
    value: 10,
  },
  [GAME_ITEM_KEYS.RADISH_SEEDS]: {
    id: GAME_ITEM_KEYS.RADISH_SEEDS,
    name: "Carrot Seeds",
    description: "Plant these to grow carrot crops",
    category: ItemCategory.SEED,
    rarity: ItemRarity.COMMON,
    sprite: {
      name: ICON_SPRITE_SHEETS.FARMING.file,
      frame: 27, // Update with actual frame number
      size: 16,
      path: ICON_SPRITE_SHEETS.FARMING.path,
    },
    stackable: true,
    maxStack: 99,
    effects: [],
    value: 10,
  },
  [GAME_ITEM_KEYS.CAULIFLOWER_SEEDS]: {
    id: GAME_ITEM_KEYS.CAULIFLOWER_SEEDS,
    name: "Carrot Seeds",
    description: "Plant these to grow carrot crops",
    category: ItemCategory.SEED,
    rarity: ItemRarity.COMMON,
    sprite: {
      name: ICON_SPRITE_SHEETS.FARMING.file,
      frame: 26, // Update with actual frame number
      size: 16,
      path: ICON_SPRITE_SHEETS.FARMING.path,
    },
    stackable: true,
    maxStack: 99,
    effects: [],
    value: 10,
  },
  [GAME_ITEM_KEYS.BASIC_SWORD]: {
    id: GAME_ITEM_KEYS.BASIC_SWORD,
    name: "Basic Sword",
    description: "A simple sword - for slaying beasts",
    category: ItemCategory.WEAPON,
    rarity: ItemRarity.COMMON,
    sprite: {
      name: ICON_SPRITE_SHEETS.POTIONS.file,
      frame: 0, // Update with actual frame number
      size: 16,
      path: ICON_SPRITE_SHEETS.POTIONS.path,
    },
    stackable: true,
    maxStack: 99,
    effects: [],
    value: 10,
  },
};
