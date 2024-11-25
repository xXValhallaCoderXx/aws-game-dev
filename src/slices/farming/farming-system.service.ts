// src/systems/FarmingSystem.ts

import Phaser from "phaser";
import { Crop } from "./Crop";
import { PlayerCharacter } from "../character/PlayerCharacter";
import { EFarmingCropTypes } from "./farming.interface";
import { InventoryItem } from "../character/player-character.interface";

interface FarmingConfig {
  scene: Phaser.Scene;
  map: Phaser.Tilemaps.Tilemap;
  farmableLayer: Phaser.Tilemaps.TilemapLayer;
  player: PlayerCharacter;
  plantSeedSound: Phaser.Sound.BaseSound;
  harvestCropSound: Phaser.Sound.BaseSound;
}

export class FarmingSystem {
  private scene: Phaser.Scene;
  private map: Phaser.Tilemaps.Tilemap;
  private farmableLayer: Phaser.Tilemaps.TilemapLayer;
  private player: PlayerCharacter;
  private plantSeedSound: Phaser.Sound.BaseSound;
  private harvestCropSound: Phaser.Sound.BaseSound;

  private crops: { [key: string]: Crop } = {};
  private selectedSeedType: EFarmingCropTypes | "" = EFarmingCropTypes.CARROT; // Default seed type

  // Seed packet sprite
  private seedPacketSprite?: Phaser.GameObjects.Sprite;
  private readonly SEED_PACKET_OFFSET_Y = 8; // Adjust based on your character's size
  private readonly SEED_PACKET_FRAME_INDEX: Record<EFarmingCropTypes, number> =
    {
      [EFarmingCropTypes.CARROT]: 0,
      [EFarmingCropTypes.RADISH]: 1,
      [EFarmingCropTypes.CAULIFLOWER]: 2,
      // Add more seeds as needed
    };

  constructor(config: FarmingConfig) {
    this.scene = config.scene;
    this.map = config.map;
    this.farmableLayer = config.farmableLayer;
    this.player = config.player;
    this.plantSeedSound = config.plantSeedSound;
    this.harvestCropSound = config.harvestCropSound;

    this.setupInput();
  }

  private setupInput() {
    if (this.scene.input.keyboard) {
      // Define keys for selecting seeds
      this.scene.input.keyboard.on("keydown-ONE", () => {
        this.changeSelectedSeed(EFarmingCropTypes.CARROT);
      });
      this.scene.input.keyboard.on("keydown-TWO", () => {
        this.changeSelectedSeed(EFarmingCropTypes.RADISH);
      });
      this.scene.input.keyboard.on("keydown-THREE", () => {
        this.changeSelectedSeed(EFarmingCropTypes.CAULIFLOWER);
      });
      this.scene.input.keyboard.on("keydown-ZERO", () => {
        this.clearSelectedSeed();
      });

      // Define key for farming action (e.g., SPACE)
      const actionKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );

      actionKey.on("down", () => {
        this.handlePlayerAction();
      });
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
      // Plant a new crop if the tile is farmable and player has seeds
      const seedItem = `${this.selectedSeedType}Seeds` as InventoryItem;
      console.log("SEED ITEM: ", seedItem);
      if (this.player.inventory[seedItem] > 0) {
        this.player.inventory[seedItem]--;
        const worldX = tile.getCenterX();
        const worldY = tile.getCenterY();
        const crop = new Crop(
          this.scene,
          worldX,
          worldY,
          this.selectedSeedType as EFarmingCropTypes
        );
        this.crops[tileKey] = crop;
        this.plantSeedSound.play();
      } else {
        // Notify player they have no seeds of this type
        // this.scene.sound.play("errorSound"); // Optionally, play an error sound
        console.log(`No ${this.selectedSeedType} seeds left!`);
      }
    } else {
      const crop = this.crops[tileKey];
      if (crop.growthStage === crop.maxGrowthStage) {
        // Harvest the crop
        this.player.startHarvesting(() => {
          const frameIndex = this.getHarvestedCropFrame(
            crop.cropType as EFarmingCropTypes
          );
          this.animateHarvestedCrop(
            crop.sprite.x,
            crop.sprite.y,
            this.player.facingDirection,
            frameIndex
          );
          crop.sprite.destroy();
          delete this.crops[tileKey];

          // Add crop to inventory
          const cropItem =
            `${crop.cropType}` as keyof typeof this.player.inventory;
          if (!this.player.inventory[cropItem]) {
            this.player.inventory[cropItem] = 0;
          }
          this.player.inventory[cropItem]++;

          // Play harvesting sound effect
          this.harvestCropSound.play();

          console.log(`Harvested ${crop.cropType}!`);
        });
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

    if (tileX !== null && tileY !== null) {
      return this.farmableLayer.getTileAt(tileX, tileY) ?? null;
    }
    return null;
  }

  private changeSelectedSeed(seedType: EFarmingCropTypes) {
    this.selectedSeedType = seedType;

    // Update the player's carrying state
    this.player.isCarrying = true;
    this.player.carriedItem = seedType;

    // Remove existing seed packet sprite if it exists
    if (this.seedPacketSprite) {
      this.seedPacketSprite.destroy();
    }

    // Create a new seed packet sprite
    this.seedPacketSprite = this.scene.add.sprite(
      this.player.x,
      this.player.y - this.SEED_PACKET_OFFSET_Y,
      "seed-packets", // Ensure 'seed-packets' sprite sheet is loaded
      this.SEED_PACKET_FRAME_INDEX[seedType]
    );
    this.seedPacketSprite.setOrigin(0.5, 1);
    this.seedPacketSprite.setDepth(this.player.depth + 1);
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

  private animateHarvestedCrop(
    x: number,
    y: number,
    facingDirection: string,
    frameIndex: number
  ): void {
    // Create a new sprite for the harvested crop with the specific frame
    const harvestedCrop = this.scene.add.sprite(
      x,
      y,
      "harvested-crop",
      frameIndex
    );

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
    const tweenUp = this.scene.tweens.add({
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
    const tweenOut = this.scene.tweens.add({
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
      // Add more crop types and their corresponding frame indices here
    };

    return frameMapping[cropType] !== undefined ? frameMapping[cropType] : 0; // Default to frame 0
  }

  // Method to be called in the scene's update loop to manage crop animations
  public update(delta: number) {
    // Update all crops
    Object.values(this.crops).forEach((crop) => {
      crop.update(delta);
    });
  }
}
