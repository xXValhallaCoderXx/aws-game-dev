/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene } from "phaser";
import { ESCENE_KEYS } from "../shared/scene-keys";
import { AnimationManager } from "../slices/animations/animations-manager";
import { animationConfigs } from "../slices/animations/animation-config";

export class Preloader extends Scene {
  constructor() {
    super(ESCENE_KEYS.PRELOADER);
  }

  init() {}

  preload() {
    this.load.image("grass", "tiles/grass.png");
    this.load.image("hills", "tiles/hills.png");
    this.load.image("tilled_dirt", "tiles/tilled_dirt.png");
    this.load.spritesheet("seed-packets", "sprites/crops/seed-packets.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet(
      "harvested-crop",
      "sprites/crops/crops-harvested.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );

    // Dynamically load all necessary spritesheets based on animationConfigs
    animationConfigs.forEach((config) => {
      const { entity, actions } = config;

      Object.values(actions).forEach((actionConfig) => {
        const { suffix } = actionConfig;
        const textureKey = suffix
          ? `${entity}-${suffix}`
          : `${entity}-${actionConfig}`;

        const filePath = `sprites/characters/player/${textureKey}.png`; // Adjust path as needed
        const frameWidth = 64; // Adjust frame width as per your spritesheet
        const frameHeight = 64; // Adjust frame height as per your spritesheet

        this.load.spritesheet(textureKey, filePath, {
          frameWidth,
          frameHeight,
        });
      });
    });
  }

  create() {
    AnimationManager.initialize(this);

    // Start the main game scene after loading animations
    this.scene.start(ESCENE_KEYS.CAMERA);
  }
}
