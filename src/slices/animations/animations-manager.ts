import Phaser from "phaser";

interface AnimationDefinition {
  key: string;
  frames: Phaser.Types.Animations.GenerateFrameNumbers;
  frameRate: number;
  repeat: number;
}

export class AnimationManager {
  private static animationsDefined: Set<string> = new Set();

  /**
   * Defines an animation if it hasn't been defined already.
   * @param scene The Phaser scene.
   * @param definition The animation definition.
   */
  public static defineAnimation(
    scene: Phaser.Scene,
    definition: AnimationDefinition
  ) {
    if (this.animationsDefined.has(definition.key)) {
      return; // Animation already defined
    }

    scene.anims.create({
      key: definition.key,
      frames: scene.anims.generateFrameNumbers(
        definition.key,
        definition.frames
      ),
      frameRate: definition.frameRate,
      repeat: definition.repeat,
    });

    this.animationsDefined.add(definition.key);
  }
}
