import Phaser from "phaser";
import { Preloader } from "../../scenes/Preloader";
import { Game } from "../../scenes/Game";
import { HomeMap } from "../../scenes/HomeMap";

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 480,
  height: 480,
  scale: {
    zoom: 3,
  },
  // zoom: 3, // Since we're wor
  parent: "game-container",
  backgroundColor: "#028af8",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [Preloader, HomeMap, Game],
};

// Used to emit events between React components and Phaser scenes
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter
export const PhaserEventBus = new Phaser.Events.EventEmitter();
