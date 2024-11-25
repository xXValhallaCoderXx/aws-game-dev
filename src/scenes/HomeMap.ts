/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "../shared/scene-keys";
import { FarmingSystem } from "../slices/farming/farming-system.service";
import { AnimatedTileSystem } from "../slices/animated-tiles/animated-tiles-system.service";

export class HomeMap extends BaseScene {
  private waterLayer?: Phaser.Tilemaps.TilemapLayer | null;
  private farmableLayer?: Phaser.Tilemaps.TilemapLayer | null;
  private waterAnimatedLayer: Phaser.Tilemaps.TilemapLayer | null = null;

  // Sound Assets
  private plantSeedSound: Phaser.Sound.BaseSound | null = null;
  private harvestCropSound: Phaser.Sound.BaseSound | null = null;
  private backgroundMusic: Phaser.Sound.BaseSound | null = null;

  private farmingSystem!: FarmingSystem;
  private animatedTileSystem!: AnimatedTileSystem;

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
    this.load.image("buildings-main", "tilesets/buildings-main.png");
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

    const buildingTileset = this.map.addTilesetImage(
      "buildings-main",
      "buildings-main"
    );

    if (
      !terrainVillage1Tileset ||
      !waterBlankTileset ||
      !waterAnimatedTileset ||
      !cropsTileset ||
      !buildingTileset
    ) {
      throw new Error("Failed to load terrain tileset");
    }

    this.map.createLayer("GrassBaseLayer", terrainVillage1Tileset, 0, 0);
    this.map.createLayer("GrassAccessoriesLayer", terrainVillage1Tileset, 0, 0);

    this.map.createLayer("BuildingBaseLayer", buildingTileset, 0, 0);
    this.map.createLayer("BuildingRoofLayer", buildingTileset, 0, 0);
    this.map.createLayer("BuildingRoofAccessoriesLayer", buildingTileset, 0, 0);

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

    // Initialize the Animated Tile System with all animated layers
    this.animatedTileSystem = new AnimatedTileSystem(this, this.map, [
      this.waterAnimatedLayer!,
    ]);
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    // Update the farming system
    this.farmingSystem.update(delta);

    // Update the animated tile system
    this.animatedTileSystem.update(delta);

     // Update seed packet sprite position if it exists
    // Instead of accessing private properties, expose a method in FarmingSystem to handle seed packet updates
    this.farmingSystem.updateSeedPacketPosition(this.player.x, this.player.y);
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
