/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene } from "phaser";
import { ESCENE_KEYS } from "../shared/scene-keys";

export class Preloader extends Scene {
  constructor() {
    super(ESCENE_KEYS.PRELOADER);
  }

  init() {}

  preload() {
    this.load.image("grass", "tiles/grass.png");
    this.load.image("hills", "tiles/hills.png");
    this.load.image("tilled_dirt", "tiles/tilled_dirt.png");

    this.load.spritesheet(
      "guide-walk",
      "sprites/characters/guide/guide-walk.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    this.load.spritesheet(
      "guide-idle",
      "sprites/characters/guide/guide-idle.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    this.load.spritesheet(
      "player-walk",
      "sprites/characters/player/player-walk.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    this.load.spritesheet(
      "player-idle",
      "sprites/characters/player/player-idle.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    // Load the carry walking sprite sheet
    this.load.spritesheet(
      "player-carry-walk",
      "sprites/characters/player/player-carry-walk.png",
      {
        frameWidth: 80, // Replace with actual frame width
        frameHeight: 80, // Replace with actual frame height
      }
    );

    // Load the carry idle sprite sheet
    this.load.spritesheet(
      "player-carry-idle",
      "sprites/characters/player/player-carry-idle.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    // Load Crop pull
    this.load.spritesheet(
      "player-harvest",
      "sprites/characters/player/player-crop-pull.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );
    this.load.spritesheet("seed-packets", "sprites/crops/seed-packets.png", {
      frameWidth: 16,
      frameHeight: 16,
    });


    this.load.spritesheet(
      "harvested-crops",
      "sprites/crops/crops-harvested.png",
      {
        frameWidth: 16, // Width of each frame
        frameHeight: 16, // Height of each frame
      }
    );
  }

  create() {
    this.scene.start(ESCENE_KEYS.HOME_MAP);
  }
}
