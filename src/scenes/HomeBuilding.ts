/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "../shared/scene-keys";

export class HomeBuilding extends BaseScene {
  private buildingEntranceZone!: Phaser.GameObjects.Zone;
  constructor() {
    super(ESCENE_KEYS.HOME_HOUSE);
  }

  init() {
    super.init();
    console.log("HOME HOUSE");
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("building-map", "maps/home-building-map.json");
    this.load.image(
      "building-interior-floors",
      "tilesets/building-interior-floors.png"
    );

    this.load.image(
      "building-interior-objects",
      "tilesets/building-interior-objects.png"
    );
    this.load.image(
      "building-interior-walls",
      "tilesets/building-interior-walls.png"
    );
    this.load.image(
      "building-interior-windows",
      "tilesets/building-interior-windows.png"
    );

    this.load.audio("backgroundMusic", "sounds/main-bgm.mp3");
  }

  create() {
    // First create the map
    this.createMap();

    // Then call parent's create which will handle player creation and camera setup
    super.create();

    this.createBuildingExit();
  }

  update(time: any, delta: any): void {
    super.update(time, delta);
  }

  protected createMap(): void {
    this.map = this.make.tilemap({ key: "building-map" });

    const interiorFloorsTileset = this.map.addTilesetImage(
      "building-interior-floors",
      "building-interior-floors"
    );

    const interiorWallsTileset = this.map.addTilesetImage(
      "building-interior-walls",
      "building-interior-walls"
    );

    const interiorObjects = this.map.addTilesetImage(
      "building-interior-objects",
      "building-interior-objects"
    );

    const interiorWindows = this.map.addTilesetImage(
      "building-interior-windows",
      "building-interior-windows"
    );

    if (
      !interiorFloorsTileset ||
      !interiorWallsTileset ||
      !interiorObjects ||
      !interiorWindows
    ) {
      throw new Error("Failed to load interior floors tileset");
    }

    this.map.createLayer("BaseFloor", interiorFloorsTileset, 0, 0);
    this.map.createLayer("BaseWall", interiorWallsTileset, 0, 0);
    this.map.createLayer(
      "AccessoryLayer",
      [interiorObjects, interiorWindows],
      0,
      0
    );

    // if (this.waterLayer) {
    //   this.waterLayer.setCollisionByProperty({ collides: true });
    // }

    // if (this.waterAnimatedLayer) {
    //   this.waterAnimatedLayer.setCollisionByProperty({ collides: true });
    // }
  }

  private createBuildingExit(): void {
    // Position the entrance zone inside the building
    const entranceX = 250; // Adjust based on your map
    const entranceY = 350; // Adjust based on your map

    this.buildingEntranceZone = this.add.zone(entranceX, entranceY, 16, 16);
    this.physics.world.enable(this.buildingEntranceZone);
    (
      this.buildingEntranceZone.body as Phaser.Physics.Arcade.Body
    ).setAllowGravity(false);
    (this.buildingEntranceZone.body as Phaser.Physics.Arcade.Body).setImmovable(
      true
    );

    // Add overlap between player and entrance zone
    this.physics.add.overlap(
      this.player,
      this.buildingEntranceZone,
      this.handlePlayerEnterBuilding,
      undefined,
      this
    );
  }

  private handlePlayerEnterBuilding(): void {
    this.exitBuilding();
  }

  private exitBuilding(): void {
    // Optionally, play a sound or animation
    // this?.backgroundMusic?.stop();

    // Transition to the indoor scene
    this.scene.start(ESCENE_KEYS.HOME_MAP);
  }
}
