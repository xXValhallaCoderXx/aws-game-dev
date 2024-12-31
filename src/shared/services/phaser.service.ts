import Phaser from "phaser";
import { Preloader } from "@scenes/Preloader";
import { HomeMap } from "@scenes/HomeMap";
import { HomeBuilding } from "@scenes/HomeBuilding";
import { IntroCutScene } from "@scenes/CutScenes/IntroCutScene";
import { TownMap } from "@/scenes/TownMap";
import { soundManager } from "@/slices/music-manager/SoundManager";

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
      debug: false,
    },
  },
  scene: [Preloader, IntroCutScene, HomeMap, HomeBuilding, TownMap],
  callbacks: {
    postBoot: (game) => {
      soundManager.init(game);
    },
  },
};

