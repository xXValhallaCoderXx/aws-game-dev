/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene } from "phaser";
import { ESCENE_KEYS } from "../shared/scene-keys";
import { PlayerCharacter } from "../slices/character/PlayerCharacter";
import { CharacterConfig } from "../slices/character/CharacterClass";

export class HomeMap extends Scene {
  private player!: PlayerCharacter;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  constructor() {
    super(ESCENE_KEYS.HOME_MAP);
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
    this.createPlayer();
  }

  update() {
    if (!this.cursors || !this.player) return;

    this.player.handleMovement();
  }

  private createMap() {
    const map = this.make.tilemap({ key: "home-map" });

    // Add tilesets
    const terrainVillage1Tileset = map.addTilesetImage(
      "terrain-village-1",
      "terrain-village-1"
    );
    // this.waterMainTileset = map.addTilesetImage("water-main", "water-main");

    if (!terrainVillage1Tileset) {
      throw new Error("Failed to load water tileset");
    }

    // Create static layers
    const grassBaseLayer = map.createLayer(
      "GrassBaseLayer",
      terrainVillage1Tileset,
      0,
      0
    );

    const grassAccessoriesLayer = map.createLayer(
      "GrassAccessoriesLayer",
      terrainVillage1Tileset,
      0,
      0
    );
  }

  private createPlayer(): void {
    const playerConfig: CharacterConfig = {
      scene: this,
      x: 20,
      y: 20,
      texture: "player",
      frame: "walk-1",
      speed: 100,
      animations: {
        idleDown: "player-idle-down",
        idleUp: "player-idle-up",
        idleSide: "player-idle-side",
        moveDown: "player-move-down",
        moveUp: "player-move-up",
        moveSide: "player-move-side",
      },
    };
    this.player = new PlayerCharacter(playerConfig);
    this.player.setCursors(this.cursors);
    this.player.setupAnimations();
    this.player.anims.play(this.player.animations.idleDown);
  }
}
