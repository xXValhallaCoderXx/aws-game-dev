/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { EFarmingCrops } from "@slices/farming/farming.interface";
import { ItemStats } from "../items/items.interface";

// Create a type that appends 'Seeds' to each crop type
type InventoryItem = `${EFarmingCrops}`;

// Define the Inventory type as a record where each key is an InventoryItem and the value is a number
type Inventory = Record<InventoryItem, number>;


export type { InventoryItem, Inventory };

export type PlayerSpecificActions =
  | "roll"
  | "attack-one-hand-sword"
  | "carry-idle"
  | "carry-walk"
  | "harvest";
export type IPlayerActionType = IActionType & PlayerSpecificActions;
export type IActionType =
  | "walk"
  | "idle"
  | "attack-one-hand"
  | "hit"
  | "critical-hit";
export type CarryAction = "walk" | "idle";

export type IAnimationKey = `${IActionType}-${Direction}`;
export interface BaseAnimationConfig {
  framesPerDirection: number;
  frameRate: number;
  repeat: number;
  spritesheet?: string; // Add this to support different spritesheets
}

export interface SequentialAnimationConfig extends BaseAnimationConfig {
  type: "sequential";
  frameStart: (dirIndex: number) => number;
  frameEnd: (dirIndex: number) => number;
}

export interface SpecificFramesAnimationConfig extends BaseAnimationConfig {
  type: "specific";
  frames: (dirIndex: number) => number[];
}

export interface CustomRangeAnimationConfig extends BaseAnimationConfig {
  type: "custom";
  customFrames: Record<Direction, { start: number; end: number }>;
}

export type IAnimationConfig =
  | SequentialAnimationConfig
  | SpecificFramesAnimationConfig
  | CustomRangeAnimationConfig;

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
  characterType: ICharacterType;
  directions?: Direction[];
}

export interface CharacterStats {
  health: number;
  speed: number;
  strength: number;
  maxHealth: number;
  defense: number;
  level?: number;
}

export type ICharacterType = IEnemyType | IPlayerType | INonPlayerCharacter;

export type IPlayerType = "player";
export type INonPlayerCharacter = "guide";

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
  strength: number; // Attacker's strength stat
  sourcePosition: { x: number; y: number };
  weaponStats?: ItemStats;
}

export interface KnockbackConfig {
  duration: number;
  minDistance: number;
  maxDistance: number;
  easing?: Function;
}
