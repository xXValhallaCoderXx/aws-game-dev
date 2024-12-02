/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "@shared/scene-keys";
import { IEntranceConfig } from "@/slices/scenes/scenes.interface";

export class TownMap extends BaseScene {
  private backgroundMusic: Phaser.Sound.BaseSound | null = null;

  constructor() {
    super(ESCENE_KEYS.TOWN_MAP);
  }

  init(data: any) {
    super.init(data);
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
    // this.backgroundMusic.play();

    this.createHomeMapEntrance();
  }

  protected getDefaultStartingPosition(): { x: number; y: number } {
    return { x: 25, y: 205 }; // Default spawn point on TownMap
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
    // Create entrances using the reusable function
    const homeMapEntranceConfig: IEntranceConfig = {
      zoneX: -10, // Adjust based on your map
      zoneY: 208, // Adjust based on your map
      zoneWidth: 50,
      zoneHeight: 50,
      targetScene: ESCENE_KEYS.HOME_MAP,
      targetStartingPosition: { x: 530, y: 140 }, // Starting position in HomeMap
      comingFrom: ESCENE_KEYS.TOWN_MAP,
      debug: true, // Set to true for debugging borders
    };
    this.createEntrance(homeMapEntranceConfig);
  }
}
