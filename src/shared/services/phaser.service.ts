import Phaser from "phaser";
import { Preloader } from "../../scenes/Preloader";
import { Game } from "../../scenes/Game";
import { HomeMap } from "../../scenes/HomeMap";
import { CameraMap } from "../../scenes/Camera";

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,

  parent: "game-container",
  // backgroundColor: "#028af8",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [Preloader, CameraMap, HomeMap, Game],
};

// Used to emit events between React components and Phaser scenes
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter
export const PhaserEventBus = new Phaser.Events.EventEmitter();
