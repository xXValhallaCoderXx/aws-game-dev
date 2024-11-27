/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Character } from "./CharacterClass";
import { Inventory, CharacterConfig } from "./player-character.interface";

export class PlayerCharacter extends Character {
  public isCarrying: boolean = false;
  public carriedItem?: string; // The type of seed being carried
  public isHarvesting: boolean = false;

  public inventory: Inventory = {
    carrotSeeds: 5,
    radishSeeds: 3,
    cauliflowerSeeds: 2,
  };

  constructor(config: CharacterConfig) {
    super(config);
    if (this.scene) {
      // Add null check
      this.cursors = this.scene.input.keyboard?.createCursorKeys();
      this.setDepth(10); // Arbitrary high value
    }
  }

  /**
   * Handles player movement and plays corresponding animations.
   */
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
      ? `player-carry-${action}-${this.facingDirection}`
      : this.isHarvesting
      ? `player-harvest-${this.facingDirection}`
      : `player-${action}-${this.facingDirection}`;

    // Play the animation if it's not already playing
    if (this.anims.currentAnim?.key !== animationKey) {
      this.anims.play(animationKey, true);
      console.log(`Playing animation: ${animationKey}`);
    }
  }

  /**
   * Initiates the harvesting action with animation.
   * @param onComplete Callback to execute after harvesting.
   */
  public startHarvesting(onComplete: () => void): void {
    if (this.isHarvesting) return;

    this.isHarvesting = true;

    // Stop the player from moving
    this.setVelocity(0);

    // Play the harvesting animation
    const animationKey = `player-harvest-${this.facingDirection}`;
    this.anims.play(animationKey);

    // Listen for animation completion
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isHarvesting = false;

      // Call the onComplete callback
      onComplete();

      // Return to idle animation
      const idleAnimKey = this.isCarrying
        ? `player-carry-idle-${this.facingDirection}`
        : `player-idle-${this.facingDirection}`;
      this.anims.play(idleAnimKey);
    });
  }
}
