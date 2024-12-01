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
      // Regular animations
      ["walk", "idle"].forEach((action) => {
        const baseKey = `player-${action}-${direction}`;
        const spritesheet = `player-${action}`;

        if (!this.scene.anims.exists(baseKey)) {
          this.scene.anims.create({
            key: baseKey,
            frames: this.scene.anims.generateFrameNumbers(spritesheet, {
              start: directionIndex * 6,
              end: directionIndex * 6 + 5,
            }),
            frameRate: action === "walk" ? 10 : 8,
            repeat: -1,
          });
        }
      });

      // Carry animations
      ["walk", "idle"].forEach((action) => {
        const baseKey = `player-carry-${action}-${direction}`;
        const spritesheet = `player-carry-${action}`;

        if (!this.scene.anims.exists(baseKey)) {
          this.scene.anims.create({
            key: baseKey,
            frames: this.scene.anims.generateFrameNumbers(spritesheet, {
              start: directionIndex * 6,
              end: directionIndex * 6 + 5,
            }),
            frameRate: action === "walk" ? 10 : 8,
            repeat: -1,
          });
        }
      });

      // Harvest animation
      const harvestKey = `player-harvest-${direction}`;
      if (!this.scene.anims.exists(harvestKey)) {
        this.scene.anims.create({
          key: harvestKey,
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

    this.setVelocity(velocityX, velocityY);

    // Determine animation
    const action = moving ? "walk" : "idle";
    // const direction = this.capitalize(this.facingDirection);
    let animationKey: string;

    if (this.isCarrying) {
      animationKey = `player-carry-${action.toLowerCase()}-${
        this.facingDirection
      }`;
    } else {
      animationKey = `player-${action.toLowerCase()}-${this.facingDirection}`;
    }

    // Only change animation if it's different from the current one
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
