import { Scene } from "phaser";
import { SpiritCharacter } from "../character/SpiritCharacter";
import { GAME_ITEM_KEYS } from "../items/items.interface";

interface SpiritQuestConfig {
  questItem: GAME_ITEM_KEYS;
  questAmount: number;
  rewards: {
    gold?: number;
    items?: { item: GAME_ITEM_KEYS; amount: number }[];
  };
}

export class SpiritManager {
  private scene: Scene;
  private spawnTimer: Phaser.Time.TimerEvent | null = null;

  private questConfigs: SpiritQuestConfig[];
  private player: Phaser.GameObjects.GameObject;
  private maxAllowedSpirits: number = 1; // Default to 1
  private activeSpirits: SpiritCharacter[] = []; // Track all active spirits

  constructor(
    scene: Scene,
    player: Phaser.GameObjects.GameObject,
    maxSpirits: number = 1
  ) {
    this.scene = scene;
    this.maxAllowedSpirits = maxSpirits;
    this.player = player;
    this.activeSpirits = [];
    // Example quest configurations - can be expanded
    this.questConfigs = [
      {
        questItem: GAME_ITEM_KEYS.CARROT_SEEDS,
        questAmount: 1,
        rewards: {
          gold: 100,
        },
      },
      {
        questItem: GAME_ITEM_KEYS.RADISH_SEEDS,
        questAmount: 1,
        rewards: {
          items: [{ item: GAME_ITEM_KEYS.HEALTH_POTION_LARGE, amount: 2 }],
        },
      },
      // Add more configurations as needed
    ];
  }

  public startRandomSpawning(
    minInterval: number = 5000,
    maxInterval: number = 10000
  ) {
    // Start the spawn timer (default 5-10 minutes)
    this.scheduleNextSpawn(minInterval, maxInterval);
  }

  public stopRandomSpawning() {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }
  }

  private scheduleNextSpawn(minInterval: number, maxInterval: number) {
    const delay = Phaser.Math.Between(minInterval, maxInterval);

    this.spawnTimer = this.scene.time.addEvent({
      delay,
      callback: () => {
        this.spawnSpirit();
        this.scheduleNextSpawn(minInterval, maxInterval);
      },
      callbackScope: this,
    });
  }

  private getRandomSpawnPosition(): { x: number; y: number } {
    // Get a random position within the map bounds
    // This should be adjusted based on your game's map size and valid spawn areas
    // const mapWidth = this.scene.game.scale.width;
    // const mapHeight = this.scene.game.scale.height;

    return {
      x: 100,
      y: 200,
    };
  }

  private getRandomQuestConfig(): SpiritQuestConfig {
    return this.questConfigs[
      Phaser.Math.Between(0, this.questConfigs.length - 1)
    ];
  }

  public spawnSpirit() {
    // If there's already a spirit, don't spawn another one
    console.log("SPIRIT QUEST SERVICE - ACTIVE SPIRITS: ", this.activeSpirits);
    console.log("SPIRIT QUEST SERVICE - MAX SPIRITS: ", this.maxAllowedSpirits);
    if (this.activeSpirits.length >= this.maxAllowedSpirits) {
      return;
    }

    const spawnPos = this.getRandomSpawnPosition();
    const questConfig = this.getRandomQuestConfig();

    const spirit = new SpiritCharacter({
      scene: this.scene,
      x: spawnPos.x,
      y: spawnPos.y,
      characterType: "spirit-normal",
      stats: {
        defense: 0,
        health: 0,
        maxHealth: 0,
        speed: 0,
        strength: 0,
      },
      texture: "spirit-normal",
      ...questConfig,
    });

    spirit.play("spirit-normal-idle-down");

    // Add to active spirits array
    this.activeSpirits.push(spirit);
    // When the spirit is destroyed, remove it from the array
    spirit.once("destroy", () => {
      const index = this.activeSpirits.indexOf(spirit);
      if (index > -1) {
        this.activeSpirits.splice(index, 1);
      }
    });

    // Set up the spirit with player reference for interaction checking
    if (this.player) {
      spirit.setPlayer(this.player);
    }
  }

  public destroy() {
    this.stopRandomSpawning();
    // Destroy all active spirits
    this.activeSpirits.forEach((spirit) => {
      spirit.destroy();
    });
    this.activeSpirits = [];
  }

  public setMaxSpirits(max: number) {
    this.maxAllowedSpirits = max;
  }

  public getCurrentSpiritCount(): number {
    return this.activeSpirits.length;
  }

  public getMaxAllowedSpirits(): number {
    return this.maxAllowedSpirits;
  }
}
