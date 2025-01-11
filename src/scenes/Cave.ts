/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "@shared/scene-keys";
import { IEntranceConfig } from "@/slices/scenes/scenes.interface";
import { WaveCombatManager } from "@/slices/wave-combat-manager/wave-combat-manger.service";
// import { caveWaveConfigs } from "@/slices/wave-combat-manager/wave-combat.config";
import { itemService } from "@/slices/items/items.service";
import { GAME_ITEM_KEYS } from "@/slices/items/items.interface";

export class CaveMap extends BaseScene {
  private waveCombatManager!: WaveCombatManager;
  private waveText!: Phaser.GameObjects.Text;
  private enemyCountText!: Phaser.GameObjects.Text;

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

    const item = itemService.getItem(GAME_ITEM_KEYS.CARROT_SEEDS);
    console.log("ITEM: ", item);
    this.player.inventory.addItem({
      id: GAME_ITEM_KEYS.CARROT_SEEDS,
      quantity: 3,
    });

    this.player.inventory.addItem({
      id: GAME_ITEM_KEYS.BASIC_SWORD,
      quantity: 1,
    });

    this.player.inventory.addItem({
      id: GAME_ITEM_KEYS.HEALTH_POTION_SMALL,
      quantity: 1,
    });


   

    // Initialize the wave combat manager
    // this.waveCombatManager = new WaveCombatManager(
    //   this,
    //   this.player,
    //   caveWaveConfigs
    // );

    // // Start listening for wave complete events
    // this.events.on("waveComplete", this.handleWaveComplete, this);

    // // Add UI for wave information
    // this.createWaveUI();

    // // Start the first wave
    // this.waveCombatManager.startNextWave();
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.player.update(time, delta);
    if (this.waveCombatManager) {
      this.waveCombatManager.update(time, delta);
      this.updateWaveUI();
    }
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

  private createWaveUI(): void {
    this.waveText = this.add.text(16, 16, "Wave: 1", {
      fontSize: "32px",
      color: "#ffffff",
    });
    this.waveText.setScrollFactor(0);

    this.enemyCountText = this.add.text(16, 56, "Enemies: 0", {
      fontSize: "32px",
      color: "#ffffff",
    });
    this.enemyCountText.setScrollFactor(0);
  }

  private updateWaveUI(): void {
    const currentWave = this.waveCombatManager.getCurrentWave();
    const activeEnemies = this.waveCombatManager.getActiveEnemies().length;

    this.waveText.setText(`Wave: ${currentWave}`);
    this.enemyCountText.setText(`Enemies: ${activeEnemies}`);
  }

  private handleWaveComplete(data: { waveNumber: number; rewards: any }): void {
    // Show wave complete message
    const completionText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      `Wave ${data.waveNumber} Complete!`,
      {
        fontSize: "48px",
        color: "#00ff00",
      }
    );
    completionText.setOrigin(0.5);
    completionText.setScrollFactor(0);

    // Show rewards
    const rewardsText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 50,
      `Rewards:\nGold: ${data.rewards.gold}\nXP: ${data.rewards.experience}`,
      {
        fontSize: "32px",
        color: "#ffff00",
        align: "center",
      }
    );
    rewardsText.setOrigin(0.5);
    rewardsText.setScrollFactor(0);

    // Clear messages after delay
    this.time.delayedCall(3000, () => {
      completionText.destroy();
      rewardsText.destroy();

      // Start next wave after showing rewards
      if (this.waveCombatManager && !this.waveCombatManager.isWaveActive()) {
        this.waveCombatManager.startNextWave();
      }
    });
  }
}



