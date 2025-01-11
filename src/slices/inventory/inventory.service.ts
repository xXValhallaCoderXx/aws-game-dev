import { GAME_ITEM_KEYS } from "../items/items.interface";
import { InventoryItem } from "./inventory.interface";
import { INVENTORY_EVENTS } from "../events/phaser-events.types";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import { PLAYER_EVENTS } from "../events/phaser-events.types";

interface InventoryConfig {
  maxCapacity?: number;
  scene: Phaser.Scene;
}

export class Inventory {
  private scene: Phaser.Scene;
  private inventoryItems: Map<GAME_ITEM_KEYS, InventoryItem> = new Map();
  private maxCapacity: number;

  constructor({ maxCapacity = 100, scene }: InventoryConfig) {
    // Default capacity
    this.maxCapacity = maxCapacity;
    this.scene = scene;
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
      // Define key mappings: keys 1, 2, 3 correspond to seed slots
      const keyMappings: { [keyCode: string]: string } = {
        ONE: "carrot-seed",
        TWO: "radish-seed",
        THREE: "cauliflower-seed",
        // Add more mappings as needed
      };

      Object.entries(keyMappings).forEach(([keyCode, seedId]) => {
        if (scene?.input?.keyboard) {
          scene.input.keyboard.on(`keydown-${keyCode}`, () => {
            if (this.inventoryItems.has(seedId)) {
              scene.events.emit("inventory:seedSelected", seedId);
            } else {
              console.log(`No ${seedId} available in inventory.`);
              scene.events.emit("inventory:seedSelected", null); // Deselect if not available
            }
          });
        } else {
          console.log("ERROR");
        }
      });

      // Optionally, handle deselection with a specific key, e.g., ESC
      scene.input.keyboard.on("keydown-ESC", () => {
        scene.events.emit("inventory:seedSelected", null);
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
}
