import { Scene } from "phaser";
import {
  BaseCharacterConfig,
  Direction,
  DirectionCapitalized,
  CharacterStats,
  ICharacterType,
  IAnimationConfig,
  IActionType,
} from "./character.interface";

export abstract class BaseCharacter extends Phaser.Physics.Arcade.Sprite {
  public scene: Scene;
  public stats: CharacterStats;
  protected readonly directions: Direction[] = ["down", "left", "right", "up"];
  protected characterType: ICharacterType;
  public facingDirection: Direction = "down";
  protected animations: Record<string, string> = {};
  // protected carryAnimations: Record<string, string> = {};

  constructor(config: BaseCharacterConfig) {
    // Call the parent class constructor with texture key and initial position
    super(config.scene, config.x, config.y, config.texture);
    this.scene = config.scene;
    this.stats = config.stats;
    this.characterType = config.characterType;

    // Add sprite to scene
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 0.5);

    if (this.body) {
      // **Adjust the physics body to match the sprite**
      this.body.setSize(16, 16);
    }

    // Set up animations and store them in the animations property
    // this.animations = this.getDefaultAnimations();
    this.setupAnimations();
  }

  protected getAnimationConfigs(): Record<IActionType, IAnimationConfig> {
    return {
      walk: {
        type: "sequential",
        framesPerDirection: 6,
        frameRate: 8,
        repeat: -1,
        frameStart: (dirIndex: number) => dirIndex * 6,
        frameEnd: (dirIndex: number) => dirIndex * 6 + 3,
      },
      idle: {
        type: "sequential",
        framesPerDirection: 6,
        frameRate: 4,
        repeat: -1,
        frameStart: (dirIndex: number) => dirIndex * 6,
        frameEnd: (dirIndex: number) => dirIndex * 6 + 3,
      },
      hit: {
        type: "specific",
        framesPerDirection: 6,
        frameRate: 8,
        repeat: 0,
        frames: (dirIndex: number) => [dirIndex * 6 + 4],
      },
      "critical-hit": {
        type: "specific",
        framesPerDirection: 6,
        frameRate: 8,
        repeat: 0,
        frames: (dirIndex: number) => [dirIndex * 6 + 5],
      },
      "attack-one-hand": {
        type: "custom",
        framesPerDirection: 4,
        frameRate: 8,
        repeat: 0,
        customFrames: {
          down: { start: 25, end: 28 },
          left: { start: 31, end: 34 },
          right: { start: 37, end: 40 },
          up: { start: 43, end: 46 },
        },
      },
    };
  }

  protected setupAnimations(): void {
    const configs = this.getAnimationConfigs();

    this.directions.forEach((direction, dirIndex) => {
      Object.entries(configs).forEach(([action, config]) => {
        const baseKey = `${this.characterType}-${action}-${direction}`;
        console.log("BASE KEY: ", baseKey);
        if (!this.scene.anims.exists(baseKey)) {
          let frames;

          switch (config.type) {
            case "custom":
              frames = this.scene.anims.generateFrameNumbers(this.texture.key, {
                start: config.customFrames[direction].start,
                end: config.customFrames[direction].end,
              });
              break;

            case "specific":
              frames = this.scene.anims.generateFrameNumbers(this.texture.key, {
                frames: config.frames(dirIndex),
              });
              break;

            case "sequential":
              frames = this.scene.anims.generateFrameNumbers(this.texture.key, {
                start: config.frameStart(dirIndex),
                end: config.frameEnd(dirIndex),
              });
              break;
          }

          this.scene.anims.create({
            key: baseKey,
            frames: frames,
            frameRate: config.frameRate,
            repeat: config.repeat,
          });
        }

        // Store animation key for later use
        this.animations[`${action}-${direction}`] = baseKey;
      });
    });
  }

  protected capitalize(str: Direction): DirectionCapitalized {
    return (str.charAt(0).toUpperCase() + str.slice(1)) as DirectionCapitalized;
  }

  public getFacingDirection(): Direction {
    return this.facingDirection;
  }

  public setFacingDirection(direction: Direction): void {
    this.facingDirection = direction;
  }
}
