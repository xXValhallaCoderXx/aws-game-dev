/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Character, CharacterConfig } from "./CharacterClass";

// PlayerCharacter.ts
export class PlayerCharacter extends Character {
  public inventory: { [itemName: string]: number } = {
    carrotSeeds: 5,
    raddishSeeds: 3,
    cauliflowerSeeds: 2,
  };

  constructor(config: CharacterConfig) {
    super(config);
    if (this.scene) {
      // Add null check
      this.cursors = this.scene.input.keyboard?.createCursorKeys();
    }
  }

  public setupAnimations(): void {
    // Walking animations
    this.scene.anims.create({
      key: this.animations.walkUp,
      frames: this.scene.anims.generateFrameNumbers(
        this.textureConfig.walkSheet,
        {
          start: 0,
          end: 5, // Frames for walking up
        }
      ),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.anims.create({
      key: this.animations.walkDown,
      frames: this.scene.anims.generateFrameNumbers(
        this.textureConfig.walkSheet,
        {
          start: 6,
          end: 11, // Frames for walking down
        }
      ),
      frameRate: 10,
      repeat: -1,
    });

    // Walking left and right remain the same
    this.scene.anims.create({
      key: this.animations.walkLeft,
      frames: this.scene.anims.generateFrameNumbers(
        this.textureConfig.walkSheet,
        {
          start: 12,
          end: 17,
        }
      ),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.anims.create({
      key: this.animations.walkRight,
      frames: this.scene.anims.generateFrameNumbers(
        this.textureConfig.walkSheet,
        {
          start: 18,
          end: 23,
        }
      ),
      frameRate: 10,
      repeat: -1,
    });

    // Idle animations
    this.scene.anims.create({
      key: this.animations.idleUp,
      frames: this.scene.anims.generateFrameNumbers(
        this.textureConfig.idleSheet,
        {
          start: 0,
          end: 5, // Frames for idle up
        }
      ),
      frameRate: 8,
      repeat: -1,
    });

    this.scene.anims.create({
      key: this.animations.idleDown,
      frames: this.scene.anims.generateFrameNumbers(
        this.textureConfig.idleSheet,
        {
          start: 6,
          end: 11, // Frames for idle down
        }
      ),
      frameRate: 8,
      repeat: -1,
    });

    // Idle left and right remain the same
    this.scene.anims.create({
      key: this.animations.idleLeft,
      frames: this.scene.anims.generateFrameNumbers(
        this.textureConfig.idleSheet,
        {
          start: 12,
          end: 17,
        }
      ),
      frameRate: 8,
      repeat: -1,
    });

    this.scene.anims.create({
      key: this.animations.idleRight,
      frames: this.scene.anims.generateFrameNumbers(
        this.textureConfig.idleSheet,
        {
          start: 18,
          end: 23,
        }
      ),
      frameRate: 8,
      repeat: -1,
    });
  }

  public handleMovement(): void {
    if (!this.cursors) return;

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

    // Play appropriate animation
    if (moving) {
      this.anims.play(
        // @ts-ignore
        this.animations[`walk${this.capitalize(this.facingDirection)}`],
        true
      );
    } else {
      this.anims.play(
        // @ts-ignore
        this.animations[`idle${this.capitalize(this.facingDirection)}`],
        true
      );
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
