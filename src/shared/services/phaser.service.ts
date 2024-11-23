import Phaser from "phaser";
import { Preloader } from "../../scenes/Preloader";
import { Game } from "../../scenes/Game";
import { HomeMap } from "../../scenes/HomeMap";
import { CameraMap } from "../../scenes/Camera";

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE, // Allow the canvas to resize with the window
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800, // Fixed game width
    height: 600, // Fixed game height
  },
  parent: "game-container",
  // backgroundColor: "#028af8",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: [Preloader, CameraMap, HomeMap, Game],
};

// Used to emit events between React components and Phaser scenes
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter
export const PhaserEventBus = new Phaser.Events.EventEmitter();
