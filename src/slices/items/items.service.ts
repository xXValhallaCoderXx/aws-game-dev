import { GameItem, ItemCategory, GAME_ITEM_KEYS } from "./items.interface";
import { ITEM_REGISTRY } from "./item-registry";

class ItemService {
  private items: Map<string, GameItem> = new Map();

  constructor() {
    this.registerItems();
  }

  private registerItems() {
    // Register all items
    Object.keys(ITEM_REGISTRY).forEach((key) => {
      this.registerItem(ITEM_REGISTRY[key]);
    });
  }

  public getItem(id: GAME_ITEM_KEYS): GameItem | undefined {
    return this.items.get(id);
  }

  public getAllItems(): GameItem[] {
    return Array.from(this.items.values());
  }

  public getItemsByCategory(category: ItemCategory): GameItem[] {
    return this.getAllItems().filter((item) => item.category === category);
  }

  private registerItem(item: GameItem) {
    this.items.set(item.id, item);
  }
}

export const itemService = new ItemService();
