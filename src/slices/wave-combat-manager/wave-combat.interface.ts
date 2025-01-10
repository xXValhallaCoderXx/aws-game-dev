import { CharacterStats } from "../character/character.interface";

export interface IWaveManager {
  currentWave: number;
  isWaveActive: boolean;
  totalEnemiesInWave: number;
  remainingEnemies: number;
}

export interface IWaveConfig {
  enemies: {
    type: string;
    count: number;
    stats: CharacterStats;
  }[];
  isBossWave: boolean;
  rewards?: {
    gold?: number;
    items?: string[];
  };
}