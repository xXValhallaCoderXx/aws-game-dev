import { BaseCharacter } from "./BaseChracter";
import {
  EnemyConfig,
  EnemyStats,
  AnimationKey,
  //   PatrolPoint
} from "./player-character.interface";

export class EnemyCharacter extends BaseCharacter {
  private stats: EnemyStats;
  private enemyType: string;
  public isHit: boolean = false;
  public isAttacking: boolean = false;

  constructor(config: EnemyConfig) {
    super(config);
    this.stats = { ...config.stats };
    this.enemyType = config.enemyType;
    this.setupAnimations();
    this.play(this.animations.idleDown, true);
  }

  protected setupAnimations(): void {
    const directions = ["Down", "Left", "Right", "Up"];

    directions.forEach((direction, dirIndex) => {
      // Walking/Idle animations
      const walkStartFrame = dirIndex * 6;
      this.scene.anims.create({
        key: `${this.enemyType}-walk${direction}`,
        frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
          start: walkStartFrame,
          end: walkStartFrame + 3,
        }),
        frameRate: 8,
        repeat: -1,
      });

      // Idle animations (same frames as walk but slower)
      this.scene.anims.create({
        key: `${this.enemyType}-idle${direction}`,
        frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
          start: walkStartFrame,
          end: walkStartFrame + 3,
        }),
        frameRate: 4,
        repeat: -1,
      });

      // Normal Hit animations
      this.scene.anims.create({
        key: `${this.enemyType}-hit${direction}`,
        frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
          frames: [walkStartFrame + 4],
        }),
        frameRate: 8,
        repeat: 0,
      });

      // Critical Hit animations
      this.scene.anims.create({
        key: `${this.enemyType}-criticalHit${direction}`,
        frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
          frames: [walkStartFrame + 5],
        }),
        frameRate: 8,
        repeat: 0,
      });
    });

    // Attack animations
    const attackFrames = {
      Down: { start: 30, end: 31 },
      Left: { start: 36, end: 39 },
      Right: { start: 42, end: 45 },
      Up: { start: 48, end: 51 },
    };

    Object.entries(attackFrames).forEach(([direction, frames]) => {
      this.scene.anims.create({
        key: `${this.enemyType}-attack${direction}`,
        frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
          start: frames.start,
          end: frames.end,
        }),
        frameRate: 8,
        repeat: 0,
      });
    });
  }

  protected getDefaultAnimations(): Record<string, string> {
    return {
      walkUp: `${this.enemyType}-walkUp`,
      walkDown: `${this.enemyType}-walkDown`,
      walkLeft: `${this.enemyType}-walkLeft`,
      walkRight: `${this.enemyType}-walkRight`,
      idleUp: `${this.enemyType}-idleUp`,
      idleDown: `${this.enemyType}-idleDown`,
      idleLeft: `${this.enemyType}-idleLeft`,
      idleRight: `${this.enemyType}-idleRight`,
      attackUp: `${this.enemyType}-attackUp`,
      attackDown: `${this.enemyType}-attackDown`,
      attackLeft: `${this.enemyType}-attackLeft`,
      attackRight: `${this.enemyType}-attackRight`,
      hitUp: `${this.enemyType}-hitUp`,
      hitDown: `${this.enemyType}-hitDown`,
      hitLeft: `${this.enemyType}-hitLeft`,
      hitRight: `${this.enemyType}-hitRight`,
      criticalHitUp: `${this.enemyType}-criticalHitUp`,
      criticalHitDown: `${this.enemyType}-criticalHitDown`,
      criticalHitLeft: `${this.enemyType}-criticalHitLeft`,
      criticalHitRight: `${this.enemyType}-criticalHitRight`,
    };
  }

  public takeDamage(damage: number, isCritical: boolean = false): void {
    if (this.isHit) return;

    this.isHit = true;
    this.stats.health -= damage;

    const hitAnim =
      this.animations[
        `${isCritical ? "criticalHit" : "hit"}${this.capitalize(
          this.facingDirection
        )}` as AnimationKey
      ];

    this.play(hitAnim, true).once("animationcomplete", () => {
      this.isHit = false;
      // Return to idle animation
      const idleAnim =
        this.animations[
          `idle${this.capitalize(this.facingDirection)}` as AnimationKey
        ];
      this.play(idleAnim, true);
    });
  }

  public attack(): void {
    if (this.isAttacking || this.isHit) return;

    this.isAttacking = true;
    const attackAnim =
      this.animations[
        `attack${this.capitalize(this.facingDirection)}` as AnimationKey
      ];

    this.play(attackAnim, true).once("animationcomplete", () => {
      this.isAttacking = false;
      // Return to idle animation
      const idleAnim =
        this.animations[
          `idle${this.capitalize(this.facingDirection)}` as AnimationKey
        ];
      this.play(idleAnim, true);
    });
  }

  update(): void {
    if (this.isHit || this.isAttacking) return;

    // Handle movement and state changes here
    if (this.body?.velocity.x === 0 && this.body?.velocity.y === 0) {
      const idleAnim =
        this.animations[
          `idle${this.capitalize(this.facingDirection)}` as AnimationKey
        ];
      this.play(idleAnim, true);
    }
  }
}
