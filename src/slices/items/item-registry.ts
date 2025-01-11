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
      spritesheetName: ICON_SPRITE_SHEETS.POTIONS.file,
      spriteFrame: 42, // Update with actual frame number
      spriteSize: 16,
      filepath: ICON_SPRITE_SHEETS.POTIONS.path,
      spritesheetWidth: ICON_SPRITE_SHEETS.POTIONS.width,
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
  [GAME_ITEM_KEYS.STRENGTH_POTION_LARGE]: {
    id: GAME_ITEM_KEYS.STRENGTH_POTION_LARGE,
    name: "Large Strength Potion",
    description: "Increase strength for a longer amount of time",
    category: ItemCategory.CONSUMABLE,
    rarity: ItemRarity.RARE,
    sprite: {
      spritesheetName: ICON_SPRITE_SHEETS.POTIONS.file,
      spriteFrame: 108, // Update with actual frame number
      spriteSize: 16,
      filepath: ICON_SPRITE_SHEETS.POTIONS.path,
      spritesheetWidth: ICON_SPRITE_SHEETS.POTIONS.width,
    },
    stackable: true,
    maxStack: 99,
    effects: [
      {
        type: "strength",
        value: 10,
        description: "Increases strength for 120 seconds",
      },
    ],
    value: 300,
  },
  [GAME_ITEM_KEYS.STRENGTH_POTION_SMALL]: {
    id: GAME_ITEM_KEYS.STRENGTH_POTION_SMALL,
    name: "Small Strength Potion",
    description: "Increase strength for a short amount of time",
    category: ItemCategory.CONSUMABLE,
    rarity: ItemRarity.RARE,
    sprite: {
      spritesheetName: ICON_SPRITE_SHEETS.POTIONS.file,
      spriteFrame: 110, // Update with actual frame number
      spriteSize: 16,
      filepath: ICON_SPRITE_SHEETS.POTIONS.path,
      spritesheetWidth: ICON_SPRITE_SHEETS.POTIONS.width,
    },
    stackable: true,
    maxStack: 99,
    effects: [
      {
        type: "strength",
        value: 10,
        description: "Increases strength for 30 seconds",
      },
    ],
    value: 300,
  },
  [GAME_ITEM_KEYS.HEALTH_POTION_LARGE]: {
    id: GAME_ITEM_KEYS.HEALTH_POTION_LARGE,
    name: "Large Health Potion",
    description: "Restores a large amount of health",
    category: ItemCategory.CONSUMABLE,
    rarity: ItemRarity.UNCOMMON,
    sprite: {
      spritesheetName: ICON_SPRITE_SHEETS.POTIONS.file,
      spriteFrame: 36, // Update with actual frame number
      spriteSize: 16,
      filepath: ICON_SPRITE_SHEETS.POTIONS.path,
      spritesheetWidth: ICON_SPRITE_SHEETS.POTIONS.width,
    },
    stackable: true,
    maxStack: 99,
    effects: [
      {
        type: "heal",
        value: 60,
        description: "Heals 60 HP",
      },
    ],
    value: 150,
  },
  [GAME_ITEM_KEYS.CARROT_SEEDS]: {
    id: GAME_ITEM_KEYS.CARROT_SEEDS,
    name: "Carrot Seeds",
    description: "Plant these to grow carrot crops",
    category: ItemCategory.SEED,
    rarity: ItemRarity.COMMON,
    sprite: {
      spritesheetName: ICON_SPRITE_SHEETS.FARMING.file,
      spriteFrame: 26, // Update with actual frame number
      spriteSize: 16,
      filepath: ICON_SPRITE_SHEETS.FARMING.path,
      spritesheetWidth: ICON_SPRITE_SHEETS.FARMING.width,
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
      spritesheetName: ICON_SPRITE_SHEETS.FARMING.file,
      spriteFrame: 68, // Update with actual frame number
      spriteSize: 16,
      filepath: ICON_SPRITE_SHEETS.FARMING.path,
      spritesheetWidth: ICON_SPRITE_SHEETS.FARMING.width,
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
      spritesheetName: ICON_SPRITE_SHEETS.FARMING.file,
      spriteFrame: 278, // Update with actual frame number
      spriteSize: 16,
      filepath: ICON_SPRITE_SHEETS.FARMING.path,
      spritesheetWidth: ICON_SPRITE_SHEETS.FARMING.width,
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
      spritesheetName: ICON_SPRITE_SHEETS.BLACKSMITH_ICONS.file,
      spriteFrame: 466, // Update with actual frame number
      spriteSize: 16,
      filepath: ICON_SPRITE_SHEETS.BLACKSMITH_ICONS.path,
      spritesheetWidth: ICON_SPRITE_SHEETS.BLACKSMITH_ICONS.width,
    },
    stats: {
      weight: 2,
      damage: {
        minDamage: 5,
        maxDamage: 10,
      },
    },
    stackable: true,
    maxStack: 99,
    effects: [],
    value: 10,
  },
  [GAME_ITEM_KEYS.GOLDEN_SWORD]: {
    id: GAME_ITEM_KEYS.GOLDEN_SWORD,
    name: "Golden Sword",
    description: "A simple sword - for slaying beasts",
    category: ItemCategory.WEAPON,
    rarity: ItemRarity.RARE,
    sprite: {
      spritesheetName: ICON_SPRITE_SHEETS.BLACKSMITH_ICONS.file,
      spriteFrame: 467, // Update with actual frame number
      spriteSize: 16,
      filepath: ICON_SPRITE_SHEETS.BLACKSMITH_ICONS.path,
      spritesheetWidth: ICON_SPRITE_SHEETS.BLACKSMITH_ICONS.width,
    },
    stats: {
      weight: 2,
      damage: {
        minDamage: 45,
        maxDamage: 60,
      },
    },
    stackable: true,
    maxStack: 99,
    effects: [],
    value: 10,
  },
};
