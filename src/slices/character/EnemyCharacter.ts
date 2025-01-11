import { FloatingText } from "@/shared/components/phaser-components/FloatingText";
import { BaseCharacter } from "./BaseChracter";
import { PlayerCharacter } from "./PlayerCharacter";
import {
  EnemyConfig,
  IActionType,
  IAnimationKey,
  PatrolPoint,
  DamageData,
  IAnimationConfig,
} from "./character.interface";
import { HealthBar } from "@/shared/components/phaser-components/HealthBar";
import { createDamageData } from "../combat/combat.utils";
import { CharacterStats } from "./character.interface";
import { SoundManager } from "../music-manager/sound-manager.service";
import { ESOUND_NAMES } from "../music-manager/sound-manager.types";

export class EnemyCharacter extends BaseCharacter {
  private hpBar: HealthBar;
  declare body: Phaser.Physics.Arcade.Body;
  private readonly showDebug: boolean = false;
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;

  // Enemy Character State
  public isHit: boolean = false;
  private canAttack: boolean = true;
  public isAttacking: boolean = false;
  private isWaiting: boolean = false;
  private target: PlayerCharacter | null = null;

  // Enemy Specific Stats
  private detectionRadius: number;
  private attackRange: number;
  private attackCooldown: number;

  // Patrol-related properties
  private currentPatrolIndex: number = 0;
  private patrolPoints: PatrolPoint[] = [];
  private moveEvent: Phaser.Time.TimerEvent | null = null;
  private waitTimer: Phaser.Time.TimerEvent | null = null;
  private soundManager: SoundManager;

  constructor(config: EnemyConfig) {
    super(config);
    this.stats = { ...config.stats };

    this.detectionRadius = config.detectionRadius;
    this.attackRange = config.attackRange;
    this.attackCooldown = config.attackCooldown;
    this.soundManager = SoundManager.getInstance();
    // Initialize Graphics
    this.hpBar = new HealthBar(this.scene);
    this.debugGraphics = this.showDebug ? this.scene.add.graphics() : null;
    this.updateHpBar();

    // If Patrol Is Provided - Start Patrol
    if (config.patrolPoints && config.patrolPoints.length > 0) {
      this.patrolPoints = [...config.patrolPoints];
      this.startPatrol();
    } else {
      this.play(this.animations["idle-down"], true);
    }

    // Show debug hitboxes
    if (this.showDebug) {
      this.debugGraphics = this.scene.add.graphics();
    }
  }

  protected override getAnimationConfigs(): Record<
    IActionType,
    IAnimationConfig
  > {
    const baseConfigs = super.getAnimationConfigs();
    return {
      ...baseConfigs,
    };
  }

  public takeDamage(damage: DamageData): void {
    if (this.isHit) return;

    this.isHit = true;
    this.stats.health -= damage.damage;

    // Update the HP bar
    this.updateHpBar();

    const hitAnim =
      this.animations[`${"hit"}-${this.facingDirection}` as IAnimationKey];

    new FloatingText({
      scene: this.scene,
      x: this.x,
      y: this.y - 20,
      text: damage.damage.toString(),
      color: "#ff0000",
    });

    // Check if enemy is dead
    if (this.stats.health <= 0) {
      this.handleDeath();
      return;
    }

    this.play(hitAnim, true).once("animationcomplete", () => {
      this.isHit = false;
      // Return to idle animation

      const idleAnim =
        this.animations[`idle-${this.facingDirection}` as IAnimationKey];
      this.play(idleAnim, true);
    });
  }

  private handleDeath(): void {
    // Disable physics body
    this.body.enable = false;

    // Stop any ongoing animations
    this.stop();

    // Create fade out effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500, // Duration in milliseconds
      ease: "Power2",
      onComplete: () => {
        // Clean up HP bars
        this.hpBar.destroy();

        // Remove the enemy sprite
        this.destroy();
      },
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
    // If player leaves detection range, trigger out of range handling
    const inRange = distance <= this.detectionRadius;
    return inRange;
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
    this.soundManager.playSFX(ESOUND_NAMES.ZOMBIE_GROWL_1);
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

    // Store previous facing direction
    const previousDirection = this.facingDirection;

    // Update facing direction
    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      this.facingDirection = velocityX > 0 ? "right" : "left";
    } else {
      this.facingDirection = velocityY > 0 ? "down" : "up";
    }

    // Only update animation if direction changed or not already walking
    if (previousDirection !== this.facingDirection || !this.anims.isPlaying) {
      const walkAnim =
        this.animations[`walk-${this.facingDirection}` as IAnimationKey];
      this.play(walkAnim, true);
    }
  }

  private async attackPlayer(): Promise<void> {
    if (!this.canAttack || !this.target) return;

    this.canAttack = false;
    this.isAttacking = true;

    // Play attack animation
    const attackAnim =
      this.animations[
        `attack-one-hand-${this.facingDirection}` as IAnimationKey
      ];
    if (!this.target) return;

    const damageData = createDamageData(
      this.stats,
      this.target.getStats(),
      undefined, // Enemies typically don't have weapons
      { x: this.x, y: this.y }
    );

    this.soundManager.playSFX(ESOUND_NAMES.ZOMBIE_BITE_1);
    // Deal damage to player with the calculated damage data
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

  // Add methods to handle stats
  public getStats(): CharacterStats {
    return { ...this.stats }; // Return a copy to prevent direct modification
  }

  update(time: number, delta: number): void {
    // Call parent update if needed
    super.update(time, delta);
    // Update HP bar position to follow the enemy
    this.updateHpBar();

    // Check for states that prevent movement
    if (this.isHit || this.isAttacking || this.isWaiting) {
      this.body?.setVelocity(0, 0);
      return;
    }

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
      // Player is out of range or no target
      this.handleOutOfRange();
    }

    if (this.showDebug) {
      this.drawDebugHitAreas();
    }
  }

  private handleOutOfRange(): void {
    // Stop movement
    this.body?.setVelocity(0, 0);

    // Play idle animation in current facing direction
    const idleAnim =
      this.animations[`idle-${this.facingDirection}` as IAnimationKey];

    // Only change animation if we're not already playing it
    if (!this.anims.isPlaying || this.anims.currentAnim?.key !== idleAnim) {
      this.play(idleAnim, true);
    }

    // If patrol points exist, resume patrol
    if (this.patrolPoints.length > 0) {
      this.moveToNextPoint();
    }
  }

  private drawDebugHitAreas(): void {
    if (!this.debugGraphics) return;

    this.debugGraphics.clear();

    // Draw enemy body
    this.debugGraphics.lineStyle(2, 0xff0000);
    this.debugGraphics.strokeRect(
      this.body.x,
      this.body.y,
      this.body.width,
      this.body.height
    );

    // Draw detection radius
    this.debugGraphics.lineStyle(2, 0xffff00);
    this.debugGraphics.strokeCircle(this.x, this.y, this.detectionRadius);

    // Draw attack range
    this.debugGraphics.lineStyle(2, 0xff6600);
    this.debugGraphics.strokeCircle(this.x, this.y, this.attackRange);
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
            `idle${this.capitalize(this.facingDirection)}` as IAnimationKey
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
      this.animations[`walk-${this.facingDirection}` as IAnimationKey];
    this.play(walkAnim, true);

    this.moveEvent = this.scene.time.delayedCall(100, () => {
      this.moveToNextPoint();
    });
  }

  public stopPatrol(): void {
    this.body?.setVelocity(0, 0);
    const idleAnim =
      this.animations[`idle-${this.facingDirection}` as IAnimationKey];

    //TODO - FIX
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

  private updateHpBar(): void {
    const { health, maxHealth } = this.stats;
    const healthRatio = Phaser.Math.Clamp(health / maxHealth, 0, 1);
    this.hpBar.update(this.x, this.y, healthRatio, -this.height / 2 - 4);
  }

  destroy() {
    this.stopPatrol();

    this.hpBar.destroy();
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
    }
    super.destroy();
  }
}
