/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene } from "phaser";
import { ESCENE_KEYS } from "../shared/scene-keys";

export class HomeMap extends Scene {
  private hillsLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private map: Phaser.Tilemaps.Tilemap | null = null;
  private animatedTiles: any | null = [];
  private waterAnimatedLayer: any | null = null;

  constructor() {
    super(ESCENE_KEYS.HOME_MAP);
  }

  init() {}

  preload() {
    this.load.tilemapTiledJSON("home-map", "maps/home-map.json");
    this.load.image("water-base", "tilesets/water-blank.png");
    // this.load.image("water-animated", "tilesets/water-main-animated.png");
    // this.load.image("buildings", "tilesets/buildings-main.png");
  }

  create() {
    this.createMap();

    // Store animation data
  }

  update(time: any, delta: any) {
    this.animatedTiles.forEach((tile: any) => {
      // Increment elapsed time
      tile.elapsedTime += delta;

      // Get the current frame from the animation
      const currentFrame = tile.animation[tile.frameIndex];

      // Check if it's time to switch to the next frame
      if (tile.elapsedTime >= currentFrame.duration) {
        // Move to the next frame
        tile.frameIndex = (tile.frameIndex + 1) % tile.animation.length;

        // Reset elapsed time for the next frame
        tile.elapsedTime -= currentFrame.duration;

        // Get the next frame
        const nextFrame = tile.animation[tile.frameIndex];
        console.log("NEXT FRAME: ", nextFrame);
        console.log("CURRENT FRAME: ", currentFrame);
        // Replace the tile on the map
        this.waterAnimatedLayer.replaceByIndex(
          currentFrame.tileid + 1,
          nextFrame.tileid + 1
        );
      }
    });
  }

  private createMap() {
    const map = this.make.tilemap({ key: "home-map" });
    const waterTileset = map.addTilesetImage("water-blank", "water-base");
    // const animatedWaterTileset = map.addTilesetImage(
    //   "water-main-animated",
    //   "water-animated"
    // );
    // // const buildingsTileset = map.addTilesetImage("buildings-main", "buildings");
    this.animatedTiles = [];
    const tileData: any = map.tilesets[0]?.tileData;
    if (tileData) {
      for (const key in tileData) {
        const tile = tileData[key];

        if (tile.animation) {
          this.animatedTiles.push({
            tileId: tile.id,
            animation: tile.animation,
            frameIndex: 0,
            elapsedTime: 0,
          });
        }
      }
    }

    if (!waterTileset) {
      throw new Error("Failed to load water tileset");
    }
    this.waterAnimatedLayer = map.createLayer(
      "WaterBaseLayer",
      waterTileset,
      0,
      0
    );
  }
}
