export enum EFarmingCrops {
  CARROT = "carrot-seed",
  RADISH = "radish-seed",
  CAULIFLOWER = "cauliflower-seed",
}

export enum EFarmingCropYields {
  CARROT = "carrot-crop",
  RADISH = "radish-crop",
  CAULIFLOWER = "cauliflower-crop",
}

interface CropYield {
  cropId: string;
  name: string;
  baseYield: number;
  qualityBonusChance?: number; // Optional: chance to get bonus crops
}

export type CropHarvestMapping = {
  [key in EFarmingCrops]: CropYield;
};
