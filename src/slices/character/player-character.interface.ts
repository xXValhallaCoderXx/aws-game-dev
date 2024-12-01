import { EFarmingCropTypes } from "@slices/farming/farming.interface";

// Create a type that appends 'Seeds' to each crop type
type InventoryItem = `${EFarmingCropTypes}Seeds`;

// Define the Inventory type as a record where each key is an InventoryItem and the value is a number
type Inventory = Record<InventoryItem, number>;

export type { InventoryItem, Inventory };


export interface AnimationKeys {
  walkUp: string;
  walkDown: string;
  walkLeft: string;
  walkRight: string;
  idleUp: string;
  idleDown: string;
  idleLeft: string;
  idleRight: string;
  harvestUp?: string;
  harvestDown?: string;
  harvestLeft?: string;
  harvestRight?: string;
}

export interface TextureConfig {
  key: string;
  walkSheet: string;
  idleSheet: string;
  harvestSheet?: string; // Optional
}

export interface CharacterConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  speed: number;
  texture: TextureConfig;
  animations: AnimationKeys;
}

export type CharacterFaceDirection = "up" | "down" | "left" | "right";