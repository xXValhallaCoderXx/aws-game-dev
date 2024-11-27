export interface AnimationFrameConfig {
  start: number;
  end: number;
}

export interface AnimationConfig {
  entity: string; // e.g., 'player', 'monster'
  actions: {
    [action: string]: {
      frameConfig: AnimationFrameConfig;
      frameRate: number;
      repeat: number | boolean;
      suffix?: string; // e.g., 'carry' for carrying animations
    };
  };
  directions: string[]; // e.g., ['up', 'down', 'left', 'right']
}
