import { IWaveConfig } from "./wave-combat.interface";

export const caveWaveConfigs: IWaveConfig[] = [
  // Wave 1
  {
    waveNumber: 1,
    enemies: [
      {
        type: "zombie-normal",
        count: 2,
        stats: {
          maxHealth: 50,
          health: 50,
          strength: 5,
          defense: 2,
          speed: 40,
        },
        dropTable: [
          { itemId: "gold", chance: 100, minQuantity: 1, maxQuantity: 5 },
        ],
      },
      {
        type: "rat-normal",
        count: 1,
        stats: {
          maxHealth: 50,
          health: 50,
          strength: 5,
          defense: 2,
          speed: 40,
        },
        dropTable: [
          { itemId: "gold", chance: 100, minQuantity: 1, maxQuantity: 5 },
        ],
      },
    ],
    isBossWave: false,
    rewards: {
      gold: 50,
      experience: 100,
    },
  },
  // Wave 2
  {
    waveNumber: 2,
    enemies: [
      {
        type: "zombie-normal",
        count: 4,
        stats: {
          maxHealth: 60,
          health: 60,
          strength: 6,
          defense: 3,
          speed: 45,
        },
        dropTable: [
          { itemId: "gold", chance: 100, minQuantity: 2, maxQuantity: 6 },
        ],
      },
    ],
    isBossWave: false,
    rewards: {
      gold: 75,
      experience: 150,
    },
  },
  // Wave 3 (Boss Wave)
  {
    waveNumber: 3,
    enemies: [
      {
        type: "zombie-epic",
        count: 1,
        stats: {
          maxHealth: 200,
          health: 200,
          strength: 15,
          defense: 8,
          speed: 35,
        },
        dropTable: [
          { itemId: "gold", chance: 100, minQuantity: 10, maxQuantity: 20 },
          { itemId: "rare_weapon", chance: 50, minQuantity: 1, maxQuantity: 1 },
        ],
      },
      {
        type: "zombie-normal",
        count: 2,
        stats: {
          maxHealth: 70,
          health: 70,
          strength: 7,
          defense: 3,
          speed: 45,
        },
        dropTable: [
          { itemId: "gold", chance: 100, minQuantity: 3, maxQuantity: 8 },
        ],
      },
    ],
    isBossWave: true,
    rewards: {
      gold: 200,
      experience: 500,
    },
  },
];
