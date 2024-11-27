// AnimationManager.ts
import Phaser from "phaser";
import { AnimationConfig } from "./antimations.interface";
import { animationConfigs } from "./animation-config";

const DIRECTION_OFFSETS: { [direction: string]: number } = {
  up: 0,
  down: 6,
  left: 12,
  right: 18,
};

export class AnimationManager {
  /**
   * Initializes all animations required for the game.
   * @param scene The current Phaser scene.
   */
  static initialize(scene: Phaser.Scene): void {
    animationConfigs.forEach((config) => {
      this.createAnimationsForEntity(scene, config);
    });
  }

  /**
   * Creates animations for a specific entity based on its configuration.
   * @param scene The current Phaser scene.
   * @param config The animation configuration for the entity.
   */
  private static createAnimationsForEntity(
    scene: Phaser.Scene,
    config: AnimationConfig
  ): void {
    const { entity, actions, directions } = config;

    Object.entries(actions).forEach(([action, actionConfig]) => {
      const { frameConfig, frameRate, repeat, suffix } = actionConfig;
      const stateSuffix = suffix ? `${suffix}-` : "";

      directions.forEach((direction) => {
        let animKey: string;
        const startFrame = frameConfig.start + DIRECTION_OFFSETS[direction];
        const endFrame = frameConfig.end + DIRECTION_OFFSETS[direction];

        // Construct the animation key
        if (action.startsWith("carry")) {
          // Handle carry-related actions
          const carryAction = action.replace("carry", "").toLowerCase(); // e.g., 'carryWalk' -> 'walk'
          animKey = `${entity}-${stateSuffix}${carryAction}-${direction}`; // e.g., 'player-carry-walk-left'
        } else {
          // Regular actions
          animKey = `${entity}-${action}-${direction}`; // e.g., 'player-walk-left'
        }

        // Generate frames with adjusted frame numbers
        const frames = scene.anims.generateFrameNumbers(
          suffix ? `${entity}-${suffix}` : `${entity}-${action}`,
          { start: startFrame, end: endFrame }
        );

        // Create the animation
        this.createAnimation(scene, animKey, frames, frameRate, repeat);
      });
    });
  }

  /**
   * Creates a single animation if it does not already exist.
   * @param scene The current Phaser scene.
   * @param key The unique key for the animation.
   * @param frames The frame numbers to use for the animation.
   * @param frameRate The frame rate of the animation.
   * @param repeat The repeat count or boolean for the animation.
   */
  private static createAnimation(
    scene: Phaser.Scene,
    key: string,
    frames:
      | Phaser.Types.Animations.GenerateFrameNumbers
      | Phaser.Types.Animations.AnimationFrame[],
    frameRate: number,
    repeat: number | boolean
  ): void {
    if (!scene.anims.exists(key)) {
      scene.anims.create({
        key,
        frames,
        frameRate,
        repeat: typeof repeat === "boolean" ? (repeat ? -1 : 0) : repeat,
      });
      console.log(`Created animation: ${key}`);
    } else {
      console.warn(`Animation key already exists: ${key}`);
    }
  }
}
