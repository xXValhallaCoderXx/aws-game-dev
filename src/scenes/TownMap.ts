import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "@shared/scene-keys";

export class TownMap extends BaseScene {
  private backgroundMusic: Phaser.Sound.BaseSound | null = null;
  private homeMapEntranceZone!: Phaser.GameObjects.Zone;

  constructor() {
    super(ESCENE_KEYS.TOWN_MAP);
  }

  init() {
    super.init();
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("town-map", "maps/town-map.json");
    this.load.image("terrain-village-1", "tilesets/terrain-village-1.png");
    this.load.image("terrain-city", "tilesets/terrain-city.png");
    this.load.audio("backgroundMusic", "sounds/main-bgm.mp3");
  }

  create() {
    super.create();

    this.createMap();

    this.backgroundMusic = this.sound.add("backgroundMusic", {
      volume: 0.2,
      loop: true,
    });

    // Play the background music
    this.backgroundMusic.play();

    this.createHomeMapEntrance();
  }

  protected getStartingPosition(): { x: number; y: number } {
    // Provide custom starting position for HomeMap
    return { x: 35, y: 205 };
  }

  protected createMap(): void {
    this.map = this.make.tilemap({ key: "town-map" });

    const terrainVillageTileset1 = this.map.addTilesetImage(
      "terrain-village-1",
      "terrain-village-1"
    );

    const terrainCityTileset = this.map.addTilesetImage(
      "terrain-city",
      "terrain-city"
    );

    if (!terrainVillageTileset1 || !terrainCityTileset) {
      throw new Error("Failed to load terrain tileset");
    }

    this.map.createLayer("GrassLayer", terrainVillageTileset1, 0, 0);
    this.map.createLayer("CityPathLayer", terrainCityTileset, 0, 0);
  }

  private createHomeMapEntrance(): void {
    // Position the entrance zone inside the building
    const entranceX = 0; // Adjust based on your map
    const entranceY = 208; // Adjust based on your map

    this.homeMapEntranceZone = this.add.zone(entranceX, entranceY, 50, 50);
    this.physics.world.enable(this.homeMapEntranceZone);
    (
      this.homeMapEntranceZone.body as Phaser.Physics.Arcade.Body
    ).setAllowGravity(false);
    (this.homeMapEntranceZone.body as Phaser.Physics.Arcade.Body).setImmovable(
      true
    );

    // Add overlap between player and entrance zone
    this.physics.add.overlap(
      this.player,
      this.homeMapEntranceZone,
      this.handlePlayerEnteringHome,
      undefined,
      this
    );

    // Add a visible border for debugging
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xff0000, 1); // Red color, 2px thickness
    graphics.strokeRect(
      this.homeMapEntranceZone.x - this.homeMapEntranceZone.width / 2,
      this.homeMapEntranceZone.y - this.homeMapEntranceZone.height / 2,
      this.homeMapEntranceZone.width,
      this.homeMapEntranceZone.height
    );
  }

  private handlePlayerEnteringHome(): void {
    // Optionally, play a sound or animation
    this?.backgroundMusic?.stop();

    // Transition to the indoor scene
    this.scene.start(ESCENE_KEYS.HOME_MAP);
  }
}
