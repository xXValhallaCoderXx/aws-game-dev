/* eslint-disable @typescript-eslint/no-explicit-any */
// src/characters/Merchant.ts
import { BaseCharacter } from "../character/BaseChracter";
import { IMerchantConfig, IMerchantInventoryItem } from "./merchant.interface";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import { SPRITE_SHEETS } from "@/shared/constants/sprite-sheet-names";
import {
  IActionType,
  PlayerSpecificActions,
  IAnimationConfig,
} from "../character/character.interface";
import { SYSTEM_EVENTS } from "../events/phaser-events.types";

export class Merchant extends BaseCharacter {
  private merchantId: string;
  private merchantName: string;
  private merchantType: string;
  private player: any;
  private inventory: IMerchantInventoryItem[] = [];
  private gold: number;
  private maxGold: number;
  private restockInterval: number;
  private possibleItems: IMerchantInventoryItem[];
  private isPlayerInRange: boolean = false;
  private dialogue: {
    greeting: string[];
    farewell: string[];
    noGold: string[];
    playerNoGold: string[];
  };
  private restockTimer?: Phaser.Time.TimerEvent;

  constructor(
    scene: Phaser.Scene,
    config: IMerchantConfig & {
      x: number;
      y: number;
      texture: string;
    },
    player: any
  ) {
    super({
      scene,
      x: config.x,
      y: config.y,
      texture: config.texture,
      characterType: "merchant-blacksmith",
      stats: {
        defense: 10,
        health: 10,
        maxHealth: 10,
        strength: 10,
        speed: 10,
      },
    });
    this.player = player;
    this.merchantId = config.id;
    this.merchantName = config.name;
    this.merchantType = config.type;
    this.gold = config.startingGold;
    this.maxGold = config.maxGold;
    this.restockInterval = config.restockInterval;
    this.possibleItems = config.possibleItems;
    this.dialogue = config.dialogue;

    // Initialize inventory
    this.restockInventory();

    // Setup physics
    this.setupPhysics();

    // Start restock timer
    this.startRestockTimer();

    // Setup interaction
    this.setupInteraction();

    this.play("merchant-blacksmith-idle-left");
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
        frameRate: 5,
        repeat: -1,
        spritesheet: SPRITE_SHEETS.BlacksmithMerchantIdle,
        frameStart: (dirIndex: number) => dirIndex * 6,
        frameEnd: (dirIndex: number) => dirIndex * 6 + 5,
      },
      idle: {
        type: "sequential",
        framesPerDirection: 6,
        frameRate: 5,
        repeat: -1,
        spritesheet: SPRITE_SHEETS.BlacksmithMerchantIdle,
        frameStart: (dirIndex: number) => dirIndex * 6,
        frameEnd: (dirIndex: number) => dirIndex * 6 + 5,
      },
      roll: {
        type: "sequential",
        framesPerDirection: 6,
        frameRate: 5,
        repeat: -1,
        spritesheet: SPRITE_SHEETS.BlacksmithMerchantIdle,
        frameStart: (dirIndex: number) => dirIndex * 6,
        frameEnd: (dirIndex: number) => dirIndex * 6 + 5,
      },
    };
  }

  private setupPhysics(): void {
    this.scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setImmovable(true);
      body.setSize(this.width * 0.6, this.height * 0.6);
      body.setOffset(this.width * 0.2, this.height * 0.2);
    }
  }

  private setupInteraction(): void {
    // Create interaction zone
    const interactionZone = this.scene.add.zone(
      this.x,
      this.y,
      this.width + 32,
      this.height + 32
    );

    this.scene.physics.add.existing(interactionZone);

    const zoneBody = interactionZone.body as Phaser.Physics.Arcade.Body;
    if (zoneBody) {
      zoneBody.setAllowGravity(false);
      zoneBody.moves = false;
    }

    // Add update callback to check if player is still in range
    this.scene.events.on("update", () => {
      const wasInRange = this.isPlayerInRange;
      this.isPlayerInRange = this.scene.physics.overlap(
        this.player,
        interactionZone
      );

      // If player just left the range
      if (wasInRange && !this.isPlayerInRange) {
        console.log("Player left merchant interaction zone");
        // Close the merchant UI
        PhaserEventBus.emit(SYSTEM_EVENTS.SET_MERCHANT_STORE_UI, false);
      }
    });

    // Handle player overlap
    this.scene.physics.add.overlap(this.player, interactionZone, () => {
      if (
        this.scene.input.keyboard &&
        Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard.addKey("E"))
      ) {
        this.interact();
      }
    });

    // Debug visualization of interaction zone
    if (process.env.NODE_ENV === "development") {
      const graphics = this.scene.add.graphics();
      graphics.lineStyle(2, 0x00ff00);
      graphics.strokeRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
      console.log("Interaction zone created at:", {
        x: this.x,
        y: this.y,
        width: this.width + 32,
        height: this.height + 32,
      });
    }
  }

  private interact(): void {
    console.log("Merchant interaction triggered");

    // Create dialogue branch for merchant
    const dialogueBranch = {
      key: "merchant-initial",
      dialogues: [
        {
          speaker: this.merchantName,
          text: this.dialogue.greeting[
            Math.floor(Math.random() * this.dialogue.greeting.length)
          ],
        },
      ],
      choices: [
        {
          text: "Let's trade",
          nextBranch: "open-merchant",
        },
        {
          text: "Goodbye",
          nextBranch: "farewell",
        },
      ],
    };

    // Setup dialogue choice handler
    const handleDialogueChoice = (chosenBranch: string) => {
      console.log("DIALOGUE CHOSEN: ", chosenBranch);
      switch (chosenBranch) {
        case "open-merchant":
          this.openMerchantUI();
          break;
        case "farewell":
          PhaserEventBus.emit("show-dialogue", {
            speaker: this.merchantName,
            text: this.dialogue.farewell[
              Math.floor(Math.random() * this.dialogue.farewell.length)
            ],
          });
          break;
      }
    };

    // Setup one-time listener for dialogue choice
    const dialogueListener = (choice: string) => {
      handleDialogueChoice(choice);
      // Remove listener after handling choice
      PhaserEventBus.off("choose-dialogue", dialogueListener);
    };

    // Add listener for dialogue choice
    PhaserEventBus.on("choose-dialogue", dialogueListener);

    // Show initial dialogue
    PhaserEventBus.emit("show-dialogue", dialogueBranch);
  }

  private restockInventory(): void {
    this.inventory = [];

    // Randomly select items from possible items
    this.possibleItems.forEach((item) => {
      if (Math.random() > 0.3) {
        // 70% chance to stock each item
        const quantity = Math.floor(Math.random() * item.maxQuantity) + 1;

        this.inventory.push({
          ...item,
          quantity,
        });
      }
    });

    // Restore some gold
    this.gold = Math.min(
      this.gold + Math.floor(Math.random() * 500) + 100,
      this.maxGold
    );

    // Emit event to update UI if open
    PhaserEventBus.emit("merchant-inventory-updated", {
      merchantId: this.merchantId,
      inventory: this.inventory,
      gold: this.gold,
    });
  }

  private openMerchantUI(): void {
    PhaserEventBus.emit(SYSTEM_EVENTS.SET_MERCHANT_STORE_UI, true);
  }

  private startRestockTimer(): void {
    this.restockTimer = this.scene.time.addEvent({
      delay: this.restockInterval,
      callback: this.restockInventory,
      callbackScope: this,
      loop: true,
    });
  }

  public buyFromPlayer(
    itemId: string,
    quantity: number,
    totalPrice: number
  ): boolean {
    if (this.gold < totalPrice) {
      PhaserEventBus.emit("show-dialogue", {
        text: this.dialogue.noGold[
          Math.floor(Math.random() * this.dialogue.noGold.length)
        ],
      });
      return false;
    }

    this.gold -= totalPrice;
    PhaserEventBus.emit("merchant-inventory-updated", {
      merchantId: this.merchantId,
      inventory: this.inventory,
      gold: this.gold,
    });
    return true;
  }

  public sellToPlayer(itemId: string, quantity: number): boolean {
    const item = this.inventory.find((i) => i.id === itemId);
    if (!item || item.quantity < quantity) return false;

    item.quantity -= quantity;
    if (item.quantity === 0) {
      this.inventory = this.inventory.filter((i) => i.id !== itemId);
    }

    PhaserEventBus.emit("merchant-inventory-updated", {
      merchantId: this.merchantId,
      inventory: this.inventory,
      gold: this.gold,
    });
    return true;
  }

  destroy() {
    if (this.restockTimer) {
      this.restockTimer.destroy();
    }
    super.destroy();
  }
}
