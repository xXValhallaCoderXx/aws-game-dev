export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category?: string; // Optional: e.g., 'seed', 'tool'
}

interface InventoryConfig {
  maxCapacity?: number;
  scene: Phaser.Scene;
}

export class Inventory {
  private scene: Phaser.Scene;
  private items: Map<string, InventoryItem> = new Map();
  private maxCapacity: number;

  constructor({ maxCapacity = 100, scene }: InventoryConfig) {
    // Default capacity
    this.maxCapacity = maxCapacity;
    this.scene = scene;
 
  }



  addItem(item: InventoryItem): boolean {
    const existingItem = this.items.get(item.id);
    const additionalCapacity = item.quantity;
  
    if (this.getCurrentCapacity() + additionalCapacity > this.maxCapacity) {
      console.warn("Inventory is full. Cannot add more items.");
      return false;
    }
  
    if (existingItem) {
      // Create new object when updating existing item
      this.items.set(item.id, {
        ...existingItem,
        quantity: existingItem.quantity + item.quantity,
      });
    } else {
      // Create new object for new item (this part is already correct)
      this.items.set(item.id, { ...item });
    }
    return true;
  }

  removeItem(itemId: string, quantity: number): boolean {
    const existingItem = this.items.get(itemId);
    if (existingItem && existingItem.quantity >= quantity) {
      // Create new object with updated quantity
      const newQuantity = existingItem.quantity - quantity;
      if (newQuantity === 0) {
        this.items.delete(itemId);
      } else {
        this.items.set(itemId, {
          ...existingItem,
          quantity: newQuantity,
        });
      }
      return true;
    }
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

      Object.entries(keyMappings).forEach(([keyCode, seedId]) => {
        if (scene?.input?.keyboard) {
          scene.input.keyboard.on(`keydown-${keyCode}`, () => {
            console.log("keyCode: ", keyCode);
            console.log("seedId: ", seedId);
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

  debugItems(): void {
    console.log("Current inventory items:");
    this.items.forEach((item, key) => {
      console.log(`Item ${key}:`, item);
      console.log("Is frozen:", Object.isFrozen(item));
    });
  }
}
