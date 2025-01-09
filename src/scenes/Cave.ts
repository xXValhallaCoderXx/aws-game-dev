/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "@shared/scene-keys";
import { IEntranceConfig } from "@/slices/scenes/scenes.interface";

export class CaveMap extends BaseScene {
  constructor() {
    super(ESCENE_KEYS.CAVE_MAP);
  }

  init(data: any) {
    super.init(data);
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("cave-map", "maps/cave-map.json");
    this.load.image("caves-main", "tilesets/caves-main.png");
  }

  create() {
    super.create();

    this.createMap();

    this.createHomeMapEntrance();
  }

  protected getDefaultStartingPosition(): { x: number; y: number } {
    return { x: 90, y: 330 }; // Default spawn point on TownMap
  }

  protected createMap(): void {
    this.map = this.make.tilemap({ key: "cave-map" });

    const caveMainTileset = this.map.addTilesetImage(
      "caves-main",
      "caves-main"
    );

    if (!caveMainTileset) {
      throw new Error("Failed to load terrain tileset");
    }

    this.map.createLayer("CaveFloor", caveMainTileset, 0, 0);
    this.map.createLayer("CaveWalls-1", caveMainTileset, 0, 0);
    this.map.createLayer("Cave-Walls-2", caveMainTileset, 0, 0);
    this.map.createLayer("CaveDoor", caveMainTileset, 0, 0);
  }

  private createHomeMapEntrance(): void {
    // Create entrances using the reusable function
    const homeMapEntranceConfig: IEntranceConfig = {
      zoneX: 87.5, // Adjust based on your map
      zoneY: 290, // Adjust based on your map
      zoneWidth: 30,
      zoneHeight: 30,
      targetScene: ESCENE_KEYS.HOME_MAP,
      targetStartingPosition: { x: 360, y: 60 }, // Starting position in HomeMap
      comingFrom: ESCENE_KEYS.TOWN_MAP,
      debug: true, // Set to true for debugging borders
    };
    this.createEntrance(homeMapEntranceConfig);
  }
}
