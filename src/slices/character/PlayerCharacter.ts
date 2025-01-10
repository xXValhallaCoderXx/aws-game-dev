/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BaseCharacter } from "./BaseChracter";
import { EnemyCharacter } from "./EnemyCharacter";
import { InventoryItem } from "../inventory/inventory.interface";
import { Inventory } from "../inventory/inventory.service";
import {
  CharacterStats,
  PlayerConfig,
  IAnimationConfig,
  IAnimationKey,
  Direction,
  AnimationKeyCarry,
  KnockbackConfig,
  DamageData,
  IActionType,
  DirectionOrder,
} from "./character.interface";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import { INVENTORY_EVENTS } from "../events/phaser-events.types";
import { PLAYER_EVENTS } from "../events/phaser-events.types";
import { SoundManager } from "../music-manager/sound-manager.service";
import { ESOUND_NAMES } from "../music-manager/sound-manager.types";
import { FloatingText } from "@/shared/components/phaser-components/FloatingText";
import { SPRITE_SHEETS } from "@/shared/constants/sprite-sheet-names";

// NOTE - May need to make animationsCreated static to ensure only 1 instance
export class PlayerCharacter extends BaseCharacter {
  protected readonly directionOrder: DirectionOrder = "DULR"; // Override to use player's order
  private attackHitboxes: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  public carriedItem?: string;
  public isCarrying: boolean = false;
  public isHarvesting: boolean = false;
  public isRolling: boolean = false;
  public isAttacking: boolean = false;
  public inventory: Inventory;

  private debugGraphics: Phaser.GameObjects.Graphics | null = null;
  private readonly showDebug: boolean =
    import.meta.env.VITE_DEBUG_HITBOX === "true";

  private isKnockedBack: boolean = false;
  private knockbackConfig: KnockbackConfig = {
    duration: 200, // Duration of knockback in ms
    minDistance: 30, // Minimum knockback distance
    maxDistance: 150, // Maximum knockback distance
    easing: Phaser.Math.Easing.Cubic.Out,
  };

  private readonly attackMovementPenalty: number = 0.5; // 50% speed reduction while attacking
  private attackHitbox!: Phaser.GameObjects.Rectangle;
  private enemies: EnemyCharacter[] = [];
  private soundManager: SoundManager;

  public isDamaged: boolean = false; // Add this
  private isInvincible: boolean = false;
  private invincibilityDuration: number = 1000; // 1 second of invincibility after being hit

  private weaponSprite: Phaser.GameObjects.Sprite;
  protected cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(config: PlayerConfig) {
    super(config);
    if (this.scene) {
      // Add null check
      // this.cursors = this.scene.input.keyboard?.createCursorKeys();
      this.setDepth(10); // Arbitrary high value
    }
    this.stats = { ...config.stats }; // Clone stats to avoid reference issues

    // Initialize cursors with proper error handling
    if (!this.scene.input.keyboard) {
      throw new Error("Keyboard input not available in the current scene");
    }
    this.soundManager = SoundManager.getInstance();
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    // this.carryAnimations = this.getCarryAnimations();
    this.inventory = new Inventory({
      scene: this.scene,
    });
    this.initializeStartingInventory();

    this.weaponSprite = this.scene.add.sprite(
      this.x,
      this.y,
      "player-attack-one-hand-sword"
    );
    this.weaponSprite.setVisible(false); // Hide initially

    this.inventory.setupKeyboardListeners(this.scene);

    this.scene.input.keyboard
      ?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      .on("down", () => {
        this.roll();
      });

    this.scene.input.keyboard
      ?.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL)
      .on("down", () => {
        this.attackOneHand();
      });

    this.emitHealthStats();

    PhaserEventBus.emit(
      INVENTORY_EVENTS.GET_ALL_ITEMS,
      this.inventory.getAllItems()
    );

    if (this.showDebug) {
      this.debugGraphics = this.scene.add.graphics();
    }
  }

  private emitHealthStats(): void {
    PhaserEventBus.emit(PLAYER_EVENTS.HEALTH_INITIALIZED, this.stats.health);

    PhaserEventBus.emit(PLAYER_EVENTS.MAX_HEALTH_CHANGED, this.stats.maxHealth);
  }

  // Add methods to handle stats
  public getStats(): CharacterStats {
    return { ...this.stats }; // Return a copy to prevent direct modification
  }

  protected override getAnimationConfigs(): Record<
    IActionType,
    IAnimationConfig
  > {
    return {
      walk: {
        type: "sequential",
        framesPerDirection: 6,
        frameRate: 10,
        repeat: -1,
        spritesheet: SPRITE_SHEETS.PlayerWalk,
        frameStart: (dirIndex: number) => {
          console.log("DIR INDEX - frame START: ", dirIndex);
          return dirIndex * 6;
        },
        frameEnd: (dirIndex: number) => {
          console.log("DIR INDEX - FRAME END: ", dirIndex);
          return dirIndex * 6 + 5;
        },
      },
      idle: {
        type: "sequential",
        framesPerDirection: 6,
        frameRate: 8,
        repeat: -1,
        spritesheet: SPRITE_SHEETS.PlayerIdle,
        frameStart: (dirIndex: number) => dirIndex * 6,
        frameEnd: (dirIndex: number) => dirIndex * 6 + 5,
      },
      // 'roll': {
      //   type: 'sequential',
      //   framesPerDirection: 9,
      //   frameRate: 15,
      //   repeat: 0,
      //   spritesheet: 'player-roll',
      //   frameStart: (dirIndex: number) => dirIndex * 9,
      //   frameEnd: (dirIndex: number) => dirIndex * 9 + 8
      // },
      "attack-one-hand": {
        type: "sequential",
        framesPerDirection: 9,
        frameRate: 15,
        repeat: 0,
        spritesheet: SPRITE_SHEETS.PlayerAttackOneHand,
        frameStart: (dirIndex: number) => dirIndex * 9,
        frameEnd: (dirIndex: number) => dirIndex * 9 + 8,
      },
      hit: {
        type: "sequential",
        framesPerDirection: 8,
        frameRate: 15,
        repeat: 0,
        spritesheet: SPRITE_SHEETS.PlayerDamage,
        frameStart: (dirIndex: number) => dirIndex * 8,
        frameEnd: (dirIndex: number) => dirIndex * 8 + 7,
      },
      "critical-hit": {
        type: "sequential",
        framesPerDirection: 8,
        frameRate: 15,
        repeat: 0,
        spritesheet: SPRITE_SHEETS.PlayerDamage,
        frameStart: (dirIndex: number) => dirIndex * 8,
        frameEnd: (dirIndex: number) => dirIndex * 8 + 7,
      },
      // 'carry-walk': {
      //   type: 'sequential',
      //   framesPerDirection: 6,
      //   frameRate: 10,
      //   repeat: -1,
      //   spritesheet: 'player-carry-walk',
      //   frameStart: (dirIndex: number) => dirIndex * 6,
      //   frameEnd: (dirIndex: number) => dirIndex * 6 + 5
      // },
      // 'carry-idle': {
      //   type: 'sequential',
      //   framesPerDirection: 6,
      //   frameRate: 8,
      //   repeat: -1,
      //   spritesheet: 'player-carry-idle',
      //   frameStart: (dirIndex: number) => dirIndex * 6,
      //   frameEnd: (dirIndex: number) => dirIndex * 6 + 5
      // },
      // 'harvest': {
      //   type: 'sequential',
      //   framesPerDirection: 6,
      //   frameRate: 12,
      //   repeat: 0,
      //   spritesheet: 'player-harvest',
      //   frameStart: (dirIndex: number) => dirIndex * 6,
      //   frameEnd: (dirIndex: number) => dirIndex * 6 + 5
      // }
    };
  }

  public handleMovement(): void {
    if (
      !this.cursors ||
      this.isRolling ||
      this.isAttacking ||
      this.isDamaged ||
      this.isHarvesting ||
      this.isKnockedBack
    ) {
      // Add knockback check
      this.soundManager.stopWalkingSound();
      return;
    }

    if (this.isHarvesting) {
      this.setVelocity(0);
      this.soundManager.stopWalkingSound(); // Stop sound during harvesting
      return;
    }

    let velocityX = 0;
    let velocityY = 0;
    let moving = false;

    // Reset velocity
    this.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      velocityX = -this.stats.speed;
      this.facingDirection = "left";
      moving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = this.stats.speed;
      this.facingDirection = "right";
      moving = true;
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      velocityY = -this.stats.speed;
      this.facingDirection = "up";
      moving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = this.stats.speed;
      this.facingDirection = "down";
      moving = true;
    }

    if (moving) {
      this.soundManager.startWalkingSound();
    } else {
      this.soundManager.stopWalkingSound();
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= Math.SQRT1_2;
      velocityY *= Math.SQRT1_2;
    }

    this.setVelocity(velocityX, velocityY);

    // Determine animation
    const action = moving ? "walk" : "idle";
    // const direction = this.capitalize(this.facingDirection);
    let animationKey: string;

    if (this.isCarrying) {
      animationKey = `player-carry-${action.toLowerCase()}-${
        this.facingDirection
      }`;
    } else {
      console.log("PLAYER ACTION - ", action);
      console.log("PLAYER DIRECTION - ", this.facingDirection);
      animationKey = `player-${action.toLowerCase()}-${this.facingDirection}`;
    }

    // Only change animation if it's different from the current one
    if (this.anims.currentAnim?.key !== animationKey) {
      this.play(animationKey, true);
    }
  }

  // Method to set available enemies
  public setEnemies(enemies: EnemyCharacter[]): void {
    this.enemies = enemies;
  }

  public roll(): void {
    if (this.isRolling || this.isHarvesting) return;

    this.isRolling = true;
    const rollAnim =
      this.animations[`roll-${this.facingDirection}` as IAnimationKey];

    this.soundManager.playSFX(ESOUND_NAMES.PLAYER_DODGE);
    // Add a speed boost during roll
    const rollSpeed = this.stats.speed * 1.5;

    // Apply velocity based on facing direction
    switch (this.facingDirection) {
      case "up":
        this.setVelocity(0, -rollSpeed);
        break;
      case "down":
        this.setVelocity(0, rollSpeed);
        break;
      case "left":
        this.setVelocity(-rollSpeed, 0);
        break;
      case "right":
        this.setVelocity(rollSpeed, 0);
        break;
    }

    this.play(rollAnim, true).once("animationcomplete", () => {
      this.isRolling = false;
      this.setVelocity(0, 0);

      // Return to idle animation
      const idleAnim = this.isCarrying
        ? this.animations[`idle-${this.facingDirection}` as AnimationKeyCarry]
        : this.animations[`idle-${this.facingDirection}` as IAnimationKey];

      this.play(idleAnim, true);
    });
  }

  public startHarvesting(onComplete?: () => void): void {
    if (this.isHarvesting) return;

    this.isHarvesting = true;

    // Use the correct animation key from your animations object
    const harvestAnim =
      this.animations[`harvest-${this.facingDirection}` as IAnimationKey];

    this.play(harvestAnim, true).once("animationcomplete", () => {
      this.isHarvesting = false;

      // Return to idle animation using the correct key
      const idleAnim = this.isCarrying
        ? this.animations[`idle-${this.facingDirection}` as AnimationKeyCarry]
        : this.animations[`idle-${this.facingDirection}` as IAnimationKey];

      this.play(idleAnim, true);

      if (onComplete) {
        onComplete();
      }
    });
  }

  private initializeStartingInventory(): void {
    // Add initial seeds to inventory
    this.inventory.addItem({
      id: "carrot-seed",
      name: "Carrot Seed",
      quantity: 5,
      category: "seeds",
    });
    this.inventory.addItem({
      id: "radish-seed",
      name: "Radish Seed",
      quantity: 3,
      category: "seeds",
    });
    this.inventory.addItem({
      id: "cauliflower-seed",
      name: "Cauliflower Seed",
      quantity: 2,
      category: "seeds",
    });
  }

  /**
   * Picks up an item and adds it to the inventory.
   * @param item The item to pick up.
   */
  public pickUpItem(item: InventoryItem): void {
    const success = this.inventory.addItem(item);
    if (success) {
      console.log(`Picked up ${item.quantity} x ${item.name}`);
      // Optionally, trigger a UI update or feedback (e.g., sound effect)
      // this.scene.events.emit("inventory:update");
      this.inventory.addItem({
        id: item.name,
        name: item.name,
        quantity: item.quantity,
        category: item.category,
      });

      PhaserEventBus.emit(
        INVENTORY_EVENTS.GET_ALL_ITEMS,
        this.inventory.getAllItems()
      );
    } else {
      console.log(`Failed to pick up ${item.name}. Inventory might be full.`);
    }
  }

  /**
   * Uses a specified quantity of an item from the inventory.
   * @param itemId The ID of the item to use.
   * @param quantity The quantity to use.
   */
  public useItem(itemId: string, quantity: number): boolean {
    const success = this.inventory.removeItem(itemId, quantity);
    if (success) {
      this.scene.events.emit("inventory:update");
      PhaserEventBus.emit(
        INVENTORY_EVENTS.GET_ALL_ITEMS,
        this.inventory.getAllItems()
      );
      return true;
    } else {
      console.log(`Not enough ${itemId} to use.`);
      return false;
    }
  }

  public attackOneHand(): void {
    // Don't attack if already attacking, rolling, harvesting, or carrying something
    if (
      this.isAttacking ||
      this.isRolling ||
      this.isHarvesting ||
      this.isCarrying
    )
      return;

    this.isAttacking = true;
    const direction = this.facingDirection;
    const attackAnim =
      this.animations[
        `attack-one-hand-${this.facingDirection}` as IAnimationKey
      ];

    this.weaponSprite.setVisible(true);
    this.weaponSprite.setPosition(this.x, this.y);

    // Play both animations
    this.soundManager.playSFX(ESOUND_NAMES.SWORD_SWING_BASE);
    // Create attack hitbox based on facing direction
    // Create attack hitbox
    const hitbox = this.createAttackHitbox(direction);

    // Check for enemies in range
    this.checkAttackHit(hitbox);

    this.play(attackAnim, true);
    this.weaponSprite.play(`weapon-attack-${direction}`);

    // Listen for animation completion
    this.weaponSprite.once("animationcomplete", () => {
      this.weaponSprite.setVisible(false);
    });

    this.once("animationcomplete", () => {
      this.isAttacking = false;
      hitbox.destroy();
      this.attackHitboxes.delete(direction);
      // Return to idle animation
      const idleAnim =
        this.animations[`idle-${this.facingDirection}` as IAnimationKey];
      this.play(idleAnim, true);
    });

    // Check for hits on enemies
    this.checkAttackCollision();
  }

  private checkAttackHit(hitbox: Phaser.GameObjects.Rectangle): void {
    const enemies = this.scene.children.list.filter(
      (child): child is EnemyCharacter => child instanceof EnemyCharacter
    );

    enemies.forEach((enemy) => {
      const overlapping = Phaser.Geom.Rectangle.Overlaps(
        hitbox.getBounds(),
        enemy.getBounds()
      );
      // Debug visualization for hit detection
      if (this.showDebug && this.debugGraphics) {
        this.debugGraphics.lineStyle(2, overlapping ? 0xff0000 : 0x00ff00);
        const enemyBounds = enemy.getBounds();
        this.debugGraphics.strokeRect(
          enemyBounds.x,
          enemyBounds.y,
          enemyBounds.width,
          enemyBounds.height
        );
      }
      if (overlapping) {
        const damage = this.stats.strength || 10;
        enemy.takeDamage({
          damage,
          strength: damage,
          sourcePosition: { x: this.x, y: this.y },
        });
      }
    });
  }

  private createAttackHitbox(direction: Direction) {
    const offset = {
      up: { x: 0, y: -32 },
      down: { x: 0, y: 32 },
      left: { x: -32, y: 0 },
      right: { x: 32, y: 0 },
    };

    const hitbox = this.scene.add.rectangle(
      this.x + offset[direction].x,
      this.y + offset[direction].y,
      32,
      32,
      0xff0000,
      this.showDebug ? 0.4 : 0
    );

    this.attackHitboxes.set(direction, hitbox);
    return hitbox;
  }

  // Add this method to visualize both player and enemy hit areas
  private drawDebugHitAreas(): void {
    if (!this.debugGraphics) return;

    this.debugGraphics.clear();

    // Draw player body
    this.debugGraphics.lineStyle(2, 0x00ff00);
    this.debugGraphics.strokeRect(
      this.body.x,
      this.body.y,
      this.body.width,
      this.body.height
    );

    // Draw current attack hitbox if it exists
    this.attackHitboxes.forEach((hitbox) => {
      this.debugGraphics.lineStyle(2, 0xff0000);
      this.debugGraphics.strokeRect(
        hitbox.x - hitbox.width / 2,
        hitbox.y - hitbox.height / 2,
        hitbox.width,
        hitbox.height
      );
    });
  }

  private checkAttackCollision(): void {
    if (!this.attackHitbox || !this.enemies) return;

    this.enemies.forEach((enemy) => {
      const bounds = this.attackHitbox.getBounds();
      const enemyBounds = enemy.getBounds();

      if (Phaser.Geom.Rectangle.Overlaps(bounds, enemyBounds)) {
        // Calculate damage based on player's stats
        const damageData: DamageData = {
          damage: this.stats.strength,
          strength: this.stats.strength,
          sourcePosition: {
            x: this.x,
            y: this.y,
          },
        };

        // Apply damage to enemy
        enemy.takeDamage(damageData);
      }
    });
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    // Only block movement during rolling or harvesting now
    if (this.isRolling || this.isHarvesting) return;

    if (this.cursors) {
      // Calculate current speed based on whether attacking or not
      const currentSpeed = this.isAttacking
        ? this.stats.speed * this.attackMovementPenalty
        : this.stats.speed;

      // Update movement using modified speed
      if (this.cursors.left.isDown) {
        this.setVelocityX(-currentSpeed);
        if (!this.isAttacking) this.facingDirection = "left";
      } else if (this.cursors.right.isDown) {
        this.setVelocityX(currentSpeed);
        if (!this.isAttacking) this.facingDirection = "right";
      } else {
        this.setVelocityX(0);
      }

      if (this.cursors.up.isDown) {
        this.setVelocityY(-currentSpeed);
        if (!this.isAttacking) this.facingDirection = "up";
      } else if (this.cursors.down.isDown) {
        this.setVelocityY(currentSpeed);
        if (!this.isAttacking) this.facingDirection = "down";
      } else {
        this.setVelocityY(0);
      }
    }

    // Keep weapon sprite aligned with player
    if (this.weaponSprite) {
      this.weaponSprite.setPosition(this.x, this.y);
      this.weaponSprite.setDepth(this.depth);
    }

    // Draw debug visualizations
    if (this.showDebug) {
      this.drawDebugHitAreas();
    }
  }

  // Clean up when destroying the player
  destroy() {
    if (this.weaponSprite) {
      this.weaponSprite.destroy();
    }
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
    }
    super.destroy();
  }

  public takeDamage(damageData: DamageData): void {
    if (this.isInvincible) return;

    this.isDamaged = true;
    this.isKnockedBack = true;
    const damageAnim = `player-damage-${this.facingDirection}`;

    // Create floating damage text
    new FloatingText({
      scene: this.scene,
      x: this.x + 25, // Adjust this offset to position horizontally
      y: this.y - this.height / 3.5, // Adjust this to position vertically
      text: damageData?.damage.toString(),
      size: 16,
      color: "#ff6b6b",
      strokeColor: "#ffffff",
      strokeThickness: 4,
      shadowColor: "#000000",
      moveDistance: 60,
      duration: 1200,
    });

    // Optional: Add different styling for critical hits
    // if (isCritical) {
    //   new FloatingText(
    //       this.scene,
    //       this.x,
    //       this.y - this.height/2 - 20,
    //       'Critical!'
    //   );
    // }

    // Play damage animation
    this.play(damageAnim);
    this.soundManager.playSFX(ESOUND_NAMES.PLAYER_GRUNT_ONE);

    // Calculate knockback
    this.applyKnockback(damageData);

    // Listen for animation complete
    this.once("animationcomplete", () => {
      this.isDamaged = false;
      this.play(`player-idle-${this.facingDirection}`);
    });

    // Set invincibility
    this.isInvincible = true;

    // Remove invincibility after duration
    this.scene.time.delayedCall(this.invincibilityDuration, () => {
      this.isInvincible = false;
    });

    // Update health
    this.stats.health = Math.max(0, this.stats.health - damageData.damage);

    // Emit health changed event
    PhaserEventBus.emit(PLAYER_EVENTS.HEALTH_CHANGED, this.stats.health);
  }

  private setInvincible(): void {
    this.isInvincible = true;
    this.alpha = 0.5; // Visual feedback for invincibility

    this.scene.time.delayedCall(this.invincibilityDuration, () => {
      this.isInvincible = false;
      this.alpha = 1;
    });
  }

  private applyKnockback(damageData: DamageData): void {
    // Calculate direction from enemy to player
    const knockbackDirection = new Phaser.Math.Vector2(
      this.x - damageData.sourcePosition.x,
      this.y - damageData.sourcePosition.y
    ).normalize();

    // Calculate knockback distance
    const knockbackForce = this.calculateKnockbackForce(damageData.strength);

    // Calculate target position
    const targetX = this.x + knockbackDirection.x * knockbackForce;
    const targetY = this.y + knockbackDirection.y * knockbackForce;

    // Create knockback tween
    this.scene.tweens.add({
      targets: [this, this.weaponSprite], // Add weaponSprite to the tween targets
      x: targetX,
      y: targetY,
      duration: this.knockbackConfig.duration,
      ease: this.knockbackConfig.easing,
      onUpdate: () => {
        // Ensure weapon sprite stays at the correct depth
        if (this.weaponSprite) {
          this.weaponSprite.setDepth(this.depth);
        }
      },
      onComplete: () => {
        this.isKnockedBack = false;
      },
    });
  }

  private calculateKnockbackForce(enemyStrength: number): number {
    const baseKnockback =
      (this.knockbackConfig.maxDistance + this.knockbackConfig.minDistance) / 2;
    const defenseRatio = Math.max(
      0.2,
      this.stats.defense / (this.stats.defense + enemyStrength)
    );

    const knockbackDistance = baseKnockback * (1 - defenseRatio);

    return Phaser.Math.Clamp(
      knockbackDistance,
      this.knockbackConfig.minDistance,
      this.knockbackConfig.maxDistance
    );
  }

  public heal(amount: number): void {
    this.stats.health = Math.min(
      this.stats.maxHealth,
      this.stats.health + amount
    );
    PhaserEventBus.emit(PLAYER_EVENTS.HEALTH_CHANGED, this.stats.health);
  }

  private handleDeath(): void {
    // Implement death behavior
    this.scene.scene.restart();
    // Or implement your own game over logic
  }
}
