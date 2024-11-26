// AnimationManager.ts
import Phaser from "phaser";

export class AnimationManager {
  /**
   * Initializes all animations required for the game.
   * @param scene The current Phaser scene.
   */
  static initialize(scene: Phaser.Scene) {
    this.createPlayerAnimations(scene);
    this.createMonsterAnimations(scene);
    // Initialize animations for other entities...
  }

  static createPlayerAnimations(scene: Phaser.Scene) {
    const animations = [
      {
        key: "player-walk-up",
        frames: scene.anims.generateFrameNumbers("player", {
          start: 0,
          end: 3,
        }),
        frameRate: 10,
        repeat: -1,
      },
      // Define other player animations...
    ];

    animations.forEach((anim) => {
      if (!scene.anims.exists(anim.key)) {
        scene.anims.create(anim);
      } else {
        console.warn(`Animation key already exists: ${anim.key}`);
      }
    });
  }

  static createMonsterAnimations(scene: Phaser.Scene) {
    const animations = [
      {
        key: "monster-walk-left",
        frames: scene.anims.generateFrameNumbers("monster", {
          start: 0,
          end: 3,
        }),
        frameRate: 8,
        repeat: -1,
      },
      // Define other monster animations...
    ];

    animations.forEach((anim) => {
      if (!scene.anims.exists(anim.key)) {
        scene.anims.create(anim);
      } else {
        console.warn(`Animation key already exists: ${anim.key}`);
      }
    });
  }
}
