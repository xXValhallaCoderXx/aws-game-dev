import { CharacterStats } from "../character/character.interface";

export interface WaveConfig {
  waveNumber: number;
  enemies: EnemySpawnConfig[];
  isBossWave: boolean;
  rewards: WaveRewards;
}

export interface EnemySpawnConfig {
  type: string;
  count: number;
  stats: CharacterStats;
  dropTable: DropTable[];
}

export interface DropTable {
  itemId: string;
  chance: number; // 0-100
  minQuantity: number;
  maxQuantity: number;
}

export interface WaveRewards {
  experience: number;
  gold: number;
  guaranteedDrops?: DropTable[];
}
