import { Scene } from "phaser";
import {
  BaseCharacterConfig,
  Direction,
  DirectionCapitalized,
} from "./player-character.interface";

export abstract class BaseCharacter extends Phaser.Physics.Arcade.Sprite {
  public scene: Scene;
  public facingDirection: Direction = "down"; // Default facing direction
  protected animations: Record<string, string> = {};
  protected carryAnimations: Record<string, string> = {};

  constructor(config: BaseCharacterConfig) {
    // Call the parent class constructor with texture key and initial position
    super(config.scene, config.x, config.y, config.texture);
    this.scene = config.scene;

    // Add sprite to scene
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 0.5);

    if (this.body) {
      // **Adjust the physics body to match the sprite**
      this.body.setSize(16, 16);
    }

    // Set up animations and store them in the animations property
    this.animations = this.getDefaultAnimations();
    this.setupAnimations();
  }

  protected abstract setupAnimations(): void;
  protected abstract getDefaultAnimations(): Record<string, string>;

  protected capitalize(str: Direction): DirectionCapitalized {
    return (str.charAt(0).toUpperCase() + str.slice(1)) as DirectionCapitalized;
  }

  public getFacingDirection(): Direction {
    return this.facingDirection;
  }

  public setFacingDirection(direction: Direction): void {
    this.facingDirection = direction;
  }
}
