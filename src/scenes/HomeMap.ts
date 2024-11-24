/* eslint-disable @typescript-eslint/ban-ts-comment */
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
  private harvestCropSound: Phaser.Sound.BaseSound | null = null;
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
    this.load.audio("harvestCropSound", "sounds/harvest-crop-sound.wav");
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
        // @ts-ignore
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
    this.harvestCropSound = this.sound.add("harvestCropSound");
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
    if (this.player.isHarvesting) return;
    // Get the tile the player is facing

    const facingTile = this.getFacingTile();

    if (facingTile && facingTile.properties.farmable) {
      // Handle farming interaction
      this.handleFarming(facingTile);
    }
  }

  private handleFarming(tile: Phaser.Tilemaps.Tile) {
    const tileKey = `${tile.x},${tile.y}`;

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

        // Initiate harvesting
        this.player.startHarvesting(() => {
          // Callback after harvesting animation completes
          const frameIndex = this.getHarvestedCropFrame(crop.cropType);
          // Animate the harvested crop
          this.animateHarvestedCrop(
            crop.sprite.x,
            crop.sprite.y,
            this.player.facingDirection,
            frameIndex
          );
          // Harvest the crop
          crop.sprite.destroy();
          delete this.crops[tileKey];

          // Add crop to inventory
          const cropItem = `${crop.cropType}`;
          if (!this.player.inventory[cropItem]) {
            this.player.inventory[cropItem] = 0;
          }
          this.player.inventory[cropItem]++;

          // Play harvesting sound effect if you have one
          this.harvestCropSound?.play();

          console.log(`Harvested ${crop.cropType}!`);
        });
        console.log(`Harvested ${crop.cropType}!`);
      } else {
        console.log(`${crop.cropType} is still growing.`);
      }
    }
  }

  private animateHarvestedCrop(
    x: number,
    y: number,
    facingDirection: any,
    frameIndex: number
  ): void {
    // Create a new sprite for the harvested crop
    // Implement this method based on your logic

    const harvestedCrop = this.add.sprite(x, y, "harvested-crop", frameIndex);

    harvestedCrop.setOrigin(0.5, 0.5);

    // Determine the target position based on the facing direction
    let targetX = x;
    let targetY = y;

    const arcDistance = 60; // Adjust as needed
    const arcHeight = 40; // Adjust as needed

    switch (facingDirection) {
      case "up":
        targetY -= arcDistance;
        break;
      case "down":
        targetY += arcDistance;
        break;
      case "left":
        targetX -= arcDistance;
        break;
      case "right":
        targetX += arcDistance;
        break;
    }

    // First Tween: Move to the peak of the arc
    const tweenUp = this.tweens.add({
      targets: harvestedCrop,
      y: harvestedCrop.y - arcHeight,
      duration: 300,
      ease: "Sine.easeOut",
      onUpdate: () => {
        harvestedCrop.rotation += 0.05; // Optional rotation during first tween
      },
      onComplete: () => {
        // Start the second tween after the first completes
        tweenOut.play();
      },
    });

    // Second Tween: Move to the target position
    const tweenOut = this.tweens.add({
      targets: harvestedCrop,
      x: targetX,
      y: targetY,
      duration: 500,
      ease: "Sine.easeIn",
      onUpdate: () => {
        harvestedCrop.rotation += 0.05; // Optional rotation during second tween
        harvestedCrop.setScale(Math.max(0, harvestedCrop.scaleX - 0.005)); // Optional scaling
      },
      onComplete: () => {
        harvestedCrop.destroy(); // Remove the sprite after the animation
      },
      paused: true, // Start this tween manually after the first tween completes
    });

    // Start the first tween
    tweenUp.play();
  }

  private getHarvestedCropFrame(cropType: string): number {
    const frameMapping: { [key: string]: number } = {
      carrot: 0,
      radish: 1,
      cauliflower: 2,
    };

    return frameMapping[cropType] !== undefined ? frameMapping[cropType] : 0; // Default to frame 0
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

    const tileX = this.map.worldToTileX(x! + facingOffset.x!);
    const tileY = this.map.worldToTileY(y! + facingOffset.y!);

    if (tileX && tileY) {
      return this.farmableLayer?.getTileAt(tileX, tileY) ?? null;
    }
    return null;
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
