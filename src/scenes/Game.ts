/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene } from "phaser";
import { ESCENE_KEYS } from "../shared/scene-keys";
import { PlayerCharacter } from "../slices/character/PlayerCharacter";
import { CharacterConfig } from "../slices/character/CharacterClass";
// import debugDrawer from "../shared/services/utils/phaser-debug.util";

export class Game extends Scene {
  // So we don't need non null assertion operator (!) in the code
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: PlayerCharacter;
  private hillsLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private map: Phaser.Tilemaps.Tilemap | null = null;
  private gardenPlots: any = null;
  private seeds: number = 5; // Starting with 5 seeds
  private plantKey!: Phaser.Input.Keyboard.Key;

  private growthStages = [
    { stage: "seed", duration: 2500 }, // 5 seconds
    { stage: "sprout", duration: 2500 }, // 10 seconds
    { stage: "young", duration: 2500 }, // 15 seconds
    { stage: "mature", duration: 2500 }, // 20 seconds
    { stage: "grown", duration: 0 }, // Fully grown, no further growth
  ];

  constructor() {
    super(ESCENE_KEYS.GAME);
  }

  init() {
    const cursors = this.input.keyboard!.createCursorKeys();
    this.cursors = cursors;
  }

  preload() {
    this.load.atlas(
      "carrot-farming",
      "sprites/crops/carrot/carrot-seed-atlas.png",
      "sprites/crops/carrot/carrot-seed-atlas.json"
    );

    this.load.image("seed", "sprites/crops/carrot/carrot-0.png");
  }

  create() {
    this.createMap();
    this.createPlayer();
    // debugDrawer(hillsLayer, this);
    this.createGardenPlots();

    this.player.anims.play("player-idle-down");

    if (this.hillsLayer) {
      this.physics.add.collider(this.player, this.hillsLayer);
    }

    // Add overlap detection between the player and garden plots
    this.physics.add.overlap(
      this.player,
      this.gardenPlots,
      this.handlePlotOverlap,
      undefined,
      this
    );

    // Define input key for planting (e.g., spacebar)
    this.plantKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  update() {
    if (!this.cursors || !this.player) return;

    this.player.handleMovement();
  }

  private createMap() {
    const map = this.make.tilemap({ key: "main-map" });
    const tileset = map.addTilesetImage("grass", "grass");
    const tileset2 = map.addTilesetImage("hills", "hills");
    const tileset3 = map.addTilesetImage("tilled_dirt", "tilled_dirt");

    if (!tileset || !tileset2) {
      throw new Error("Failed to load tilesets");
    }

    map.createLayer("GrassLayer", tileset, 0, 0);
    this.hillsLayer = map.createLayer("HillsLayer", tileset2, 0, 0);
    map.createLayer("GardenPlotLayer", tileset3, 0, 0);

    if (!this.hillsLayer) {
      throw new Error("Failed to load hills layer");
    }

    this.hillsLayer.setCollisionByProperty({ collides: true });
    this.map = map;
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

  private createGardenPlots(): void {
    const gardenPlotsLayer = this.map.getObjectLayer("GardenPlots");
    if (!gardenPlotsLayer) {
      console.error("GardenPlots layer not found in the tilemap.");
      return;
    }

    // Create a group to hold the garden plots
    this.gardenPlots = this.physics.add.staticGroup();

    // Loop through the objects and create garden plot game objects
    gardenPlotsLayer.objects.forEach((obj: any) => {
      console.log("LALA");
      // Adjust positions to account for Tiled's coordinate system
      const x = obj.x + obj.width / 2;
      const y = obj.y + obj.height / 2;

      // Create a rectangle to represent the garden plot
      const plot = this.add.rectangle(x, y, obj.width, obj.height, 0x00ff00, 0);
      plot.setOrigin(0.5, 0.5);
      plot.setDepth(1);
      // Enable physics on the plot
      this.physics.add.existing(plot, true);

      // Add custom properties if needed
      (plot as any).isPlanted = false;
      (plot as any).plant = null;

      // Add the plot to the group
      this.gardenPlots.add(plot);
    });

    console.log("GARDEN: ", gardenPlotsLayer);
  }

  private handlePlotOverlap(
    player: Phaser.GameObjects.GameObject,
    plot: Phaser.GameObjects.GameObject
  ): void {
    const plotData = plot as any;

    // Check if the player presses the plant key
    if (Phaser.Input.Keyboard.JustDown(this.plantKey)) {
      if (!plotData.isPlanted) {
        if (this.seeds > 0) {
          this.plantSeed(plotData);
        } else {
          console.log("You have no seeds to plant.");
        }
      } else if (plotData.isHarvestable) {
        this.harvestPlant(plotData);
      } else {
        console.log("This plot is already planted and growing.");
      }
    }
  }

  private plantSeed(plot: any): void {
    // Reduce seed count
    this.seeds--;

    // Mark the plot as planted
    plot.isPlanted = true;

    // Create the plant sprite at the plot's position
    const plant = this.add.sprite(plot.x, plot.y, "plant", "seed.png");
    plant.setOrigin(0.5, 0.5);
    plant.setDepth(1); // Ensure it appears above other elements

    // Store the plant in the plot data
    plot.plant = plant;

    // Start plant growth
    this.startPlantGrowth(plot);

    console.log("Seed planted!");
  }

  private startPlantGrowth(plot: any): void {
    let currentStageIndex = 0;
    const totalStages = this.growthStages.length;

    const grow = () => {
      const stageData = this.growthStages[currentStageIndex];
      const frameName = `carrot-${currentStageIndex}.png`;

      // Update the plant sprite's texture to reflect the current stage
      plot.plant.setTexture("carrot-farming", frameName);

      // Check if there are more stages
      if (currentStageIndex < totalStages - 1) {
        // Schedule the next growth stage
        this.time.delayedCall(stageData.duration, () => {
          currentStageIndex++;
          grow();
        });
      } else {
        // Plant is fully grown
        plot.isHarvestable = true;
        console.log("Plant has fully grown!");
      }
    };

    // Start the growth process
    grow();
  }

  private harvestPlant(plot: any): void {
    // Remove the plant sprite
    plot.plant.destroy();

    // Reset plot state
    plot.isPlanted = false;
    plot.isHarvestable = false;
    plot.plant = null;

    // Reward the player
    this.seeds += 2; // Gain 2 seeds upon harvesting
    console.log("Plant harvested! You now have " + this.seeds + " seeds.");
  }
}
