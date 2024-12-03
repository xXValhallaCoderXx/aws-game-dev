export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category?: string; // Optional: e.g., 'seed', 'tool'
}

export class Inventory {
  private items: Map<string, InventoryItem> = new Map();
  private maxCapacity: number;

  constructor(maxCapacity: number = 100) {
    // Default capacity
    this.maxCapacity = maxCapacity;
  }

  addItem(item: InventoryItem): boolean {
    const existingItem = this.items.get(item.id);
    const additionalCapacity = item.quantity; // Assuming each item takes 1 unit
    if (this.getCurrentCapacity() + additionalCapacity > this.maxCapacity) {
      console.warn("Inventory is full. Cannot add more items.");
      return false;
    }

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.items.set(item.id, { ...item });
    }
    return true;
  }

  removeItem(itemId: string, quantity: number): boolean {
    const existingItem = this.items.get(itemId);
    if (existingItem && existingItem.quantity >= quantity) {
      existingItem.quantity -= quantity;
      if (existingItem.quantity === 0) {
        this.items.delete(itemId);
      }
      return true;
    }
    console.warn(`Cannot remove ${quantity} x ${itemId}. Not enough quantity.`);
    return false;
  }

  getItem(itemId: string): InventoryItem | undefined {
    return this.items.get(itemId);
  }

  getAllItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  private getCurrentCapacity(): number {
    let total = 0;
    this.items.forEach((item) => {
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
      console.log("KEYBOARD LISTENING", scene.input.keyboard);
      // Define key mappings: keys 1, 2, 3 correspond to seed slots
      const keyMappings: { [keyCode: string]: string } = {
        ONE: "carrot-seed",
        TWO: "radish-seed",
        THREE: "cauliflower-seed",
        // Add more mappings as needed
      };
      console.log("KEY MAPPINGS: ", keyMappings);

      Object.entries(keyMappings).forEach(([keyCode, seedId]) => {
        if (scene?.input?.keyboard) {
          scene.input.keyboard.on(`keydown-${keyCode}`, () => {
            if (this.items.has(seedId)) {
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
        console.log("CLEAR CARRY");
        scene.events.emit("inventory:seedSelected", null);
      });
    }
  }
}
