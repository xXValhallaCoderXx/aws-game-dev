/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "../shared/scene-keys";
import { FarmingSystem } from "../slices/farming/farming-system.service";

export class HomeMap extends BaseScene {
  private waterLayer?: Phaser.Tilemaps.TilemapLayer | null;
  private farmableLayer?: Phaser.Tilemaps.TilemapLayer | null;
  private animatedTiles: any | [] = [];
  private waterAnimatedLayer: Phaser.Tilemaps.TilemapLayer | null = null;

  // Sound Assets
  private plantSeedSound: Phaser.Sound.BaseSound | null = null;
  private harvestCropSound: Phaser.Sound.BaseSound | null = null;
  private backgroundMusic: Phaser.Sound.BaseSound | null = null;

  private farmingSystem!: FarmingSystem;

  constructor() {
    super(ESCENE_KEYS.CAMERA);
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("home-map", "maps/home-map.json");
    this.load.image("terrain-village-1", "tilesets/terrain-village-1.png");
    this.load.image("water-blank", "tilesets/water-blank.png");
    this.load.image("water-main-animated", "tilesets/water-main-animated.png"); // Add this line
    this.load.image("crops-tiles-main", "tilesets/crops-tiles-main.png");
    this.load.spritesheet(
      "crops-objects",
      "sprites/crops/crops-harvest-stages.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );
    this.load.audio("plantSeedSound", "sounds/seed-place.wav");
    this.load.audio("backgroundMusic", "sounds/main-bgm.mp3");
    this.load.audio("harvestCropSound", "sounds/harvest-crop-sound.wav");
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

    const waterAnimatedTileset = this.map.addTilesetImage(
      "water-main-animated",
      "water-main-animated"
    );

    const cropsTileset = this.map.addTilesetImage(
      "crops-tiles-main",
      "crops-tiles-main"
    );

    if (
      !terrainVillage1Tileset ||
      !waterBlankTileset ||
      !waterAnimatedTileset ||
      !cropsTileset
    ) {
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
      [waterBlankTileset, waterAnimatedTileset],
      0,
      0
    );

    this.farmableLayer = this.map.createLayer(
      "FarmableLayer",
      [cropsTileset],
      0,
      0
    );

    if (this.farmableLayer) {
      this.farmableLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
        tile.properties.farmable = true;
      });
    }

    this.animatedTiles = [];

    if (this.waterAnimatedLayer) {
      this.waterAnimatedLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
        // **Skip empty tiles and tiles without a tileset**
        if (tile.index < 0 || !tile.tileset) {
          return;
        }

        const tileset = tile.tileset;
        const localTileId = tile.index - tileset.firstgid;
        // @ts-ignore
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

    if (this.waterAnimatedLayer) {
      this.waterAnimatedLayer.setCollisionByProperty({ collides: true });
    }
  }

  create() {
    // First create the map
    this.createMap();

    // Then call parent's create which will handle player creation and camera setup
    super.create();

    // Finally set up the water collisions
    this.setupCollisions();

    this.plantSeedSound = this.sound.add("plantSeedSound");
    this.harvestCropSound = this.sound.add("harvestCropSound");
    this.backgroundMusic = this.sound.add("backgroundMusic", {
      volume: 0.2, // Set lower volume (0 to 1)
      loop: true, // Loop the music
    });

    // Play the background music
    this.backgroundMusic.play();

    // Initialize the Farming System
    this.farmingSystem = new FarmingSystem({
      scene: this,
      map: this.map,
      farmableLayer: this.farmableLayer!,
      player: this.player,
      plantSeedSound: this.plantSeedSound,
      harvestCropSound: this.harvestCropSound,
    });
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    // Update the farming system
    this.farmingSystem.update(delta);

    // Update all animated tiles (water animations)
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

    // Update seed packet sprite position if it exists
    if (this.farmingSystem["seedPacketSprite"]) {
      // Accessing private property; consider adding a getter
      this.farmingSystem["seedPacketSprite"].setPosition(
        this.player.x,
        this.player.y - this.farmingSystem["SEED_PACKET_OFFSET_Y"]
      );
    }
  }

  private setupCollisions(): void {
    if (this.waterLayer && this.player) {
      this.physics.add.collider(this.player, this.waterLayer);
    }

    if (this.waterAnimatedLayer && this.player) {
      this.physics.add.collider(this.player, this.waterAnimatedLayer);
    }
  }
}
