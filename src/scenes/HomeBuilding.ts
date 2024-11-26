/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "../shared/scene-keys";

export class HomeBuilding extends BaseScene {
  constructor() {
    super(ESCENE_KEYS.HOME_HOUSE);
  }

  init() {
    console.log("HOME HOUSE");
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("building-map", "maps/home-building-map.json");
    this.load.image(
      "building-interior-floors",
      "tilesets/building-interior-floors.png"
    );
    this.load.image(
      "building-interior-mixed",
      "tilesets/building-interior-mixed.png"
    );
    this.load.image(
      "building-interior-objects",
      "tilesets/building-interior-objects.png"
    );
    this.load.image(
      "building-interior-walls",
      "tilesets/building-interior-walls.png"
    );
    this.load.image(
      "building-interior-windows",
      "tilesets/building-interior-windows.png"
    );

    this.load.audio("backgroundMusic", "sounds/main-bgm.mp3");
  }

  create() {
    // First create the map
    this.createMap();

    // Then call parent's create which will handle player creation and camera setup
    super.create();
  }

  protected createMap(): void {
    this.map = this.make.tilemap({ key: "building-map" });

    const interiorFloorsTileset = this.map.addTilesetImage(
      "building-interior-floors",
      "building-interior-floors"
    );

    const interiorWallsTileset = this.map.addTilesetImage(
      "building-interior-walls",
      "building-interior-walls"
    );

    if (!interiorFloorsTileset || !interiorWallsTileset) {
      throw new Error("Failed to load interior floors tileset");
    }

    this.map.createLayer("FloorsBaseLayer", interiorFloorsTileset, 0, 0);
    this.map.createLayer("WallBaseLayer", interiorWallsTileset, 0, 0);

    // if (this.waterLayer) {
    //   this.waterLayer.setCollisionByProperty({ collides: true });
    // }

    // if (this.waterAnimatedLayer) {
    //   this.waterAnimatedLayer.setCollisionByProperty({ collides: true });
    // }
  }
}
