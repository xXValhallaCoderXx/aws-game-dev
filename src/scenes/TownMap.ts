import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "@shared/scene-keys";

export class TownMap extends BaseScene {
  private backgroundMusic: Phaser.Sound.BaseSound | null = null;

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
}
