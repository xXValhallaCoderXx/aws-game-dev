/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene } from "phaser";
import { ESCENE_KEYS } from "../shared/scene-keys";

export class HomeMap extends Scene {
  private hillsLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private map: Phaser.Tilemaps.Tilemap | null = null;
  private animatedTiles: any | null = null;
  private waterAnimatedLayer: any | null = null;

  constructor() {
    super(ESCENE_KEYS.HOME_MAP);
  }

  init() {}

  preload() {
    this.load.tilemapTiledJSON("home-map", "maps/home-map.json");
    this.load.image("water-base", "tilesets/water-edges-animated.png");
    this.load.image("water-animated", "tilesets/water-main-animated.png");
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

    const waterTileset = map.addTilesetImage(
      "water-edges-animated",
      "water-base"
    );

    const animatedWaterTileset = map.addTilesetImage(
      "water-main-animated",
      "water-animated"
    );

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

    if (!waterTileset || !animatedWaterTileset) {
      throw new Error("Failed to load water tileset");
    }

    const waterBase = map.createLayer("WaterBase", waterTileset, 0, 0);
    this.waterAnimatedLayer = map.createLayer(
      "WaterAnimated",
      animatedWaterTileset,
      0,
      0
    );
    // map.createLayer("WaterBase", waterTileset, 0, 0);
    // const tileset = map.addTilesetImage("grass", "grass");
    // const tileset2 = map.addTilesetImage("hills", "hills");
    // const tileset3 = map.addTilesetImage("tilled_dirt", "tilled_dirt");
    // if (!tileset || !tileset2 || !tileset3) {
    //   throw new Error("Failed to load tilesets");
    // }
    // map.createLayer("GrassLayer", tileset, 0, 0);
    // this.hillsLayer = map.createLayer("HillsLayer", tileset2, 0, 0);
    // map.createLayer("GardenPlotLayer", tileset3, 0, 0);
    // if (!this.hillsLayer) {
    //   throw new Error("Failed to load hills layer");
    // }
    // this.hillsLayer.setCollisionByProperty({ collides: true });
    // this.map = map;
  }
}
