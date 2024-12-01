/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CharacterConfig, Inventory } from "./player-character.interface";
import { AnimationManager } from "../animations/animations-manager";
import { BaseCharacter } from "./BaseCharacter";

type Action = "walk" | "idle" | "harvest";
type CarryAction = "walk" | "idle";
type DirectionCapitalized = "Up" | "Down" | "Left" | "Right";
type AnimationKey = `${Action}${DirectionCapitalized}`;
type AnimationKeyCarry = `${CarryAction}${DirectionCapitalized}`;

// NOTE - May need to make animationsCreated static to ensure only 1 instance

export class PlayerCharacter extends BaseCharacter {
  // Add properties for carrying items
  public isCarrying: boolean = false;
  public carriedItem?: string; // The type of seed being carried

  public isHarvesting: boolean = false;

  public inventory: Inventory = {
    carrotSeeds: 5,
    radishSeeds: 3,
    cauliflowerSeeds: 2,
  };
  public animations: Record<AnimationKey, string> = {
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

  public carryAnimations: Record<AnimationKeyCarry, string> = {
    walkUp: "player-carry-walk-up",
    walkDown: "player-carry-walk-down",
    walkLeft: "player-carry-walk-left",
    walkRight: "player-carry-walk-right",
    idleUp: "player-carry-idle-up",
    idleDown: "player-carry-idle-down",
    idleLeft: "player-carry-idle-left",
    idleRight: "player-carry-idle-right",
  };

  constructor(config: CharacterConfig) {
    super(config);
    if (this.scene) {
      // Add null check
      this.cursors = this.scene.input.keyboard?.createCursorKeys();
      this.setDepth(10); // Arbitrary high value
    }
  }

  public setupAnimations(): void {
    // Define normal animations
    Object.entries(this.animations).forEach(([key, animKey]) => {
      const [action] = key.match(/([a-z]+)(Up|Down|Left|Right)/)!.slice(1);
      console.log("ANIM KEY: ", animKey);
      AnimationManager.defineAnimation(this.scene, {
        key: animKey,
        frames: { start: 0, end: 5 }, // Adjust frame ranges as per your sprite sheet
        frameRate: action === "walk" ? 10 : 8,
        repeat: action === "harvest" ? 1 : -1,
      });
    });

    // Define carry animations
    Object.entries(this.carryAnimations).forEach(([key, animKey]) => {
      const [action] = key.match(/([a-z]+)(Up|Down|Left|Right)/)!.slice(1);
      AnimationManager.defineAnimation(this.scene, {
        key: animKey,
        frames: { start: 0, end: 5 }, // Adjust frame ranges as per your sprite sheet
        frameRate: action === "walk" ? 10 : 8,
        repeat: -1,
      });
    });
  }

  public handleMovement(): void {
    if (!this.cursors) return;

    // Prevent movement if harvesting
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
    const directionCapitalized = this.capitalize(this.facingDirection);
    let animationKey: string;

    if (this.isCarrying) {
      // Use carry animations
      animationKey = this.carryAnimations[`${action}${directionCapitalized}`];
    } else {
      // Use normal animations
      animationKey = this.animations[`${action}${directionCapitalized}`];
    }
    console.log("ANIMATIONS KEY: ", animationKey);
    // Play the animation if it's not already playing
    // if (this.anims.currentAnim?.key !== animationKey) {
    //   this.anims.play(animationKey, true);
    // }
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
