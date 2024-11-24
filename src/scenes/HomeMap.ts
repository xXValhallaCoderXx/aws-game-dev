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
  private plantSeedSound: Phaser.Sound.BaseSound | null = null;
  private backgroundMusic: Phaser.Sound.BaseSound | null = null;

  private seedPacketSprite?: Phaser.GameObjects.Sprite;
  private readonly SEED_PACKET_OFFSET_Y = 8; // Adjust based on your character's size
  private readonly SEED_PACKET_FRAME_INDEX: { [key: string]: number } = {
    carrot: 0,
    raddish: 1,
    cauliflower: 2,
    // Add more seeds as needed
  };

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
    this.load.audio("plantSeedSound", "sounds/seed-place.wav");
    this.load.audio("backgroundMusic", "sounds/main-bgm.mp3");
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
      this.input.keyboard.on("keydown-ZERO", () => {
        this.clearSelectedSeed();
      });
    }

    // First create the map
    this.createMap();

    // Then call parent's create which will handle player creation and camera setup
    super.create();

    // Finally set up the water collisions
    this.setupCollisions();

    this.plantSeedSound = this.sound.add("plantSeedSound");
    this.backgroundMusic = this.sound.add("backgroundMusic", {
      volume: 0.2, // Set lower volume (0 to 1)
      loop: true, // Loop the music
    });

    // Play the background music
    this.backgroundMusic.play();
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

    if (this.seedPacketSprite) {
      this.seedPacketSprite.setPosition(
        this.player.x,
        this.player.y - this.SEED_PACKET_OFFSET_Y
      );
    }
  }

  private clearSelectedSeed() {
    this.selectedSeedType = "";
    this.player.isCarrying = false;
    this.player.carriedItem = undefined;

    // Remove the seed packet sprite
    if (this.seedPacketSprite) {
      this.seedPacketSprite.destroy();
      this.seedPacketSprite = undefined;
    }
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
        if (this.plantSeedSound) {
          this.plantSeedSound.play();
        }
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

  private changeSelectedSeed(seedType: string) {
    this.selectedSeedType = seedType;

    // Update the player's carrying state
    this.player.isCarrying = true;
    this.player.carriedItem = seedType;

    // Remove existing seed packet sprite if it exists
    if (this.seedPacketSprite) {
      this.seedPacketSprite.destroy();
    }

    // Create a new seed packet sprite
    this.seedPacketSprite = this.add.sprite(
      this.player.x,
      this.player.y - this.SEED_PACKET_OFFSET_Y,
      "seed-packets",
      this.SEED_PACKET_FRAME_INDEX[seedType]
    );
    this.seedPacketSprite.setOrigin(0.5, 1);
    this.seedPacketSprite.setDepth(this.player.depth + 1);
  }
}
