/* eslint-disable @typescript-eslint/no-explicit-any */
import Phaser from "phaser";
import { Game } from "./scenes/Game";
import { Preloader } from "./scenes/Preloader";

// Find out more information about the Game Config at:
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 480,
  scale: {
    zoom: 2,
  },
  // zoom: 3, // Since we're wor
  parent: "game-container",
  backgroundColor: "#028af8",
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: [Preloader, Game],
};

const StartGame = (parent: any) => {
  return new Phaser.Game({ ...config, parent });
};

export default StartGame;
