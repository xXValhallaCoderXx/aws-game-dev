/* eslint-disable @typescript-eslint/ban-ts-comment */
import { GAME_ITEM_KEYS } from "../items/items.interface";
import { InventoryItem } from "./inventory.interface";
import { INVENTORY_EVENTS } from "../events/phaser-events.types";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import { PLAYER_EVENTS } from "../events/phaser-events.types";

interface InventoryConfig {
  maxCapacity?: number;
  scene: Phaser.Scene;
  initialItems?: InventoryItem[];
  initialGold?: number;
}

export class Inventory {
  private static instance: Inventory | null = null;
  private scene: Phaser.Scene;
  private inventoryItems: Map<GAME_ITEM_KEYS, InventoryItem> = new Map();
  private maxCapacity: number;
  private gold: number = 0;

  constructor(config: InventoryConfig) {
    // Default capacity
    this.maxCapacity = config.maxCapacity ?? 100;
    this.scene = config.scene;
    this.gold = config.initialGold ?? 0;

    if (config.initialItems && config.initialItems.length > 0) {
      config.initialItems.forEach((item) => {
        this.inventoryItems.set(item.id, item);
      });
    }
  }

  public static getInstance(config?: InventoryConfig): Inventory {
    if (!Inventory.instance && config) {
      Inventory.instance = new Inventory(config);
    }
    if (!Inventory.instance) {
      throw new Error("Inventory must be initialized with config first");
    }
    return Inventory.instance;
  }

  private setGold(amount: number): void {
    this.gold = amount;
  }

  public addGold(amount: number): void {
    this.setGold(this.gold + amount);
  }

  public getGold(): number {
    return this.gold;
  }

  addItem(data: { id: GAME_ITEM_KEYS; quantity: number }): boolean {
    const existingItem = this.inventoryItems.get(data.id);
    const additionalCapacity = data.quantity;

    if (this.getCurrentCapacity() + additionalCapacity > this.maxCapacity) {
      console.warn("Inventory is full. Cannot add more items.");
      return false;
    }

    if (existingItem) {
      // Create new object when updating existing item
      this.inventoryItems.set(data.id, {
        ...existingItem,
        quantity: existingItem.quantity + data.quantity,
      });
    } else {
      // Create new object for new item (this part is already correct)
      this.inventoryItems.set(data.id, {
        quantity: data.quantity,
        id: data.id,
      });
    }
    PhaserEventBus.emit(INVENTORY_EVENTS.GET_ALL_ITEMS, this.getAllItems());
    return true;
  }

  removeItem(data: { id: GAME_ITEM_KEYS; quantity: number }): boolean {
    const existingItem = this.inventoryItems.get(data.id);
    if (existingItem && existingItem.quantity >= data.quantity) {
      // Create new object with updated quantity
      const newQuantity = existingItem.quantity - data.quantity;
      if (newQuantity === 0) {
        this.inventoryItems.delete(data.id);
      } else {
        this.inventoryItems.set(data.id, {
          ...existingItem,
          quantity: newQuantity,
        });
      }
      PhaserEventBus.emit(INVENTORY_EVENTS.GET_ALL_ITEMS, this.getAllItems());
      return true;
    }
    PhaserEventBus.emit(INVENTORY_EVENTS.GET_ALL_ITEMS, this.getAllItems());
    return false;
  }

  getItem(itemId: GAME_ITEM_KEYS): InventoryItem | undefined {
    return this.inventoryItems.get(itemId);
  }

  getAllItems(): InventoryItem[] {
    return Array.from(this.inventoryItems.values());
  }

  private getCurrentCapacity(): number {
    let total = 0;
    this.inventoryItems.forEach((item) => {
      total += item.quantity;
    });
    return total;
  }

  /**
   * Sets up keyboard listeners for seed selection.
   * @param scene The Phaser scene to attach listeners.
   */
  public setupKeyboardListeners(scene: Phaser.Scene): void {
    if (scene.input.keyboard) {
      const keys = {
        ZERO: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO),
        ONE: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
        TWO: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
        THREE: scene.input.keyboard.addKey(
          Phaser.Input.Keyboard.KeyCodes.THREE
        ),
        FOUR: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
        FIVE: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
        SIX: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX),
        SEVEN: scene.input.keyboard.addKey(
          Phaser.Input.Keyboard.KeyCodes.SEVEN
        ),
        EIGHT: scene.input.keyboard.addKey(
          Phaser.Input.Keyboard.KeyCodes.EIGHT
        ),
        NINE: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NINE),
      };

      const keyIndexMap = {
        ZERO: 0,
        ONE: 1,
        TWO: 2,
        THREE: 3,
        FOUR: 4,
        FIVE: 5,
        SIX: 6,
        SEVEN: 7,
        EIGHT: 8,
        NINE: 9,
      };

      Object.keys(keys).forEach((key) => {
        // TODO - FIX IGNORE
        // @ts-ignore
        scene.input.keyboard.on(`keydown-${key}`, () => {
          const items = this.getAllItems();
          // @ts-ignore
          const selectedIndex = keyIndexMap[key] - 1; // Convert key to index

          if (items[selectedIndex]) {
            PhaserEventBus.emit(
              PLAYER_EVENTS.SELECT_ITEM,
              items[selectedIndex].id
            );
          } else {
            console.log(`No item available in slot ${selectedIndex + 1}`);
            PhaserEventBus.emit(PLAYER_EVENTS.SELECT_ITEM, null); // Deselect if not available
          }
        });
      });

      scene.input.keyboard.on("keydown-ESC", () => {
        PhaserEventBus.emit(PLAYER_EVENTS.SELECT_ITEM, null);
      });
    }
  }

  debugItems(): void {
    console.log("Current inventory items:");
    this.inventoryItems.forEach((item, key) => {
      console.log(`Item ${key}:`, item);
      console.log("Is frozen:", Object.isFrozen(item));
    });
  }

  // Optional: Method to update scene reference if needed
  public updateScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }
}
