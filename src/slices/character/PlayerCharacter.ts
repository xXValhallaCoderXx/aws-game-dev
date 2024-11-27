/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Character, CharacterConfig } from "./CharacterClass";
import { Inventory } from "./player-character.interface";

type Action = "walk" | "idle" | "harvest";
type CarryActions = "walk" | "idle";
type Direction = "up" | "down" | "left" | "right";
type DirectionCapitalized = "Up" | "Down" | "Left" | "Right";
type AnimationKey = `${Action}${DirectionCapitalized}`;
type AnimationKeyCarry = `${CarryActions}${DirectionCapitalized}`;

// NOTE - May need to make animationsCreated static to ensure only 1 instance
export class PlayerCharacter extends Character {
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
    const normalFrames = {
      walkUp: { start: 0, end: 5 },
      walkDown: { start: 6, end: 11 },
      walkLeft: { start: 12, end: 17 },
      walkRight: { start: 18, end: 23 },
      idleUp: { start: 0, end: 5 },
      idleDown: { start: 6, end: 11 },
      idleLeft: { start: 12, end: 17 },
      idleRight: { start: 18, end: 23 },
      harvestUp: { start: 0, end: 5 },
      harvestDown: { start: 6, end: 11 },
      harvestLeft: { start: 12, end: 17 },
      harvestRight: { start: 18, end: 23 },
    };

    const frameRates = {
      walk: 10,
      idle: 8,
      harvest: 8,
    };

    // Create normal animations
    this.createCharacterAnimations(
      this.animations,
      {
        walk: this.textureConfig.walkSheet,
        idle: this.textureConfig.idleSheet,
        harvest: this.textureConfig.harvestSheet,
      },
      normalFrames,
      frameRates
    );

    // Create carry animations
    this.createCharacterAnimations(
      this.carryAnimations,
      {
        walk: "player-carry-walk",
        idle: "player-carry-idle",
        harvest: "player-harvest",
      },
      normalFrames, // Assuming frames are the same
      frameRates
    );
  }

  private createCharacterAnimations(
    animationKeys: { [key: string]: string },
    textureKeys: { [key: string]: string },
    frames: { [key: string]: { start: number; end: number } },
    frameRates: { [key: string]: number }
  ) {
    const directions = ["Up", "Down", "Left", "Right"];
    const actions = ["walk", "idle", "harvest"];

    actions.forEach((action) => {
      directions.forEach((direction) => {
        const animKey = animationKeys[`${action}${direction}`];
        const textureKey = textureKeys[action];
        const frameConfig = frames[`${action}${direction}`];
        const frameRate = frameRates[action];

        // **Check if animation already exists before creating**
        if (!this.scene.anims.exists(animKey)) {
          this.scene.anims.create({
            key: animKey,
            frames: this.scene.anims.generateFrameNumbers(
              textureKey,
              frameConfig
            ),
            frameRate: frameRate,
            repeat: action === "harvest" ? 1 : -1,
          });
        } else {
          console.warn(`Animation key already exists: ${animKey}`);
        }
      });
    });
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
    const directionCapitalized = this.capitalize(this.facingDirection);
    let animationKey: string;

    if (this.isCarrying) {
      // Use carry animations
      animationKey = this.carryAnimations[`${action}${directionCapitalized}`];
    } else {
      // Use normal animations
      animationKey = this.animations[`${action}${directionCapitalized}`];
    }

    // Play the animation if it's not already playing
    if (this.anims.currentAnim?.key !== animationKey) {
      this.anims.play(animationKey, true);
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

  private capitalize(str: Direction): DirectionCapitalized {
    return (str.charAt(0).toUpperCase() + str.slice(1)) as DirectionCapitalized;
  }
}
