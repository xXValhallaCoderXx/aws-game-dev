/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene } from "phaser";
import { ESCENE_KEYS } from "../shared/scene-keys";

interface AnimatedTileInfo {
  tile: Phaser.Tilemaps.Tile;
  tileset: Phaser.Tilemaps.Tileset;
  animation: TileAnimationFrame[];
  frameIndex: number;
  elapsedTime: number;
}

interface TileAnimationFrame {
  duration: number;
  tileid: number;
}

export class HomeMap extends Scene {
  private animatedTiles: AnimatedTileInfo[] = [];
  // Layers
  private waterAnimatedLayer!: Phaser.Tilemaps.TilemapLayer;
  private waterBaseLayer!: Phaser.Tilemaps.TilemapLayer | null;
  // Tilesets
  private waterTileset!: Phaser.Tilemaps.Tileset | null;

  constructor() {
    super(ESCENE_KEYS.HOME_MAP);
  }

  init() {}

  preload() {
    this.load.tilemapTiledJSON("home-map", "maps/home-map.json");
    this.load.image("terrain-village-1", "tilesets/terrain-village-1.png");
  }

  create() {
    this.createMap();

    // Store animation data
  }

  update(time: any, delta: any) {
    // this.animatedTiles.forEach((tileInfo: AnimatedTileInfo) => {
    //   // Increment elapsed time
    //   tileInfo.elapsedTime += delta;
    //   const currentFrame = tileInfo.animation[tileInfo.frameIndex];
    //   // Check if it's time to switch to the next frame
    //   if (tileInfo.elapsedTime >= currentFrame.duration) {
    //     // Move to the next frame
    //     tileInfo.frameIndex =
    //       (tileInfo.frameIndex + 1) % tileInfo.animation.length;
    //     // Reset elapsed time for the next frame
    //     tileInfo.elapsedTime -= currentFrame.duration;
    //     // Get the next frame
    //     const nextFrame = tileInfo.animation[tileInfo.frameIndex];
    //     // Update the tile's index using its tileset's firstgid
    //     tileInfo.tile.index = nextFrame.tileid + tileInfo.tileset.firstgid;
    //   }
    // });
  }

  private createMap() {
    const map = this.make.tilemap({ key: "home-map" });

    // Add tilesets
    this.waterTileset = map.addTilesetImage("water-blank", "water-blank");
    // this.waterMainTileset = map.addTilesetImage("water-main", "water-main");
    // Add other tilesets as needed

    if (!this.waterTileset) {
      throw new Error("Failed to load water tileset");
    }

    // Create static layers
    this.waterBaseLayer = map.createLayer(
      "WaterBaseLayer",
      this.waterTileset,
      0,
      0
    );
    // Create other static layers

    // Create the animated tiles layer
    // this.waterAnimatedLayer = map.createLayer(
    //   "WaterBaseAnimatedLayer",
    //   this.waterTileset,
    //   0,
    //   0
    // );

    // Collect animated tiles from the animated layer
    // this.collectAnimatedTiles();
  }

  // private collectAnimatedTiles() {
  //   // Collect animated tiles
  //   this.animatedTiles = [];

  //   this.waterAnimatedLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
  //     // Determine which tileset the tile belongs to
  //     const tileset = tile.tileset;

  //     // Calculate the local tile ID within the tileset
  //     const tileId = tile.index - tileset.firstgid;

  //     // Get the tile data from the tileset
  //     const tileData = tileset.tileData[tileId];

  //     if (tileData && tileData.animation) {
  //       this.animatedTiles.push({
  //         tile: tile,
  //         tileset,
  //         animation: tileData.animation,
  //         frameIndex: 0,
  //         elapsedTime: 0,
  //       });
  //     }
  //   });
  // }
}
