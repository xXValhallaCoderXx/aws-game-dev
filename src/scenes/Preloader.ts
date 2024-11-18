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
    this.load.tilemapTiledJSON("main-map", "tiles/main-map.json");
    this.load.atlas(
      "player",
      "characters/main/main-character.png",
      "characters/main/main-character.json"
    );
  }

  create() {
    this.scene.start(ESCENE_KEYS.GAME);
  }
}
