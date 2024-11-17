/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {}

  preload() {
    this.load.image("tiles", "tiles/Dungeon.png");
  }

  create() {
    this.scene.start("Game");
  }
}
