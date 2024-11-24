/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseScene } from "./BaseScene";
import { ESCENE_KEYS } from "../shared/scene-keys";
import { Crop } from "../slices/crops/Crop";

export class HomeMap extends BaseScene {
  private waterLayer?: Phaser.Tilemaps.TilemapLayer | null;
  private farmableLayer?: Phaser.Tilemaps.TilemapLayer | null;
  private animatedTiles: any | [] = [];
  private waterAnimatedLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private actionKey: Phaser.Input.Keyboard.Key | null = null;
  private crops: { [key: string]: Crop } = {};
  private selectedSeedType: string = "carrot"; // Default seed type

  constructor() {
    super(ESCENE_KEYS.CAMERA);
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("home-map", "maps/home-map.json");
    this.load.image("terrain-village-1", "tilesets/terrain-village-1.png");
    this.load.image("water-blank", "tilesets/water-blank.png");
    this.load.image("water-main-animated", "tilesets/water-main-animated.png"); // Add this line
    this.load.image("crops-tiles-main", "tilesets/crops-tiles-main.png");
    this.load.spritesheet(
      "crops-objects",
      "sprites/crops/crops-harvest-stages.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );
  }

  protected createMap(): void {
    this.map = this.make.tilemap({ key: "home-map" });

    const terrainVillage1Tileset = this.map.addTilesetImage(
      "terrain-village-1",
      "terrain-village-1"
    );

    const waterBlankTileset = this.map.addTilesetImage(
      "water-blank",
      "water-blank"
    );

    const waterAnimatedTileset = this.map.addTilesetImage(
      "water-main-animated",
      "water-main-animated"
    );

    const cropsTileset = this.map.addTilesetImage(
      "crops-tiles-main",
      "crops-tiles-main"
    );

    if (
      !terrainVillage1Tileset ||
      !waterBlankTileset ||
      !waterAnimatedTileset ||
      !cropsTileset
    ) {
      throw new Error("Failed to load terrain tileset");
    }

    this.map.createLayer("GrassBaseLayer", terrainVillage1Tileset, 0, 0);
    this.map.createLayer("GrassAccessoriesLayer", terrainVillage1Tileset, 0, 0);

    this.waterLayer = this.map.createLayer(
      "WaterBaseLayer",
      waterBlankTileset,
      0,
      0
    );

    this.waterAnimatedLayer = this.map.createLayer(
      "WaterAnimatedLayer",
      [waterBlankTileset, waterAnimatedTileset],
      0,
      0
    );

    this.farmableLayer = this.map.createLayer(
      "FarmableLayer",
      [cropsTileset],
      0,
      0
    );

    if (this.farmableLayer) {
      this.farmableLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
        tile.properties.farmable = true;
      });
    }

    this.animatedTiles = [];

    if (this.waterAnimatedLayer) {
      this.waterAnimatedLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
        // **Skip empty tiles and tiles without a tileset**
        if (tile.index < 0 || !tile.tileset) {
          return;
        }

        const tileset = tile.tileset;
        const localTileId = tile.index - tileset.firstgid;
        const tileData = tileset.tileData[localTileId];

        if (tileData && tileData.animation) {
          this.animatedTiles.push({
            tile: tile,
            animation: tileData.animation,
            frameIndex: 0,
            elapsedTime: 0,
            tilesetFirstGid: tileset.firstgid,
          });
        }
      });
    }

    if (this.waterLayer) {
      this.waterLayer.setCollisionByProperty({ collides: true });
    }

    if (this.waterAnimatedLayer) {
      this.waterAnimatedLayer.setCollisionByProperty({ collides: true });
    }
  }

  create() {
    if (this.input.keyboard) {
      this.actionKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );

      this.input.keyboard.on("keydown-ONE", () => {
        this.changeSelectedSeed("carrot");
      });
      this.input.keyboard.on("keydown-TWO", () => {
        this.changeSelectedSeed("raddish");
      });
      this.input.keyboard.on("keydown-THREE", () => {
        this.changeSelectedSeed("cauliflower");
      });
    }

    // First create the map
    this.createMap();

    // Then call parent's create which will handle player creation and camera setup
    super.create();

    // Finally set up the water collisions
    this.setupCollisions();
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    if (this.actionKey && Phaser.Input.Keyboard.JustDown(this.actionKey)) {
      console.log("GOOOO");
      this.handlePlayerAction();
    }

    // Update all crops
    Object.values(this.crops).forEach((crop) => {
      crop.update(delta);
    });

    this.animatedTiles.forEach((animatedTile: any) => {
      const tile = animatedTile.tile;
      const animation = animatedTile.animation;

      animatedTile.elapsedTime += delta;

      const currentFrame = animation[animatedTile.frameIndex];

      if (animatedTile.elapsedTime >= currentFrame.duration) {
        // Move to the next frame
        animatedTile.frameIndex =
          (animatedTile.frameIndex + 1) % animation.length;
        animatedTile.elapsedTime -= currentFrame.duration;

        // Get the next frame
        const nextFrame = animation[animatedTile.frameIndex];

        // Update tile index to the global tile index
        tile.index = animatedTile.tilesetFirstGid + nextFrame.tileid;
      }
    });
  }

  private changeSelectedSeed(seedType: string) {
    this.selectedSeedType = seedType;
    // Provide feedback to the player, e.g., update UI or console log
    console.log(`Selected seed: ${seedType}`);
  }

  private handlePlayerAction() {
    // Get the tile the player is facing

    const facingTile = this.getFacingTile();
    console.log("PLAYER ACTION: ", facingTile);

    if (facingTile && facingTile.properties.farmable) {
      // Handle farming interaction
      this.handleFarming(facingTile);
    }
  }

  private handleFarming(tile: Phaser.Tilemaps.Tile) {
    const tileKey = `${tile.x},${tile.y}`;
    console.log("SEED ITEM: ", tileKey);
    if (!this.crops[tileKey]) {
      const seedItem = `${this.selectedSeedType}Seeds`;

      if (this.player.inventory[seedItem] > 0) {
        // Plant a new crop
        this.player.inventory[seedItem]--;
        const worldX = tile.getCenterX();
        const worldY = tile.getCenterY();
        const crop = new Crop(this, worldX, worldY, this.selectedSeedType);
        this.crops[tileKey] = crop;
      } else {
        // Notify player they have no seeds of this type
        console.log(`No ${this.selectedSeedType} seeds left!`);
      }
    } else {
      const crop = this.crops[tileKey];
      if (crop.growthStage === crop.maxGrowthStage) {
        // Harvest the crop
        crop.sprite.destroy();
        delete this.crops[tileKey];
        // Add crop to inventory
        const cropItem = `${crop.cropType}`;
        if (!this.player.inventory[cropItem]) {
          this.player.inventory[cropItem] = 0;
        }
        this.player.inventory[cropItem]++;
        console.log(`Harvested ${crop.cropType}!`);
      } else {
        console.log(`${crop.cropType} is still growing.`);
      }
    }
  }

  private getFacingTile(): Phaser.Tilemaps.Tile | null {
    // Calculate the tile in front of the player based on their facing direction
    const { x, y } = this.player;
    const facingOffset = { x: 0, y: 0 };

    switch (this.player.facingDirection) {
      case "up":
        facingOffset.y = -this.map.tileHeight;
        break;
      case "down":
        facingOffset.y = this.map.tileHeight;
        break;
      case "left":
        facingOffset.x = -this.map.tileWidth;
        break;
      case "right":
        facingOffset.x = this.map.tileWidth;
        break;
    }

    const tileX = this.map.worldToTileX(x + facingOffset.x);
    const tileY = this.map.worldToTileY(y + facingOffset.y);

    return this.farmableLayer.getTileAt(tileX, tileY);
  }

  private setupCollisions(): void {
    if (this.waterLayer && this.player) {
      this.physics.add.collider(this.player, this.waterLayer);
    }

    if (this.waterAnimatedLayer && this.player) {
      this.physics.add.collider(this.player, this.waterAnimatedLayer);
    }
  }
}
