/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "@shared/scene-keys";
import { IEntranceConfig } from "@/slices/scenes/scenes.interface";
import { SPRITE_SHEETS } from "@/shared/constants/sprite-sheet-names";
import { Merchant } from "@/slices/merchant/MerchantCharacter";

export class TownMap extends BaseScene {
  constructor() {
    super(ESCENE_KEYS.TOWN_MAP);
  }

  init(data: any) {
    super.init(data);
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("town-map", "maps/town-map.json");
    this.load.image("terrain-village-1", "tilesets/terrain-village-1.png");
    this.load.image("terrain-city", "tilesets/terrain-city.png");
    this.load.image("market-canopies", "tilesets/market-canopies.png");
    this.load.image("market-objects", "tilesets/market-objects.png");

    this.load.spritesheet(
      SPRITE_SHEETS.BlacksmithMerchantIdle,
      "sprites/characters/merchants/blacksmith-merchant-idle.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );
  }

  create() {
    super.create();

    this.createMap();

    this.createHomeMapEntrance();

    this.createMerchants();
  }

  protected getDefaultStartingPosition(): { x: number; y: number } {
    return { x: 25, y: 205 }; // Default spawn point on TownMap
  }

  protected createMap(): void {
    this.map = this.make.tilemap({ key: "town-map" });

    const terrainVillageTileset1 = this.map.addTilesetImage(
      "terrain-village-1",
      "terrain-village-1"
    );

    const terrainCityTileset = this.map.addTilesetImage(
      "terrain-city",
      "terrain-city"
    );

    const marketCanopiesTileset = this.map.addTilesetImage(
      "market-canopies",
      "market-canopies"
    );

    const marketObjectsTileset = this.map.addTilesetImage(
      "market-objects",
      "market-objects"
    );

    if (
      !terrainVillageTileset1 ||
      !terrainCityTileset ||
      !marketCanopiesTileset ||
      !marketObjectsTileset
    ) {
      throw new Error("Failed to load terrain tileset");
    }

    this.map.createLayer("GrassLayer", terrainVillageTileset1, 0, 0);
    this.map.createLayer(
      "CityPathLayer",
      [terrainCityTileset, terrainVillageTileset1],
      0,
      0
    );
    this.map.createLayer("PathAccessories", terrainVillageTileset1, 0, 0);
    this.map.createLayer("MarketBaseLayer", terrainVillageTileset1, 0, 0);
    this.map.createLayer("MarketShopLayer", marketObjectsTileset, 0, 0);
    this.map.createLayer("MarketCanopyLayer", marketCanopiesTileset, 0, 0);
  }

  private createMerchants(): void {
    const alchemistMerchant = new Merchant(
      this,
      {
        id: "weapon-smith",
        name: "Marcus the Blacksmith",
        type: "weaponsmith",
        x: 345,
        y: 265,
        texture: "blacksmith-merchant-idle",
        startingGold: 1000,
        maxGold: 2000,
        restockInterval: 300000, // 5 minutes
        possibleItems: [
          {
            id: "iron-sword",
            name: "Iron Sword",
            price: 100,
            quantity: 0,
            maxQuantity: 3,
            type: "weapon",
            description: "A basic iron sword",
          },
          // Add more weapons...
        ],
        dialogue: {
          greeting: [
            "Welcome to my forge! Need any weapons?",
            "Ah, a customer! Looking for something sharp?",
          ],
          farewell: [
            "Come back when you need more weapons!",
            "Stay sharp out there!",
          ],
          noGold: [
            "Sorry, I can't afford that right now.",
            "Come back later when I've made some sales.",
          ],
          playerNoGold: [
            "No gold, no goods. That's how it works.",
            "Come back when you've got coin to spend.",
          ],
        },
      },
      this.player
    );

    const blacksmithMerchant = new Merchant(
      this,
      {
        id: "weapon-smith",
        name: "Marcus the Blacksmith",
        type: "weaponsmith",
        x: 265,
        y: 265,
        texture: "blacksmith-merchant-idle",
        startingGold: 1000,
        maxGold: 2000,
        restockInterval: 300000, // 5 minutes
        possibleItems: [
          {
            id: "iron-sword",
            name: "Iron Sword",
            price: 100,
            quantity: 0,
            maxQuantity: 3,
            type: "weapon",
            description: "A basic iron sword",
          },
          // Add more weapons...
        ],
        dialogue: {
          greeting: [
            "Welcome to my forge! Need any weapons?",
            "Ah, a customer! Looking for something sharp?",
          ],
          farewell: [
            "Come back when you need more weapons!",
            "Stay sharp out there!",
          ],
          noGold: [
            "Sorry, I can't afford that right now.",
            "Come back later when I've made some sales.",
          ],
          playerNoGold: [
            "No gold, no goods. That's how it works.",
            "Come back when you've got coin to spend.",
          ],
        },
      },
      this.player
    );

    const generalMerchant = new Merchant(
      this,
      {
        id: "weapon-smith",
        name: "Marcus the Blacksmith",
        type: "weaponsmith",
        x: 425,
        y: 265,
        texture: "blacksmith-merchant-idle",
        startingGold: 1000,
        maxGold: 2000,
        restockInterval: 300000, // 5 minutes
        possibleItems: [
          {
            id: "iron-sword",
            name: "Iron Sword",
            price: 100,
            quantity: 0,
            maxQuantity: 3,
            type: "weapon",
            description: "A basic iron sword",
          },
          // Add more weapons...
        ],
        dialogue: {
          greeting: [
            "Welcome to my forge! Need any weapons?",
            "Ah, a customer! Looking for something sharp?",
          ],
          farewell: [
            "Come back when you need more weapons!",
            "Stay sharp out there!",
          ],
          noGold: [
            "Sorry, I can't afford that right now.",
            "Come back later when I've made some sales.",
          ],
          playerNoGold: [
            "No gold, no goods. That's how it works.",
            "Come back when you've got coin to spend.",
          ],
        },
      },
      this.player
    );
  }

  private createHomeMapEntrance(): void {
    // Create entrances using the reusable function
    const homeMapEntranceConfig: IEntranceConfig = {
      zoneX: -10, // Adjust based on your map
      zoneY: 208, // Adjust based on your map
      zoneWidth: 50,
      zoneHeight: 50,
      targetScene: ESCENE_KEYS.HOME_MAP,
      targetStartingPosition: { x: 530, y: 140 }, // Starting position in HomeMap
      comingFrom: ESCENE_KEYS.TOWN_MAP,
      debug: true, // Set to true for debugging borders
    };
    this.createEntrance(homeMapEntranceConfig);
  }
}
