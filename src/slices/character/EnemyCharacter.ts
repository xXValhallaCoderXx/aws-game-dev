import { BaseCharacter } from "./BaseChracter";
import { PlayerCharacter } from "./PlayerCharacter";
import {
  EnemyConfig,
  CharacterStats,
  AnimationKey,
  PatrolPoint,
  DamageData,
} from "./character.interface";

export class EnemyCharacter extends BaseCharacter {
  private hpBarContainer: Phaser.GameObjects.Graphics;
  private hpBar: Phaser.GameObjects.Graphics;

  private stats: CharacterStats;
  private enemyType: string;
  public isHit: boolean = false;
  public isAttacking: boolean = false;
  declare body: Phaser.Physics.Arcade.Body;

  // Add new patrol-related properties
  private patrolPoints: PatrolPoint[] = [];
  private currentPatrolIndex: number = 0;
  private isWaiting: boolean = false;
  private waitTimer: Phaser.Time.TimerEvent | null = null;

  private detectionRadius: number = 100; // Adjust this value as needed
  private attackRange: number = 20; // Adjust based on your game's scale
  private attackCooldown: number = 1000; // 1 second cooldown between attacks
  private canAttack: boolean = true;
  private target: PlayerCharacter | null = null;
  private moveEvent: Phaser.Time.TimerEvent | null = null;

  constructor(config: EnemyConfig) {
    super(config);
    this.stats = { ...config.stats };
    this.enemyType = config.enemyType;
    this.setupAnimations();

    // Set up patrol points if provided
    if (config.patrolPoints && config.patrolPoints.length > 0) {
      this.patrolPoints = [...config.patrolPoints];
      this.startPatrol();
    } else {
      this.play(this.animations.idleDown, true);
    }

    this.hpBarContainer = this.scene.add.graphics();
    this.hpBar = this.scene.add.graphics();
    this.updateHpBar();
  }

  private updateHpBar(): void {
    const barWidth = 20; // Smaller width for more elegant look
    const barHeight = 2.5;
    const borderThickness = 1;
    const offsetY = -this.height / 2 - 4; // Adjust offset for better positioning
    const healthRatio = Phaser.Math.Clamp(
      this.stats.health / this.stats.maxHealth,
      0,
      1
    );

    // Clear previous graphics
    this.hpBarContainer.clear();
    this.hpBar.clear();

    // Draw border/background
    this.hpBarContainer.fillStyle(0x8b5a2b); // Brown cozy border color
    this.hpBarContainer.fillRect(
      -barWidth / 2 - borderThickness,
      offsetY - borderThickness,
      barWidth + borderThickness * 2,
      barHeight + borderThickness * 2
    );

    // Draw background bar (light brown)
    this.hpBarContainer.fillStyle(0xd4a374);
    this.hpBarContainer.fillRect(-barWidth / 2, offsetY, barWidth, barHeight);

    // Draw health bar (red color for cozy style)
    this.hpBar.fillStyle(0xff5555);
    this.hpBar.fillRect(
      -barWidth / 2,
      offsetY,
      barWidth * healthRatio,
      barHeight
    );
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

  // Method to set the player as target
  public setTarget(player: PlayerCharacter): void {
    this.target = player;
  }

  private isPlayerInDetectionRange(): boolean {
    if (!this.target) return false;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    );

    return distance <= this.detectionRadius;
  }

  private isPlayerInAttackRange(): boolean {
    if (!this.target) return false;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    );

    return distance <= this.attackRange;
  }

  private moveTowardsPlayer(): void {
    if (!this.target) return;

    // Calculate angle to player
    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    );

    // Set velocity based on angle
    const speed = this.stats.speed;
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    this.body?.setVelocity(velocityX, velocityY);

    // Update facing direction
    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      this.facingDirection = velocityX > 0 ? "right" : "left";
    } else {
      this.facingDirection = velocityY > 0 ? "down" : "up";
    }

    // Play walking animation
    const walkAnim =
      this.animations[
        `walk${this.capitalize(this.facingDirection)}` as AnimationKey
      ];
    this.play(walkAnim, true);
  }

  private async attackPlayer(): Promise<void> {
    if (!this.canAttack || !this.target) return;

    this.canAttack = false;
    this.isAttacking = true;

    // Play attack animation
    const attackAnim =
      this.animations[
        `attack${this.capitalize(this.facingDirection)}` as AnimationKey
      ];

    const damageData: DamageData = {
      damage: this.stats.strength,
      strength: this.stats.strength * 0.9, // Use enemy's strength stat
      sourcePosition: { x: this.x, y: this.y },
    };

    // Deal damage to player with the damage data
    this.target.takeDamage(damageData);

    // Play attack animation and wait for it to complete
    await new Promise<void>((resolve) => {
      this.play(attackAnim, true).once("animationcomplete", () => {
        this.isAttacking = false;
        resolve();
      });
    });

    // Start cooldown
    this.scene.time.delayedCall(this.attackCooldown, () => {
      this.canAttack = true;
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

  update(time: number, delta: number): void {
    // Check for states that prevent movement
    if (this.isHit || this.isAttacking || this.isWaiting) {
      this.body?.setVelocity(0, 0);
      return;
    }

    // Update HP bar position to follow the monster
    this.hpBarContainer.setPosition(this.x, this.y);
    this.hpBar.setPosition(this.x, this.y);
    // If we have a target (player), check if they're in range
    if (this.target && this.isPlayerInDetectionRange()) {
      if (this.isPlayerInAttackRange()) {
        // Stop and attack
        this.body?.setVelocity(0, 0);
        this.attackPlayer();
      } else {
        // Move towards player
        this.moveTowardsPlayer();
      }
    } else {
      // No player in range, handle normal patrol behavior
      if (this.patrolPoints.length === 0) {
        // If not patrolling and not moving, play idle animation
        if (this.body?.velocity.x === 0 && this.body?.velocity.y === 0) {
          const idleAnim =
            this.animations[
              `idle${this.capitalize(this.facingDirection)}` as AnimationKey
            ];
          this.play(idleAnim, true);
        }
      } else {
        // Continue with patrol behavior
        this.moveToNextPoint();
      }
    }

    // Call parent update if needed
    super.update(time, delta);
  }

  private startPatrol(): void {
    if (this.patrolPoints.length === 0) return;
    this.moveToNextPoint();
  }

  private moveToNextPoint(): void {
    if (this.isHit || this.isAttacking) return;

    const targetPoint = this.patrolPoints[this.currentPatrolIndex];
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      targetPoint.x,
      targetPoint.y
    );

    if (distance < 2) {
      this.body?.setVelocity(0, 0);

      if (targetPoint.waitTime && targetPoint.waitTime > 0) {
        this.isWaiting = true;
        const idleAnim =
          this.animations[
            `idle${this.capitalize(this.facingDirection)}` as AnimationKey
          ];
        this.play(idleAnim, true);

        this.waitTimer = this.scene.time.delayedCall(
          targetPoint.waitTime,
          () => {
            this.isWaiting = false;
            this.currentPatrolIndex =
              (this.currentPatrolIndex + 1) % this.patrolPoints.length;
            this.moveToNextPoint();
          }
        );
      } else {
        this.currentPatrolIndex =
          (this.currentPatrolIndex + 1) % this.patrolPoints.length;
        this.moveToNextPoint();
      }
      return;
    }

    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      targetPoint.x,
      targetPoint.y
    );

    const speed = this.stats.speed;
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    this.body?.setVelocity(velocityX, velocityY);

    // Update facing direction based on movement
    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      this.facingDirection = velocityX > 0 ? "right" : "left";
    } else {
      this.facingDirection = velocityY > 0 ? "down" : "up";
    }

    // Play walking animation
    const walkAnim =
      this.animations[
        `walk${this.capitalize(this.facingDirection)}` as AnimationKey
      ];
    this.play(walkAnim, true);

    this.moveEvent = this.scene.time.delayedCall(100, () => {
      this.moveToNextPoint();
    });
  }

  public stopPatrol(): void {
    this.body?.setVelocity(0, 0);
    const idleAnim =
      this.animations[
        `idle${this.capitalize(this.facingDirection)}` as AnimationKey
      ];
    this.play(idleAnim, true);

    if (this.moveEvent) {
      this.moveEvent.destroy();
      this.moveEvent = null;
    }
    if (this.waitTimer) {
      this.waitTimer.destroy();
      this.waitTimer = null;
    }
  }

  public resumePatrol(): void {
    if (this.patrolPoints.length > 0) {
      this.moveToNextPoint();
    }
  }

  destroy() {
    this.stopPatrol();
    this.hpBarContainer.destroy();
    this.hpBar.destroy();
    super.destroy();
  }
}
