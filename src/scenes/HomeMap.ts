/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "../shared/scene-keys";
import { FarmingSystem } from "../slices/farming/farming-system.service";
import { AnimatedTileSystem } from "../slices/animated-tiles/animated-tiles-system.service";
import { IEntranceConfig } from "@/slices/scenes/scenes.interface";
import { SpiritManager } from "@/slices/spirit-quest-manager/spirit-quest.service";
import { InteractionZone } from "@/shared/components/phaser-components/InteractableObject";

export class HomeMap extends BaseScene {
  private spiritManager!: SpiritManager;
  private interactionZones: InteractionZone[] = [];
  private waterLayer?: Phaser.Tilemaps.TilemapLayer | null;
  private farmableLayer?: Phaser.Tilemaps.TilemapLayer | null;
  private waterAnimatedLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private door!: Phaser.GameObjects.Sprite;
  private isDoorAnimating: boolean = false;
  private interactionZone!: Phaser.GameObjects.Zone;
  private isDoorOpen: boolean = false; // Track door state
  private playerNearDoor: boolean = false; // Track if player is near the door
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private buildingBaseLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private grassLayerAccessories: Phaser.Tilemaps.TilemapLayer | null = null;
  private grassLayerAccessories2: Phaser.Tilemaps.TilemapLayer | null = null;
  private buildingRoofLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private caveWallLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private buildingRoofAccessoriesLayer: Phaser.Tilemaps.TilemapLayer | null =
    null;

  // Sound Assets
  private plantSeedSound: Phaser.Sound.BaseSound | null = null;
  private harvestCropSound: Phaser.Sound.BaseSound | null = null;
  private backgroundMusic: Phaser.Sound.BaseSound | null = null;

  private farmingSystem!: FarmingSystem;
  private animatedTileSystem!: AnimatedTileSystem;

  constructor() {
    super(ESCENE_KEYS.HOME_MAP);
  }

  protected getDefaultStartingPosition(): { x: number; y: number } {
    return { x: 185, y: 180 }; // Default spawn point on HomeMap
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("home-map", "maps/home-map.json");
    this.load.image("terrain-village-1", "tilesets/terrain-village-1.png");
    this.load.image("water-blank", "tilesets/water-blank.png");
    this.load.image("water-main-animated", "tilesets/water-main-animated.png"); // Add this line
    this.load.image("crops-tiles-main", "tilesets/crops-tiles-main.png");
    this.load.image("buildings-main", "tilesets/buildings-main.png");
    this.load.image(
      "village-nature-objects",
      "tilesets/village-nature-objects.png"
    );
    this.load.image("village-objects", "tilesets/village-objects.png");
    this.load.image("caves-main", "tilesets/caves-main.png");
    this.load.spritesheet(
      "crops-objects",
      "sprites/crops/crops-harvest-stages.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );
    this.load.spritesheet("door", "sprites/building/door-right.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
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

    const villageObjectsTileset = this.map.addTilesetImage(
      "village-objects",
      "village-objects"
    );

    const villageNatureObjectsTileset = this.map.addTilesetImage(
      "village-nature-objects",
      "village-nature-objects"
    );

    const caveWallsTileset = this.map.addTilesetImage(
      "caves-main",
      "caves-main"
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
      !buildingTileset ||
      !caveWallsTileset ||
      !villageNatureObjectsTileset ||
      !villageObjectsTileset
    ) {
      throw new Error("Failed to load terrain tileset");
    }

    this.map.createLayer("GrassBaseLayer", terrainVillage1Tileset, 0, 0);
    this.grassLayerAccessories = this.map.createLayer(
      "GrassAccessoriesLayer",
      [
        terrainVillage1Tileset,
        villageNatureObjectsTileset,
        villageObjectsTileset,
      ],
      0,
      0
    );

    this.buildingBaseLayer = this.map.createLayer(
      "BuildingBaseLayer",
      buildingTileset,
      0,
      0
    );
    this.buildingRoofLayer = this.map.createLayer(
      "BuildingRoofLayer",
      buildingTileset,
      0,
      0
    );
    this.buildingRoofAccessoriesLayer = this.map.createLayer(
      "BuildingRoofAccessoriesLayer",
      buildingTileset,
      0,
      0
    );

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

    this.caveWallLayer = this.map.createLayer(
      "CaveWalls",
      caveWallsTileset,
      0,
      0
    );
    this.map.createLayer("CaveEntrance", caveWallsTileset, 0, 0);
    this.map.createLayer("CaveWallAccessories", caveWallsTileset, 0, 0);

    this.grassLayerAccessories2 = this.map.createLayer(
      "GrassAcessoriesLayer2",
      [villageNatureObjectsTileset, villageObjectsTileset],
      0,
      0
    );

    if (this.farmableLayer) {
      this.farmableLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
        tile.properties.farmable = true;
      });
    }

    if (this.grassLayerAccessories) {
      this.grassLayerAccessories.setCollisionByProperty({ collides: true });
    }

    if (this.caveWallLayer) {
      this.caveWallLayer.setCollisionByProperty({ collides: true });
    }

    if (this.grassLayerAccessories2) {
      this.grassLayerAccessories2.setCollisionByProperty({ collides: true });
    }

    if (this.waterLayer) {
      this.waterLayer.setCollisionByProperty({ collides: true });
    }

    if (this.waterAnimatedLayer) {
      this.waterAnimatedLayer.setCollisionByProperty({ collides: true });
    }

    if (
      this.buildingBaseLayer &&
      this.buildingRoofLayer &&
      this.buildingRoofAccessoriesLayer
    ) {
      this.buildingBaseLayer.setCollisionByProperty({ collides: true });
      this.buildingRoofLayer.setCollisionByProperty({ collides: true });
      this.buildingRoofAccessoriesLayer.setCollisionByProperty({
        collides: true,
      });
    }
  }

  create() {
    // First create the map
    this.createMap();
    // You might want to wait for the load to complete

    // Then call parent's create which will handle player creation and camera setup
    super.create();

    this.createInteractionZones();
    console.log("CON: ", this.player);
    this.spiritManager = new SpiritManager(this, this.player);
    this.createDoor();

    // Start spirit spawning after scene is fully initialized

    this.isDoorOpen = false;

    // Create the building entrance zone
    this.createBuildingEntrance();

    // Create town entrance zone
    this.createTownEntrance();

    // Create Cave Entrance
    this.createCaveEntrance();

    // Finally set up the water collisions
    this.setupCollisions();

    if (this.input.keyboard) {
      this.spaceKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
    }

    this.plantSeedSound = this.sound.add("plantSeedSound");
    this.harvestCropSound = this.sound.add("harvestCropSound");
    this.backgroundMusic = this.sound.add("backgroundMusic", {
      volume: 0.2, // Set lower volume (0 to 1)
      loop: true, // Loop the music
    });

    // Play the background music
    // this.backgroundMusic.play();

    // Initialize the Farming System
    this.farmingSystem = new FarmingSystem({
      scene: this,
      map: this.map,
      farmableLayer: this.farmableLayer!,
      player: this.player,
      // plantSeedSound: this.plantSeedSound,
      // harvestCropSound: this.harvestCropSound,
    });

    this.spiritManager.startRandomSpawning();
    // Initialize the Animated Tile System with all animated layers
    this.animatedTileSystem = new AnimatedTileSystem(this, this.map, [
      this.waterAnimatedLayer!,
    ]);
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.player.update(time, delta);

    // Update the farming system
    this.farmingSystem.update(delta);

    // Update the animated tile system
    this.animatedTileSystem.update(delta);

    // Update seed packet sprite position if it exists
    // Instead of accessing private properties, expose a method in FarmingSystem to handle seed packet updates
    this.farmingSystem.updateSeedPacketPosition(this.player.x, this.player.y);

    // Handle spacebar input when player is near the door
    if (this.playerNearDoor && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.toggleDoor();
    }
  }

  private setupCollisions(): void {
    if (this.caveWallLayer && this.player) {
      this.physics.add.collider(this.player, this.caveWallLayer);
    }
    if (this.grassLayerAccessories && this.player) {
      this.physics.add.collider(this.player, this.grassLayerAccessories);
    }
    if (this.grassLayerAccessories2 && this.player) {
      this.physics.add.collider(this.player, this.grassLayerAccessories2);
    }
    if (this.waterLayer && this.player) {
      this.physics.add.collider(this.player, this.waterLayer);
    }

    if (this.waterAnimatedLayer && this.player) {
      this.physics.add.collider(this.player, this.waterAnimatedLayer);
    }

    if (
      this.buildingBaseLayer &&
      this.buildingRoofLayer &&
      this.buildingRoofAccessoriesLayer
    ) {
      this.buildingBaseLayer.setDepth(15);
      this.buildingRoofLayer.setDepth(15);
      this.buildingRoofAccessoriesLayer.setDepth(15);
      this.physics.add.collider(this.player, this.buildingBaseLayer);
      this.physics.add.collider(this.player, this.buildingRoofLayer);
      this.physics.add.collider(this.player, this.buildingRoofAccessoriesLayer);
    }
  }

  private createDoor(): void {
    // Position the door as needed; adjust x and y accordingly
    const doorX = 184; // Example X coordinate
    const doorY = 152; // Example Y coordinate

    this.door = this.add.sprite(doorX, doorY, "door").setInteractive();
    this.door.setDepth(20); // Ensure the door is above other layers if needed

    // Create door animations
    this.createDoorAnimations();

    // Optionally, set initial frame to closed
    this.door.play("door-closed");

    // Create an interaction zone around the door
    this.interactionZone = this.add.zone(this.door.x, this.door.y, 50, 20); // Adjust size as needed
    this.physics.world.enable(this.interactionZone);
    (this.interactionZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(
      false
    );
    (this.interactionZone.body as Phaser.Physics.Arcade.Body).setImmovable(
      true
    );

    // // Add overlap between player and interaction zone
    this.physics.add.overlap(
      this.player,
      this.interactionZone,
      this.handlePlayerNearDoor,
      undefined,
      this
    );

    this.interactionZone.on("out", () => {
      this.playerNearDoor = false;
    });
  }

  private createInteractionZones(): void {
    const interactionsLayer = this.map.getObjectLayer("HomeInteractableLayer");

    if (!interactionsLayer) return;

    interactionsLayer.objects.forEach((object) => {
      const zone = new InteractionZone(
        this,
        object.x! + (object.width ? object.width / 2 : 0), // Center the zone
        object.y! + (object.height ? object.height / 2 : 0),
        object.width || 32, // Use object width or default
        object.height || 32, // Use object height or default
        {
          type: object.type,
          ...object.properties,
        },
        this.player
      );

      this.add.existing(zone);
      this.interactionZones.push(zone);
    });
  }

  private createDoorAnimations(): void {
    // Open Door Animation
    this.anims.create({
      key: "door-open",
      frames: this.anims.generateFrameNumbers("door", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0,
    });

    // Close Door Animation
    this.anims.create({
      key: "door-close",
      frames: this.anims.generateFrameNumbers("door", { start: 5, end: 0 }),
      frameRate: 10,
      repeat: 0,
    });

    // Closed Door Frame (Static)
    this.anims.create({
      key: "door-closed",
      frames: [{ key: "door", frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });
  }

  private handlePlayerNearDoor(): void {
    this.playerNearDoor = true;
    this.door.setTint(0x00ff00); // Green tint to indicate interaction
  }

  private toggleDoor(): void {
    if (this.isDoorAnimating) return;

    this.isDoorAnimating = true;

    if (this.isDoorOpen) {
      this.closeDoor();
    } else {
      this.openDoor();
    }
  }

  private openDoor(): void {
    this.door.play("door-open");

    this.door.once("animationcomplete-door-open", () => {
      this.isDoorOpen = true;
      this.isDoorAnimating = false;
    });
  }

  private closeDoor(): void {
    this.door.play("door-close");

    this.door.once("animationcomplete-door-close", () => {
      this.isDoorOpen = false;
      this.isDoorAnimating = false;
    });
  }

  private createBuildingEntrance(): void {
    // Create other entrances as needed
    // Example: Entering a building
    const buildingEntranceConfig: IEntranceConfig = {
      zoneX: 184, // Adjust based on your map
      zoneY: 140, // Adjust based on your map
      zoneWidth: 50,
      zoneHeight: 50,
      targetScene: ESCENE_KEYS.HOME_HOUSE, // Example indoor scene
      targetStartingPosition: { x: 245, y: 300 }, // Starting position in HomeHouse
      comingFrom: ESCENE_KEYS.HOME_MAP,
      debug: false,
      canTransition: () => this.isDoorOpen, // Only allow transition if door is open
      feedbackMessage: "The door is closed.", // Message if door is closed
    };
    this.createEntrance(buildingEntranceConfig);
  }

  private createTownEntrance(): void {
    // Create entrances using the reusable function
    const townEntranceConfig: IEntranceConfig = {
      zoneX: 570, // Adjust based on your map
      zoneY: 142, // Adjust based on your map
      zoneWidth: 50,
      zoneHeight: 50,
      targetScene: ESCENE_KEYS.TOWN_MAP,
      targetStartingPosition: { x: 25, y: 205 }, // Starting position in TownMap
      comingFrom: ESCENE_KEYS.HOME_MAP,
      debug: false, // Set to true for debugging borders
    };
    this.createEntrance(townEntranceConfig);
  }

  private createCaveEntrance(): void {
    // Create entrances using the reusable function
    const townEntranceConfig: IEntranceConfig = {
      zoneX: 360, // Adjust based on your map
      zoneY: 20, // Adjust based on your map
      zoneWidth: 50,
      zoneHeight: 30,
      targetScene: ESCENE_KEYS.CAVE_MAP,
      targetStartingPosition: { x: 90, y: 330 }, // Starting position in TownMap
      comingFrom: ESCENE_KEYS.HOME_MAP,
      debug: false, // Set to true for debugging borders
    };
    this.createEntrance(townEntranceConfig);
  }

  cleanup() {
    this.spiritManager.destroy();
    this.interactionZones.forEach((zone) => zone.destroy());
  }
}
