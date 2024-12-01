/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BaseCharacter } from "./BaseChracter";
import { Inventory } from "./player-character.interface";
import {
  BaseCharacterConfig,
  DirectionCapitalized,
} from "./player-character.interface";

interface PlayerConfig extends BaseCharacterConfig {
  speed: number;
}

// NOTE - May need to make animationsCreated static to ensure only 1 instance
export class PlayerCharacter extends BaseCharacter {
  public carriedItem?: string;
  public isCarrying: boolean = false;
  public isHarvesting: boolean = false;
  public inventory: Inventory = {
    carrotSeeds: 5,
    radishSeeds: 3,
    cauliflowerSeeds: 2,
  };

  protected cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private speed: number;

  constructor(config: PlayerConfig) {
    super(config);
    if (this.scene) {
      // Add null check
      // this.cursors = this.scene.input.keyboard?.createCursorKeys();
      this.setDepth(10); // Arbitrary high value
    }
    this.speed = config.speed;

    // Initialize cursors with proper error handling
    if (!this.scene.input.keyboard) {
      throw new Error("Keyboard input not available in the current scene");
    }
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    this.carryAnimations = this.getCarryAnimations();
  }

  protected getDefaultAnimations(): Record<string, string> {
    return {
      walkUp: "player-walk-up",
      walkDown: "player-walk-down",
      walkLeft: "player-walk-left",
      walkRight: "player-walk-right",
      idleUp: "player-idle-up",
      idleDown: "player-idle-down",
      idleLeft: "player-idle-left",
      idleRight: "player-idle-right",
      harvestUp: "player-harvest-up",
      harvestDown: "player-harvest-down",
      harvestLeft: "player-harvest-left",
      harvestRight: "player-harvest-right",
    };
  }

  protected getCarryAnimations(): Record<string, string> {
    return {
      walkUp: "player-carry-walk-up",
      walkDown: "player-carry-walk-down",
      walkLeft: "player-carry-walk-left",
      walkRight: "player-carry-walk-right",
      idleUp: "player-carry-idle-up",
      idleDown: "player-carry-idle-down",
      idleLeft: "player-carry-idle-left",
      idleRight: "player-carry-idle-right",
    };
  }

  protected setupAnimations(): void {
    const directions = ["up", "down", "left", "right"];

    directions.forEach((direction, directionIndex) => {
      // Walk animations
      if (!this.scene.anims.exists(`player-walk-${direction}`)) {
        this.scene.anims.create({
          key: `player-walk-${direction}`,
          frames: this.scene.anims.generateFrameNumbers("player-walk", {
            // Each direction has 6 frames, so multiply directionIndex by 6
            start: directionIndex * 6,
            end: directionIndex * 6 + 5,
          }),
          frameRate: 10,
          repeat: -1,
        });
      }

      // Idle animations
      if (!this.scene.anims.exists(`player-idle-${direction}`)) {
        this.scene.anims.create({
          key: `player-idle-${direction}`,
          frames: this.scene.anims.generateFrameNumbers("player-idle", {
            start: directionIndex * 6,
            end: directionIndex * 6 + 5,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }

      // Carry walk animations
      if (!this.scene.anims.exists(`player-carry-walk-${direction}`)) {
        this.scene.anims.create({
          key: `player-carry-walk-${direction}`,
          frames: this.scene.anims.generateFrameNumbers("player-carry-walk", {
            start: directionIndex * 6,
            end: directionIndex * 6 + 5,
          }),
          frameRate: 10,
          repeat: -1,
        });
      }

      // Carry idle animations
      if (!this.scene.anims.exists(`player-carry-idle-${direction}`)) {
        this.scene.anims.create({
          key: `player-carry-idle-${direction}`,
          frames: this.scene.anims.generateFrameNumbers("player-carry-idle", {
            start: directionIndex * 6,
            end: directionIndex * 6 + 5,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }

      // Harvest animations
      if (!this.scene.anims.exists(`player-harvest-${direction}`)) {
        this.scene.anims.create({
          key: `player-harvest-${direction}`,
          frames: this.scene.anims.generateFrameNumbers("player-harvest", {
            start: directionIndex * 6,
            end: directionIndex * 6 + 5,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    // Start with idle animation
    this.play("player-idle-down");
  }

  public handleMovement(): void {
    if (!this.cursors) return;

    // Do not allow movement if harvesting
    if (this.isHarvesting) {
      this.setVelocity(0);
      return;
    }

    let velocityX = 0;
    let velocityY = 0;
    let moving = false;

    // Reset velocity
    this.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      velocityX = -this.speed;
      this.facingDirection = "left";
      moving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = this.speed;
      this.facingDirection = "right";
      moving = true;
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      velocityY = -this.speed;
      this.facingDirection = "up";
      moving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = this.speed;
      this.facingDirection = "down";
      moving = true;
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= Math.SQRT1_2;
      velocityY *= Math.SQRT1_2;
    }

    // Set velocity
    this.setVelocity(velocityX, velocityY);

    // Determine the appropriate animation key
    const action = moving ? "walk" : "idle";
    const animationKey = this.isCarrying
      ? this.carryAnimations[
          `${action}${this.capitalize(this.facingDirection)}`
        ]
      : this.animations[`${action}${this.capitalize(this.facingDirection)}`];

    // Play the animation if it's not already playing
    if (this.anims.currentAnim?.key !== animationKey) {
      this.play(animationKey, true);
    }
  }

  public startHarvesting(onComplete: () => void): void {
    if (this.isHarvesting) return;

    this.isHarvesting = true;

    // Stop the player from moving
    this.setVelocity(0);

    // Get current direction
    const directionCapitalized = this.capitalize(
      this.facingDirection
    ) as DirectionCapitalized;

    // Play the harvesting animation

    const animationKey = this.animations[`harvest${directionCapitalized}`];
    console.log("HARVESTING - ANIMATION KEY: ", animationKey);
    this.anims.play(animationKey);

    // Listen for animation completion
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isHarvesting = false;

      // Call the onComplete callback
      onComplete();

      // Return to idle animation

      const idleAnimKey = this.isCarrying
        ? this.carryAnimations[`idle${directionCapitalized}`]
        : this.animations[`idle${directionCapitalized}`];
      this.anims.play(idleAnimKey);
    });
  }
}
