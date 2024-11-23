/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene } from "phaser";
import { ESCENE_KEYS } from "../shared/scene-keys";
import { PlayerCharacter } from "../slices/character/PlayerCharacter";
import { CharacterConfig } from "../slices/character/CharacterClass";

export class CameraMap extends Scene {
  private player!: PlayerCharacter;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private map!: Phaser.Tilemaps.Tilemap;
  constructor() {
    super(ESCENE_KEYS.CAMERA);
  }

  init() {
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  preload() {
    this.load.tilemapTiledJSON("home-map", "maps/home-map.json");
    this.load.image("terrain-village-1", "tilesets/terrain-village-1.png");
  }

  create() {
    this.createMap();
    // Set world bounds to match the map size

    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.createPlayer();

    // Set up camera to follow the player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Set camera bounds to prevent it from moving outside the map
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    // Adjust camera zoom to make the character larger
    this.adjustCameraZoom();
  }

  update() {
    if (!this.cursors || !this.player) return;

    this.player.handleMovement();
  }
  private adjustCameraZoom() {
    // Desired size of the player on screen (in pixels)
    const desiredPlayerSize = 256;

    // Calculate the zoom factor
    const zoomFactor = desiredPlayerSize / this.player.height;

    // Set the camera zoom
    this.cameras.main.setZoom(zoomFactor);
  }

  private createMap() {
    this.map = this.make.tilemap({ key: "home-map" });

    // Add tilesets
    const terrainVillage1Tileset = this.map.addTilesetImage(
      "terrain-village-1",
      "terrain-village-1"
    );
    // this.waterMainTileset = map.addTilesetImage("water-main", "water-main");

    if (!terrainVillage1Tileset) {
      throw new Error("Failed to load water tileset");
    }

    // Create static layers
    const grassBaseLayer = this.map.createLayer(
      "GrassBaseLayer",
      terrainVillage1Tileset,
      0,
      0
    );

    const grassAccessoriesLayer = this.map.createLayer(
      "GrassAccessoriesLayer",
      terrainVillage1Tileset,
      0,
      0
    );
  }

  private createPlayer(): void {
    const playerConfig: CharacterConfig = {
      scene: this,
      x: this.map.widthInPixels / 2,
      y: this.map.heightInPixels / 2,
      texture: {
        key: "player",
        walkSheet: "player-walk", // matches the key used in preload for walk spritesheet
        idleSheet: "player-idle", // matches the key used in preload for idle spritesheet
      },
      speed: 100,
      animations: {
        walkUp: "player-walk-up",
        walkDown: "player-walk-down",
        walkLeft: "player-walk-left",
        walkRight: "player-walk-right",
        idleUp: "player-idle-up",
        idleDown: "player-idle-down",
        idleLeft: "player-idle-left",
        idleRight: "player-idle-right",
      },
    };

    this.player = new PlayerCharacter(playerConfig);
    this.player.setupAnimations();
    this.player.anims.play(this.player.animations.idleDown);
  }
}
