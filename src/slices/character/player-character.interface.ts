import { EFarmingCropTypes } from "@slices/farming/farming.interface";

// Create a type that appends 'Seeds' to each crop type
type InventoryItem = `${EFarmingCropTypes}Seeds`;

// Define the Inventory type as a record where each key is an InventoryItem and the value is a number
type Inventory = Record<InventoryItem, number>;

export type { InventoryItem, Inventory };

export type Direction = "up" | "down" | "left" | "right";
export type DirectionCapitalized = "Up" | "Down" | "Left" | "Right";

export interface BaseCharacterConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture: string;
}


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
