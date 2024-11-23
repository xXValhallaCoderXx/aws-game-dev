// Character.ts
import Phaser from "phaser";

export interface CharacterConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture: string;
  frame?: string;
  speed?: number;
  animations?: CharacterAnimations;
}

export interface CharacterAnimations {
  idleDown: string;
  idleUp: string;
  idleSide: string;
  moveDown: string;
  moveUp: string;
  moveSide: string;
}

export class Character extends Phaser.Physics.Arcade.Sprite {
  public scene: Phaser.Scene;
  protected cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  protected speed: number = 100;
  protected facingDirection: "up" | "down" | "side" = "down";
  public animations: CharacterAnimations;

  constructor(config: CharacterConfig) {
    super(config.scene, config.x, config.y, config.texture, config.frame);

    this.scene = config.scene;
    this.speed = config.speed || 100;
    this.animations = config.animations || {
      idleDown: "idle-down",
      idleUp: "idle-up",
      idleSide: "idle-side",
      moveDown: "move-down",
      moveUp: "move-up",
      moveSide: "move-side",
    };

    // Enable physics
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setCollideWorldBounds(true);
  }

  // Method to set up animations if needed
  public setupAnimations(): void {
    // Implement animation setup if needed
  }

  // Method to handle movement
  public handleMovement(): void {
    // Implement in subclasses
  }

  // Optional method to assign input controls
  public setCursors(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    this.cursors = cursors;
  }
}
