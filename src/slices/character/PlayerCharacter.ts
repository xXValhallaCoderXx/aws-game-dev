/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BaseCharacter } from "./BaseChracter";
import { EnemyCharacter } from "./EnemyCharacter";
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
  PlayerSpecificActions,
} from "./character.interface";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import { INVENTORY_EVENTS } from "../events/phaser-events.types";
import { PLAYER_EVENTS } from "../events/phaser-events.types";
import { SoundManager } from "../music-manager/sound-manager.service";
import { ESOUND_NAMES } from "../music-manager/sound-manager.types";
import { FloatingText } from "@/shared/components/phaser-components/FloatingText";
import { SPRITE_SHEETS } from "@/shared/constants/sprite-sheet-names";
import { KEY_BINDINGS } from "@/shared/constants/key-bindings";
import { InventoryModifyDTO } from "../inventory/inventory.interface";
import { GAME_ITEM_KEYS } from "../items/items.interface";
import { ITEM_REGISTRY } from "../items/item-registry";
import { ItemStats } from "../items/items.interface";
import { createDamageData } from "../combat/combat.utils";

// NOTE - May need to make animationsCreated static to ensure only 1 instance
import { ActiveEffects, PotionEffect } from "./potion-effects";

export class PlayerCharacter extends BaseCharacter {
  private activeEffects: ActiveEffects = {};
  private attackHitboxes: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  public carriedItem?: string;
  public isCarrying: boolean = false;
  public isHarvesting: boolean = false;
  public isRolling: boolean = false;
  public isAttacking: boolean = false;
  public inventory: Inventory;

  private carriedItemSprite?: Phaser.GameObjects.Sprite;
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;
  private readonly showDebug: boolean = false;
  private readonly CARRIED_ITEM_OFFSET_Y = 8; // Adjust based on your character's size

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

  private keyboardListeners: Phaser.Input.Keyboard.Key[] = [];
  private readonly eventConfig = {
    keyboard: [
      { key: KEY_BINDINGS.ROLL, handler: () => this.roll() },
      { key: KEY_BINDINGS.INTERACT, handler: () => this.handleInteraction() },
      { key: KEY_BINDINGS.ATTACK, handler: () => this.attackOneHand() },
    ],
    eventBus: [
      {
        event: PLAYER_EVENTS.SELECT_ITEM,
        handler: (itemId: string | null) => {
          if (itemId) {
            const mappedItem = ITEM_REGISTRY[itemId];

            if (mappedItem.category === "weapon") {
              if (this.carriedItemSprite) {
                this.carriedItemSprite.destroy();
              }
              this.isCarrying = false;
              this.carriedItem = itemId;
              return;
            }

            this.isCarrying = true;
            this.carriedItem = itemId;
            // Remove existing seed packet sprite if it exists
            if (this.carriedItemSprite) {
              this.carriedItemSprite.destroy();
            }

            // Create a new seed packet sprite
            this.carriedItemSprite = this.scene.add.sprite(
              this.x,
              this.y - this.CARRIED_ITEM_OFFSET_Y,
              mappedItem.sprite.spritesheetName, // Ensure 'seed-packets' sprite sheet is loaded
              mappedItem.sprite.spriteFrame
            );
            this.carriedItemSprite.setOrigin(0.5, 1);
            this.carriedItemSprite.setDepth(this.depth + 1);
          } else {
            this.isCarrying = false;
            this.carriedItem = undefined;

            // Remove the seed packet sprite
            if (this.carriedItemSprite) {
              this.carriedItemSprite.destroy();
              this.carriedItemSprite = undefined;
            }
          }
        },
      },
      // Add more event bus listeners here
    ],
  };

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
    this.inventory = Inventory.getInstance({
      scene: this.scene,
    });
    this.initializeStartingInventory();

    this.weaponSprite = this.scene.add.sprite(
      this.x,
      this.y,
      "player-attack-one-hand-sword"
    );
    this.weaponSprite.setVisible(false); // Hide initially

    this.setupListeners();
    this.inventory.setupKeyboardListeners(this.scene);

    this.emitHealthStats();

    PhaserEventBus.emit(
      INVENTORY_EVENTS.GET_ALL_ITEMS,
      this.inventory.getAllItems()
    );

    if (this.showDebug) {
      this.debugGraphics = this.scene.add.graphics();
    }

    this.scene.events.once("shutdown", () => this.cleanup());
  }

  private setupListeners(): void {
    PhaserEventBus.on(PLAYER_EVENTS.INITIALIZE_PLAYER, (data: any) => {
      console.log("INITIITITI: ", data)
      if(data?.gold){
        this.inventory.addGold(data?.gold)
      }
      if(data?.player){
        this.stats.defense = data?.player?.defense ?? 5;
     
        this.stats.maxHealth = data?.player?.maxHealth ?? 222;
        this.stats.health = data?.player?.health ?? 222;
        this.stats.speed = data?.player?.speed ?? 50;
      }
    })
    // Setup keyboard listeners
    if (this.scene.input.keyboard) {
      this.eventConfig.keyboard.forEach(({ key, handler }) => {
        this.keyboardListeners.push(
          this.scene.input.keyboard!.addKey(key).on("down", handler)
        );
      });

      // Add cursor keys
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      Object.values(this.cursors).forEach((key) => {
        this.keyboardListeners.push(key);
      });
    }

    // Setup event bus listeners
    this.eventConfig.eventBus.forEach(({ event, handler }) => {
      PhaserEventBus.on(event, handler);
    });
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
    IActionType | PlayerSpecificActions,
    IAnimationConfig
  > {
    const baseConfigs = super.getAnimationConfigs();
    return {
      ...baseConfigs,
      walk: {
        type: "sequential",
        framesPerDirection: 6,
        frameRate: 10,
        repeat: -1,
        spritesheet: SPRITE_SHEETS.PlayerWalk,
        frameStart: (dirIndex: number) => dirIndex * 6,
        frameEnd: (dirIndex: number) => dirIndex * 6 + 5,
      },
      idle: {
        type: "sequential",
        framesPerDirection: 6,
        frameRate: 5,
        repeat: -1,
        spritesheet: SPRITE_SHEETS.PlayerIdle,
        frameStart: (dirIndex: number) => dirIndex * 6,
        frameEnd: (dirIndex: number) => dirIndex * 6 + 5,
      },
      roll: {
        type: "sequential",
        framesPerDirection: 9,
        frameRate: 15,
        repeat: 0,
        spritesheet: SPRITE_SHEETS.PlayerRoll,
        frameStart: (dirIndex: number) => dirIndex * 9,
        frameEnd: (dirIndex: number) => dirIndex * 9 + 8,
      },
      "attack-one-hand": {
        type: "sequential",
        framesPerDirection: 9,
        frameRate: 15,
        repeat: 0,
        spritesheet: SPRITE_SHEETS.PlayerAttackOneHand,
        frameStart: (dirIndex: number) => dirIndex * 9,
        frameEnd: (dirIndex: number) => dirIndex * 9 + 8,
      },
      "attack-one-hand-sword": {
        type: "sequential",
        framesPerDirection: 9,
        frameRate: 15,
        repeat: 0,
        spritesheet: SPRITE_SHEETS.PlayerAttackOneHandSword,
        frameStart: (dirIndex: number) => dirIndex * 9,
        frameEnd: (dirIndex: number) => dirIndex * 9 + 8,
      },
      "carry-idle": {
        type: "sequential",
        framesPerDirection: 6,
        frameRate: 8,
        repeat: -1,
        spritesheet: SPRITE_SHEETS.PlayerCarryIdle,
        frameStart: (dirIndex: number) => dirIndex * 6,
        frameEnd: (dirIndex: number) => dirIndex * 6 + 5,
      },
      "carry-walk": {
        type: "sequential",
        framesPerDirection: 6,
        frameRate: 10,
        repeat: -1,
        spritesheet: SPRITE_SHEETS.PlayerCarryWalk,
        frameStart: (dirIndex: number) => dirIndex * 6,
        frameEnd: (dirIndex: number) => dirIndex * 6 + 5,
      },

      harvest: {
        type: "sequential",
        framesPerDirection: 6,
        frameRate: 12,
        repeat: 0,
        spritesheet: SPRITE_SHEETS.PlayerCropPull,
        frameStart: (dirIndex: number) => dirIndex * 6,
        frameEnd: (dirIndex: number) => dirIndex * 6 + 5,
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
      // "critical-hit": {
      //   type: "sequential",
      //   framesPerDirection: 8,
      //   frameRate: 15,
      //   repeat: 0,
      //   spritesheet: SPRITE_SHEETS.PlayerDamage,
      //   frameStart: (dirIndex: number) => dirIndex * 8,
      //   frameEnd: (dirIndex: number) => dirIndex * 8 + 7,
      // },
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
    if (
      this.isRolling ||
      this.isHarvesting ||
      (this.isCarrying && this.carriedItem?.includes("seed"))
    )
      return;

    this.isRolling = true;
    const rollAnimKey = this.animations[`roll-${this.facingDirection}`];

    // Apply roll velocity first
    const rollSpeed = this.stats.speed * 1.5;
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

    // Play sound effect
    this.soundManager.playSFX(ESOUND_NAMES.PLAYER_DODGE);

    // Store current direction to ensure it doesn't change during roll
    const rollDirection = this.facingDirection;

    // Set up a timer to end the roll
    this.scene.time.delayedCall(300, () => {
      this.isRolling = false;
      this.setVelocity(0, 0);

      // Return to idle animation in the same direction we started rolling
      const idleAnimKey = this.animations[`idle-${rollDirection}`];
      if (idleAnimKey) {
        this.play(idleAnimKey, true);
      }
    });

    // Play the roll animation if it exists
    try {
      if (this.scene.anims.exists(rollAnimKey)) {
        this.play(rollAnimKey, true);
      } else {
        // Fallback to walk animation if roll animation fails
        const walkAnimKey = this.animations[`walk-${rollDirection}`];
        if (walkAnimKey) {
          this.play(walkAnimKey, true);
        }
      }
    } catch (error) {
      console.error("Error during roll animation:", error);
      this.isRolling = false;
    }
  }

  private handleInteraction(): void {
    if (this.isCarrying && this.carriedItem && this.carriedItemSprite) {
      const mappedItem = ITEM_REGISTRY[this.carriedItem];
      console.log("MAPPED ITTEM: ", mappedItem);
      // Check if the carried item is a potion
      if (mappedItem.category.includes("consumable")) {
        // Try to use the potion
        const used = this.useItem({
          id: this.carriedItem as GAME_ITEM_KEYS,
          quantity: 1,
        });
        console.log("USED: ", used);
        if (used) {
          // Reset carried state
          this.isCarrying = false;
          this.carriedItemSprite.destroy();
          this.carriedItem = undefined;

          this.carriedItemSprite = undefined;
          // Play drinking animation

          this.soundManager.playSFX(ESOUND_NAMES.POTION_DRINK_1);
        }
      }
    }
  }

  public startHarvesting(onComplete?: () => void): void {
    if (
      this.isHarvesting ||
      this.isRolling ||
      this.isAttacking ||
      this.isDamaged ||
      this.isKnockedBack
    ) {
      return;
    }

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
      id: GAME_ITEM_KEYS.CARROT_SEEDS,
      quantity: 5,
    });
    this.inventory.addItem({
      id: GAME_ITEM_KEYS.RADISH_SEEDS,
      quantity: 3,
    });
    this.inventory.addItem({
      id: GAME_ITEM_KEYS.CAULIFLOWER_SEEDS,
      quantity: 2,
    });
  }

  /**
   * Picks up an item and adds it to the inventory.
   * @param item The item to pick up.
   */
  public pickUpItem(data: InventoryModifyDTO): void {
    const success = this.inventory.addItem(data);
    if (success) {
      console.log(`Picked up ${data.quantity} x ${data.id}`);
      // TODO - ADD SOUND PICKUP
    } else {
      console.log(`Failed to pick up ${data.id}. Inventory might be full.`);
    }
  }

  /**
   * Uses a specified quantity of an item from the inventory.
   * @param itemId The ID of the item to use.
   * @param quantity The quantity to use.
   */
  public useItem(data: InventoryModifyDTO): boolean {
    // Check if item exists in inventory before trying to use it
    const success = this.inventory.removeItem(data);
    if (!success) {
      console.log(`Not enough ${data.id} to use.`);
      return false;
    }

    // Handle different potion types
    switch (data.id) {
      case GAME_ITEM_KEYS.HEALTH_POTION_SMALL:
        this.heal(25);
        break;
      case GAME_ITEM_KEYS.HEALTH_POTION_LARGE:
        this.heal(50);
        break;
      case GAME_ITEM_KEYS.STRENGTH_POTION_SMALL:
        this.applyStrengthBuff(1.5, 10000); // 1.5x strength for 10 seconds
        break;
      case GAME_ITEM_KEYS.STRENGTH_POTION_LARGE:
        this.applyStrengthBuff(2, 15000); // 2x strength for 15 seconds
        break;
      default:
        console.log(`Item ${data.id} cannot be consumed`);
        return false;
    }

    // Update inventory UI
    this.scene.events.emit("inventory:update");
    PhaserEventBus.emit(
      INVENTORY_EVENTS.GET_ALL_ITEMS,
      this.inventory.getAllItems()
    );
    return true;
  }

  private applyStrengthBuff(multiplier: number, duration: number): void {
    // Clear any existing strength buff
    if (this.activeEffects.strength) {
      clearTimeout(this.activeEffects.strength.timeout);
    }

    // Apply new strength buff
    const baseStrength = this.stats.strength;
    this.stats.strength *= multiplier;

    // Set up the buff removal after duration
    const effect: PotionEffect = {
      type: "strength",
      value: multiplier,
      duration,
      startTime: Date.now(),
      timeout: setTimeout(() => {
        this.stats.strength = baseStrength;
        delete this.activeEffects.strength;
        // PhaserEventBus.emit(PLAYER_EVENTS.BUFF_EXPIRED, { type: 'strength' });
      }, duration),
    };

    this.activeEffects.strength = effect;
    // PhaserEventBus.emit(PLAYER_EVENTS.BUFF_APPLIED, { type: 'strength', multiplier, duration });
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

    if (this.carriedItem) {
      const mappedItem = ITEM_REGISTRY[this.carriedItem];
      if (mappedItem.category === "weapon") {
        const attackAnimSword =
          this.animations[
            `attack-one-hand-sword-${this.facingDirection}` as IAnimationKey
          ];

        this.weaponSprite.setVisible(true);
        this.weaponSprite.setPosition(this.x, this.y);
        this.weaponSprite.play(attackAnimSword);
        this.soundManager.playSFX(ESOUND_NAMES.SWORD_SWING_BASE);
        this.soundManager.playSFX(ESOUND_NAMES.PLAYER_GRUNT_ONE);
      }
    } else {
      this.soundManager.playSFX(ESOUND_NAMES.PLAYER_GRUNT_ONE);
      this.soundManager.playSFX(ESOUND_NAMES.PLAYER_LIGHT_PUNCH);
    }

    // Create attack hitbox
    const hitbox = this.createAttackHitbox(direction);

    // Check for enemies in range
    this.checkAttackHit(hitbox);

    this.play(attackAnim, true);

    this.once("animationcomplete", () => {
      this.isAttacking = false;
      hitbox.destroy();
      this.weaponSprite.setVisible(false);
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
        let weaponStats: ItemStats | undefined;

        if (this.carriedItem) {
          const mappedItem = ITEM_REGISTRY[this.carriedItem];
          if (mappedItem.category === "weapon") {
            weaponStats = mappedItem.stats;
          }
        }

        const damageData = createDamageData(
          this.stats,
          enemy.getStats(),
          weaponStats,
          { x: this.x, y: this.y }
        );

        enemy.takeDamage(damageData);
      }
    });
  }

  private createAttackHitbox(direction: Direction) {
    let offset = {
      up: { x: 0, y: -12 },
      down: { x: 0, y: 12 },
      left: { x: -12, y: 0 },
      right: { x: 12, y: 0 },
    };

    let boxWidth = 16;
    let boxHeight = 16;

    if (this.carriedItem) {
      boxHeight = 32;
      boxWidth = 32;

      offset = {
        up: { x: 0, y: -16 },
        down: { x: 0, y: 16 },
        left: { x: -16, y: 0 },
        right: { x: 16, y: 0 },
      };
    }

    const hitbox = this.scene.add.rectangle(
      this.x + offset[direction].x,
      this.y + offset[direction].y,
      boxWidth,
      boxHeight,
      0xff0000,
      this.showDebug ? 0.4 : 0
    );

    this.attackHitboxes.set(direction, hitbox);
    return hitbox;
  }

  // Add this method to visualize both player and enemy hit areas
  private drawDebugHitAreas(): void {
    if (!this.debugGraphics || !this.body) return;

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
      // @ts-ignore
      this.debugGraphics.lineStyle(2, 0xff0000);
      // @ts-ignore
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

    // Add this: Update carried item position
    if (this.carriedItemSprite) {
      this.carriedItemSprite.setPosition(
        this.x,
        this.y - this.CARRIED_ITEM_OFFSET_Y
      );
      this.carriedItemSprite.setDepth(this.depth + 1);
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

    const damageAnim =
      this.animations[`hit-${this.facingDirection}` as IAnimationKey];

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

  private cleanup(): void {
    // Clean up event bus listeners
    this.eventConfig.eventBus.forEach(({ event, handler }) => {
      PhaserEventBus.off(event, handler);
    });

    // Clean up keyboard listeners
    this.keyboardListeners.forEach((key) => key.removeAllListeners());
    this.keyboardListeners = [];

    // Clean up game objects
    [this.carriedItemSprite, this.weaponSprite, this.debugGraphics]
      .filter(Boolean)
      .forEach((obj) => obj?.destroy());

    this.attackHitboxes.forEach((hitbox) => hitbox.destroy());
    this.attackHitboxes.clear();
  }
}
