/* eslint-disable @typescript-eslint/ban-ts-comment */
import Phaser from "phaser";

interface AnimatedTile {
  tile: Phaser.Tilemaps.Tile;
  animation: { tileid: number; duration: number }[];
  frameIndex: number;
  elapsedTime: number;
  tilesetFirstGid: number;
}

export class AnimatedTileSystem {
  private scene: Phaser.Scene;
  private animatedTiles: AnimatedTile[] = [];

  constructor(
    scene: Phaser.Scene,
    tilemap: Phaser.Tilemaps.Tilemap,
    layers: Phaser.Tilemaps.TilemapLayer[]
  ) {
    this.scene = scene;
    layers.forEach((layer) => this.extractAnimatedTiles(tilemap, layer));
  }

  private extractAnimatedTiles(
    tilemap: Phaser.Tilemaps.Tilemap,
    layer: Phaser.Tilemaps.TilemapLayer
  ): void {
    layer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      // **Skip empty tiles and tiles without a tileset**
      if (tile.index < 0 || !tile.tileset) {
        return;
      }

      const tileset = tile.tileset;
      const localTileId = tile.index - tileset.firstgid;
      // @ts-ignore
      const tileData = tileset.tileData?.[localTileId];

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

  public update(delta: number): void {
    this.animatedTiles.forEach((animatedTile) => {
      animatedTile.elapsedTime += delta;

      const currentFrame = animatedTile.animation[animatedTile.frameIndex];

      if (animatedTile.elapsedTime >= currentFrame.duration) {
        // Move to the next frame
        animatedTile.frameIndex =
          (animatedTile.frameIndex + 1) % animatedTile.animation.length;
        animatedTile.elapsedTime -= currentFrame.duration;

        // Get the next frame
        const nextFrame = animatedTile.animation[animatedTile.frameIndex];

        // Update tile index to the global tile index
        animatedTile.tile.index =
          animatedTile.tilesetFirstGid + nextFrame.tileid;
      }
    });
  }
}
