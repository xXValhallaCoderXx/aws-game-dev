import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "../shared/scene-keys";

export class HomeMap extends BaseScene {
  constructor() {
    super(ESCENE_KEYS.CAMERA);
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("home-map", "maps/home-map.json");
    this.load.image("terrain-village-1", "tilesets/terrain-village-1.png");
  }

  protected createMap(): void {
    this.map = this.make.tilemap({ key: "home-map" });

    // Add tilesets
    const terrainVillage1Tileset = this.map.addTilesetImage(
      "terrain-village-1",
      "terrain-village-1"
    );

    if (!terrainVillage1Tileset) {
      throw new Error("Failed to load terrain tileset");
    }

    // Create layers
    this.map.createLayer("GrassBaseLayer", terrainVillage1Tileset, 0, 0);
    this.map.createLayer("GrassAccessoriesLayer", terrainVillage1Tileset, 0, 0);
  }
}
