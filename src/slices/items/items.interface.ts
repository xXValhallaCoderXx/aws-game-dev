export interface GameItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  stackable: boolean;
  maxStack: number;
  value: number;
  stats?: ItemStats;
  effects?: ItemEffect[];
  sprite: ItemSprite;
}

export enum GAME_ITEM_KEYS {
  HEALTH_POTION_SMALL = "health-potion-small",
  CARROT_SEEDS = "carrot-seed",
  CAULIFLOWER_SEEDS = "cauliflower-seed",
  RADISH_SEEDS = "radish-seed",
  BASIC_SWORD = "basic-sword",
  GOLDEN_SWORD = "golden-sword",
}

export enum ItemCategory {
  CONSUMABLE = "consumable",
  EQUIPMENT = "equipment",
  MATERIAL = "material",
  SEED = "seed",
  WEAPON = "weapon",
  GEM = "gem",
}

export enum ItemRarity {
  COMMON = "common",
  UNCOMMON = "uncommon",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary",
}

export interface ItemEffect {
  type: string;
  value: number;
  duration?: number;
  description: string;
}

export interface ItemStats {
  health?: number;
  strength?: number;
  defense?: number;
  speed?: number;
  weight?: number;
  damage?: {
    minDamage: number;
    maxDamage: number;
  };
}

export interface ItemSprite {
  spritesheetName: string; // Name of the spritesheet
  spriteFrame: number; // Frame number in the spritesheet
  spriteSize: number; // Pixel size of sprite
  spritesheetWidth: number;
  filepath: string;
}

