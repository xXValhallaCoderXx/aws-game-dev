/* eslint-disable @typescript-eslint/no-explicit-any */
import Phaser from "phaser";

const debugDrawer = (layer: any, scene: Phaser.Scene) => {
  const debugGraphics = scene.add.graphics().setAlpha(0.75);
  layer?.renderDebug(debugGraphics, {
    tileColor: null,
    collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
    faceColor: new Phaser.Display.Color(40, 39, 37, 255),
  });
};

export default debugDrawer;
