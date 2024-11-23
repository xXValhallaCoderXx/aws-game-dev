/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "../shared/scene-keys";

export class HomeMap extends BaseScene {
  private waterLayer?: Phaser.Tilemaps.TilemapLayer | null;
  private animatedTiles: any | [] = [];
  private waterAnimatedLayer: Phaser.Tilemaps.TilemapLayer | null = null;

  constructor() {
    super(ESCENE_KEYS.CAMERA);
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("home-map", "maps/home-map.json");
    this.load.image("terrain-village-1", "tilesets/terrain-village-1.png");
    this.load.image("water-blank", "tilesets/water-blank.png");
  }

  protected createMap(): void {
    this.map = this.make.tilemap({ key: "home-map" });

    const terrainVillage1Tileset = this.map.addTilesetImage(
      "terrain-village-1",
      "terrain-village-1"
    );

    const waterBlankTileset = this.map.addTilesetImage(
      "water-blank",
      "water-blank"
    );

    if (!terrainVillage1Tileset || !waterBlankTileset) {
      throw new Error("Failed to load terrain tileset");
    }

    this.map.createLayer("GrassBaseLayer", terrainVillage1Tileset, 0, 0);
    this.map.createLayer("GrassAccessoriesLayer", terrainVillage1Tileset, 0, 0);

    this.waterLayer = this.map.createLayer(
      "WaterBaseLayer",
      waterBlankTileset,
      0,
      0
    );

    this.waterAnimatedLayer = this.map.createLayer(
      "WaterAnimatedLayer",
      waterBlankTileset,
      0,
      0
    );

    this.animatedTiles = [];

    if (this.waterAnimatedLayer) {
      this.waterAnimatedLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
        // **Skip empty tiles and tiles without a tileset**
        if (tile.index < 0 || !tile.tileset) {
          return;
        }

        const tileset = tile.tileset;
        const localTileId = tile.index - tileset.firstgid;
        const tileData = tileset.tileData[localTileId];

        if (tileData && tileData.animation) {
          this.animatedTiles.push({
            tile: tile,
            animation: tileData.animation,
            frameIndex: 0,
            elapsedTime: 0,
            tilesetFirstGid: tileset.firstgid,
          });
        }
      });
    }

    if (this.waterLayer) {
      this.waterLayer.setCollisionByProperty({ collides: true });
    }
  }

  create() {
    // First create the map
    this.createMap();

    // Then call parent's create which will handle player creation and camera setup
    super.create();

    // Finally set up the water collisions
    this.setupCollisions();
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    this.animatedTiles.forEach((animatedTile: any) => {
      const tile = animatedTile.tile;
      const animation = animatedTile.animation;

      animatedTile.elapsedTime += delta;

      const currentFrame = animation[animatedTile.frameIndex];

      if (animatedTile.elapsedTime >= currentFrame.duration) {
        // Move to the next frame
        animatedTile.frameIndex =
          (animatedTile.frameIndex + 1) % animation.length;
        animatedTile.elapsedTime -= currentFrame.duration;

        // Get the next frame
        const nextFrame = animation[animatedTile.frameIndex];

        // Update tile index to the global tile index
        tile.index = animatedTile.tilesetFirstGid + nextFrame.tileid;
      }
    });
  }

  private setupCollisions(): void {
    if (this.waterLayer && this.player) {
      this.physics.add.collider(this.player, this.waterLayer);
    }
  }
}
