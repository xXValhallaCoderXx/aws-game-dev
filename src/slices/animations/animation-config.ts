import { AnimationConfig } from "./antimations.interface";

export const animationConfigs: AnimationConfig[] = [
  {
    entity: "player",
    actions: {
      walk: {
        frameConfig: { start: 0, end: 5 },
        frameRate: 10,
        repeat: -1,
        suffix: "walk",
      },
      idle: {
        frameConfig: { start: 0, end: 5 },
        frameRate: 1,
        repeat: -1,
        suffix: "idle",
      },
      harvest: {
        frameConfig: { start: 0, end: 5 },
        frameRate: 8,
        repeat: 1,
        suffix: "harvest",
      },
      carryWalk: {
        frameConfig: { start: 0, end: 5 },
        frameRate: 10,
        repeat: -1,
        suffix: "carry-walk",
      },
      carryIdle: {
        frameConfig: { start: 0, end: 5 },
        frameRate: 1,
        repeat: -1,
        suffix: "carry-idle",
      },
      // Add more actions if necessary
    },
    directions: ["up", "down", "left", "right"],
  },
  // Define configurations for other entities like monsters here
];
