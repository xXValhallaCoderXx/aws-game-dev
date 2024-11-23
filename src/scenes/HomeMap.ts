import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "../shared/scene-keys";

export class HomeMap extends BaseScene {
  private waterLayer?: Phaser.Tilemaps.TilemapLayer | null;

  constructor() {
    super(ESCENE_KEYS.CAMERA);
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("home-map", "maps/home-map.json");
    this.load.image("terrain-village-1", "tilesets/terrain-village-1.png");
    this.load.image("water-blank", "tilesets/water-blank.png");
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

    if (!terrainVillage1Tileset || !waterBlankTileset) {
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

    if (this.waterLayer) {
      this.waterLayer.setCollisionByProperty({ collides: true });
    }
  }

  create() {
    // First create the map
    this.createMap();

    // Then call parent's create which will handle player creation and camera setup
    super.create();

    // Finally set up the water collisions
    this.setupCollisions();
  }

  private setupCollisions(): void {
    if (this.waterLayer && this.player) {
      this.physics.add.collider(this.player, this.waterLayer);
    }
  }
}
