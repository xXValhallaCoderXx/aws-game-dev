/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { EFarmingCrops } from "@slices/farming/farming.interface";

// Create a type that appends 'Seeds' to each crop type
type InventoryItem = `${EFarmingCrops}`;

// Define the Inventory type as a record where each key is an InventoryItem and the value is a number
type Inventory = Record<InventoryItem, number>;

export type { InventoryItem, Inventory };

export type Action = "walk" | "idle" | "harvest" | "attackOneHand";
export type CarryAction = "walk" | "idle";

export type AnimationKey = `${Action}${DirectionCapitalized}`;
export type AnimationKeyCarry = `${CarryAction}${DirectionCapitalized}`;

export type Direction = "up" | "down" | "left" | "right";
export type DirectionCapitalized = "Up" | "Down" | "Left" | "Right";

export interface Dialogue {
  speaker: string;
  text: string;
}

export interface DialogueBranch {
  key: string;
  dialogues: Dialogue[];
  choices?: {
    text: string;
    nextBranch: string;
  }[];
}

// Generic Interfaces

export interface PatrolPoint {
  x: number;
  y: number;
  waitTime?: number; // Time to wait at this point in milliseconds
}

// Character Interfaces

export interface BaseCharacterConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture: string;
  stats: CharacterStats;
}

export interface CharacterStats {
  health: number;
  speed: number;
  strength: number;
  maxHealth: number;
  defense: number;
  level?: number;
}

// Enemy Interfaces

export type IEnemyType =
  | "rat-epic"
  | "rat-normal"
  | "slime-epic"
  | "slime-normal"
  | "zombie-epic"
  | "zombie-normal";

export interface EnemyConfig extends BaseCharacterConfig {
  enemyType: IEnemyType;
  patrolPoints?: PatrolPoint[]; // Optional patrol points
  detectionRadius: number; // Adjusts value as needed
  attackRange: number; // 20 // Adjust based on the monster
  attackCooldown: number; // 1000 = 1 second cooldown between attacks
}

export interface PlayerConfig extends BaseCharacterConfig {}

export interface DamageData {
  damage: number;
  strength: number; // Enemy's strength stat
  sourcePosition: { x: number; y: number };
}

export interface KnockbackConfig {
  duration: number;
  minDistance: number;
  maxDistance: number;
  easing?: Function;
}
