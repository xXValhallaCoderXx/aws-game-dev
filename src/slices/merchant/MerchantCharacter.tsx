/* eslint-disable @typescript-eslint/ban-ts-comment */
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
import {
  MERCHANT_EVENTS,
  SYSTEM_EVENTS,
  INVENTORY_EVENTS,
} from "../events/phaser-events.types";

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

    this.setupCommerceListeners();

    this.play("merchant-blacksmith-idle-left");
  }

  protected override getAnimationConfigs(): Record<
    IActionType | PlayerSpecificActions,
    IAnimationConfig
  > {
    const baseConfigs = super.getAnimationConfigs();
    // @ts-ignore
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
    PhaserEventBus.emit(MERCHANT_EVENTS.GET_ITEMS, this.inventory);
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

  private setupCommerceListeners(): void {
    // Listen for purchase requests
    PhaserEventBus.on(MERCHANT_EVENTS.BUY_ITEMS, (data: any) => {
      console.log("SETUP ECOMMERE", this.merchantId);
      console.log("DATA: ", data);

      if (data?.id !== this.merchantId) return;

      console.log("MERCHANT EVENT - BUY ITEMS CALLED");
      if (data?.items?.length < 1) {
        PhaserEventBus.emit(MERCHANT_EVENTS.TRANSACTION_RESULT, {
          success: false,
          message: "No items to be purchased",
        });
        return;
      }

      let totalCost = 0;

      data?.items?.forEach((item: any) => {
        totalCost += item.price * item.quantity;
      });

      const playerGold = this.player?.inventory?.getGold();

      console.log("MERCHANT: BUYI ITEM - PLAYER GOLD: ", playerGold);
      if (playerGold < totalCost) {
        PhaserEventBus.emit(MERCHANT_EVENTS.TRANSACTION_RESULT, {
          success: false,
          message: "Not enough gold to purchase items",
        });
        return;
      }

      const playerGoldAfterPurchase = playerGold - totalCost;
      console.log(
        "MERCHANT: BUYI ITEM - PLAYER GOLD AFTER: ",
        playerGoldAfterPurchase
      );

      this?.player?.inventory?.setGold(playerGoldAfterPurchase);
      // Give Gold to merchant
      this.gold = this.gold + totalCost;

      data?.items?.forEach((item: any) => {
        const purchaseData = {
          id: item?.id,
          quantity: item?.quantity,
        };
        this.player.inventory.addItem(purchaseData);
      });

      // PhaserEventBus.emit(INVENTORY_EVENTS.GET_ALL_ITEMS, this.player.inventory.inventoryItems)
      PhaserEventBus.emit(
        INVENTORY_EVENTS.GET_GOLD,
        this.player.inventory.gold
      );
      PhaserEventBus.emit(MERCHANT_EVENTS.TRANSACTION_RESULT, {
        success: true,
        message: "Purchase successful",
      });

      // // Emit event to check player's gold
      // PhaserEventBus.emit(MERCHANT_EVENTS.CHECK_PLAYER_GOLD, {
      //     requiredGold: totalCost,
      //     callback: (hasEnoughGold: boolean) => {
      //         if (!hasEnoughGold) {
      //             PhaserEventBus.emit(MERCHANT_EVENTS.PURCHASE_RESULT, {
      //                 success: false,
      //                 message: this.dialogue.playerNoGold[
      //                     Math.floor(Math.random() * this.dialogue.playerNoGold.length)
      //                 ]
      //             });
      //             return;
      //         }

      //         // Process the purchase
      //         if (this.sellToPlayer(itemId, quantity)) {
      //             // Add gold to merchant
      //             this.gold += totalCost;

      //             // Emit events to update player's inventory and gold
      //             PhaserEventBus.emit(MERCHANT_EVENTS.DEDUCT_PLAYER_GOLD, totalCost);
      //             PhaserEventBus.emit(MERCHANT_EVENTS.ADD_TO_PLAYER_INVENTORY, {
      //                 itemId,
      //                 quantity
      //             });

      //             // Emit success result
      //             PhaserEventBus.emit(MERCHANT_EVENTS.PURCHASE_RESULT, {
      //                 success: true,
      //                 message: "Purchase successful"
      //             });
      //         }
      //     }
      // });
    });

    // Listen for sell requests
    // PhaserEventBus.on(MERCHANT_EVENTS.SELL_ITEM,
    // ({ itemId, quantity }: { itemId: string; quantity: number }) => {
    //     const item = this.possibleItems.find(i => i.id === itemId);

    //     if (!item) {
    //         PhaserEventBus.emit(MERCHANT_EVENTS.SELL_RESULT, {
    //             success: false,
    //             message: "Merchant doesn't accept this item"
    //         });
    //         return;
    //     }

    //     const sellPrice = Math.floor(item.price * 0.5); // Typically merchants buy at half price
    //     const totalPrice = sellPrice * quantity;

    //     if (this.gold < totalPrice) {
    //         PhaserEventBus.emit(MERCHANT_EVENTS.SELL_RESULT, {
    //             success: false,
    //             message: this.dialogue.noGold[
    //                 Math.floor(Math.random() * this.dialogue.noGold.length)
    //             ]
    //         });
    //         return;
    //     }

    //     // Check if player has the items
    //     PhaserEventBus.emit(MERCHANT_EVENTS.CHECK_PLAYER_INVENTORY, {
    //         itemId,
    //         quantity,
    //         callback: (hasItems: boolean) => {
    //             if (!hasItems) {
    //                 PhaserEventBus.emit(MERCHANT_EVENTS.SELL_RESULT, {
    //                     success: false,
    //                     message: "You don't have enough items to sell"
    //                 });
    //                 return;
    //             }

    //             // Process the sale
    //             if (this.buyFromPlayer(itemId, quantity, totalPrice)) {
    //                 // Add item to merchant inventory
    //                 const existingItem = this.inventory.find(i => i.id === itemId);
    //                 if (existingItem) {
    //                     existingItem.quantity += quantity;
    //                 } else {
    //                     this.inventory.push({
    //                         ...item,
    //                         quantity
    //                     });
    //                 }

    //                 // Emit events to update player's inventory and gold
    //                 PhaserEventBus.emit(MERCHANT_EVENTS.REMOVE_FROM_PLAYER_INVENTORY, {
    //                     itemId,
    //                     quantity
    //                 });
    //                 PhaserEventBus.emit(MERCHANT_EVENTS.ADD_PLAYER_GOLD, totalPrice);

    //                 // Emit success result
    //                 PhaserEventBus.emit(MERCHANT_EVENTS.SELL_RESULT, {
    //                     success: true,
    //                     message: "Sale successful"
    //                 });
    //             }
    //         }
    //     });
    // });
  }

  destroy() {
    if (this.restockTimer) {
      this.restockTimer.destroy();
    }
    super.destroy();
  }
}
