import { Scene } from "phaser";
import { SpiritCharacter } from "./SpiritCharacter";
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
  private currentSpirit: SpiritCharacter | null = null;
  private questConfigs: SpiritQuestConfig[];

  constructor(scene: Scene) {
    this.scene = scene;
    // Example quest configurations - can be expanded
    this.questConfigs = [
      {
        questItem: GAME_ITEM_KEYS.HEALTH_POTION_LARGE,
        questAmount: 5,
        rewards: {
          gold: 100,
        },
      },
      {
        questItem: GAME_ITEM_KEYS.HEALTH_POTION_LARGE,
        questAmount: 3,
        rewards: {
          items: [{ item: GAME_ITEM_KEYS.HEALTH_POTION_LARGE, amount: 2 }],
        },
      },
      // Add more configurations as needed
    ];
  }

  public startRandomSpawning(
    minInterval: number = 300000,
    maxInterval: number = 600000
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
    const mapWidth = this.scene.game.scale.width;
    const mapHeight = this.scene.game.scale.height;

    return {
      x: Phaser.Math.Between(100, mapWidth - 100),
      y: Phaser.Math.Between(100, mapHeight - 100),
    };
  }

  private getRandomQuestConfig(): SpiritQuestConfig {
    return this.questConfigs[
      Phaser.Math.Between(0, this.questConfigs.length - 1)
    ];
  }

  public spawnSpirit() {
    // If there's already a spirit, don't spawn another one
    if (this.currentSpirit) {
      return;
    }

    const spawnPos = this.getRandomSpawnPosition();
    const questConfig = this.getRandomQuestConfig();

    this.currentSpirit = new SpiritCharacter({
      scene: this.scene,
      x: spawnPos.x,
      y: spawnPos.y,
      texture: "spirit", // Make sure this sprite exists
      characterType: "spirit-normal",
      stats: {
        defense: 0,
        health: 0,
        maxHealth: 0,
        speed: 0,
        strength: 0,
      },

      ...questConfig,
    });

    this.currentSpirit.play("spirit-idle-down");

    // When the spirit is destroyed (fades away), clear the reference
    this.currentSpirit.once("destroy", () => {
      this.currentSpirit = null;
    });

    // Start the initial dialogue
    this.currentSpirit.initiateDialogue();
  }

  public destroy() {
    this.stopRandomSpawning();
    if (this.currentSpirit) {
      this.currentSpirit.destroy();
      this.currentSpirit = null;
    }
  }
}
