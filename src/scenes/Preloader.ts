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
      "player-walk",
      "sprites/characters/Charlie/charlie-walk.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );
    
    this.load.spritesheet(
      "player-idle",
      "sprites/characters/Charlie/charlie-idle.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );
  }

  create() {
    this.scene.start(ESCENE_KEYS.CAMERA);
  }
}
