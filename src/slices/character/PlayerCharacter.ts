/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Character, CharacterConfig } from "./CharacterClass";

export class PlayerCharacter extends Character {
  constructor(config: CharacterConfig) {
    super(config);
  }

  // Override to set up player-specific animations
  public setupAnimations(): void {
    // Create animations using this.animations keys
    this.scene.anims.create({
      key: this.animations.idleDown,
      frames: [{ key: this.texture.key, frame: "walk-1.png" }],
    });

    this.scene.anims.create({
      key: this.animations.idleUp,
      frames: [{ key: this.texture.key, frame: "walk-up-1.png" }],
    });

    this.scene.anims.create({
      key: this.animations.idleSide,
      frames: [{ key: this.texture.key, frame: "walk-side-1.png" }],
    });

    this.scene.anims.create({
      key: this.animations.moveDown,
      frames: this.scene.anims.generateFrameNames(this.texture.key, {
        prefix: "walk-",
        start: 1,
        end: 4,
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 5,
    });

    this.scene.anims.create({
      key: this.animations.moveUp,
      frames: this.scene.anims.generateFrameNames(this.texture.key, {
        prefix: "walk-up-",
        start: 1,
        end: 4,
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 5,
    });

    this.scene.anims.create({
      key: this.animations.moveSide,
      frames: this.scene.anims.generateFrameNames(this.texture.key, {
        prefix: "walk-side-",
        start: 1,
        end: 4,
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 5,
    });
  }

  // Override to implement player movement
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
      this.setFlipX(false);
      moving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = this.speed;
      this.setFlipX(true);
      moving = true;
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      velocityY = -this.speed;
      moving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = this.speed;
      moving = true;
    }

    // Normalize speed if moving diagonally
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= Math.SQRT1_2;
      velocityY *= Math.SQRT1_2;
    }

    // Set the character's velocity
    this.setVelocity(velocityX, velocityY);

    // Determine facing direction for animation
    if (velocityY < 0) {
      this.facingDirection = "up";
    } else if (velocityY > 0) {
      this.facingDirection = "down";
    } else if (velocityX !== 0) {
      this.facingDirection = "side";
    }

    // Play animations
    if (moving) {
      this.anims.play(
        // @ts-ignore
        this.animations[`move${this.capitalize(this.facingDirection)}`],
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

  private capitalize(direction: string): string {
    return direction.charAt(0).toUpperCase() + direction.slice(1);
  }
}
