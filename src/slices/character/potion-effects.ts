export interface PotionEffect {
  type: 'strength';
  value: number;
  duration: number;
  startTime: number;
  timeout?: NodeJS.Timeout;
}

export interface ActiveEffects {
  strength?: PotionEffect;
}