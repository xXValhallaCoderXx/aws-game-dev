import Phaser from "phaser";

const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "phaser-container", // exactly equal to the div id in html
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [], // put scences into the array
};

export default phaserConfig;
