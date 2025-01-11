import { Scene } from "phaser";
import { IWaveConfig } from "./wave-combat.interface";
import { EnemyCharacter } from "../character/EnemyCharacter";
import { PlayerCharacter } from "../character/PlayerCharacter";
import { IEnemyType } from "../character/character.interface";

export class WaveCombatManager {
  private currentWave: number = 0;
  private activeEnemies: EnemyCharacter[] = [];
  private waveConfigs: IWaveConfig[] = [];
  private isWaveInProgress: boolean = false;

  constructor(
    private scene: Scene,
    private player: PlayerCharacter,
    waveConfigs: IWaveConfig[]
  ) {
    this.waveConfigs = waveConfigs;
  }

  public startNextWave(): void {
    if (this.isWaveInProgress) {
      console.warn("Cannot start next wave while current wave is in progress");
      return;
    }

    this.currentWave++;
    const waveConfig = this.waveConfigs[this.currentWave - 1];

    if (!waveConfig) {
      console.log("All waves completed!");
      return;
    }

    this.isWaveInProgress = true;
    this.spawnWaveEnemies(waveConfig);
  }

  private spawnWaveEnemies(waveConfig: IWaveConfig): void {
    waveConfig.enemies.forEach((enemyConfig) => {
      for (let i = 0; i < enemyConfig.count; i++) {
        // Random position calculation (you might want to adjust these values)
        const x = Math.random() * 400 + 100; // Assuming map boundaries
        const y = Math.random() * 200 + 100;

        const enemy = new EnemyCharacter({
          scene: this.scene,
          x,
          y,
          texture: enemyConfig.type,

          characterType: enemyConfig.type as IEnemyType,
          attackCooldown: 1000,
          attackRange: 20,
          detectionRadius: 100,
          enemyType: "zombie-epic",
          stats: enemyConfig.stats,
        });

        enemy.setTarget(this.player);
        this.activeEnemies.push(enemy);

        // Add physics collider between player and enemy
        this.scene.physics.add.collider(this.player, enemy);
      }
    });
  }

  public update(time: number, delta: number): void {
    // Clean up defeated enemies
    this.activeEnemies = this.activeEnemies.filter((enemy) => enemy.active);
    this.activeEnemies.forEach((enemy) => enemy.update(time, delta));
    // Check if wave is complete
    if (this.isWaveInProgress && this.activeEnemies.length === 0) {
      this.onWaveComplete();
    }
  }

  private onWaveComplete(): void {
    this.isWaveInProgress = false;
    const currentWaveConfig = this.waveConfigs[this.currentWave - 1];

    if (currentWaveConfig.isBossWave) {
      console.log("Boss wave completed! Special rewards available!");
      // Implement reward distribution logic here
    }

    // Emit wave complete event that the scene can listen to
    this.scene.events.emit("waveComplete", {
      waveNumber: this.currentWave,
      rewards: currentWaveConfig.rewards,
    });
  }

  public getCurrentWave(): number {
    return this.currentWave;
  }

  public isWaveActive(): boolean {
    return this.isWaveInProgress;
  }

  public getActiveEnemies(): EnemyCharacter[] {
    return this.activeEnemies;
  }
}
