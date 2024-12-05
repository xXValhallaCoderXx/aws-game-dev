// src/systems/FarmingSystem.ts

import Phaser from "phaser";
import { Crop } from "./Crop";
import { PlayerCharacter } from "@slices/character/PlayerCharacter";
import {
  EFarmingCrops,
  EFarmingCropYields,
  CropHarvestMapping,
} from "./farming.interface";
import { InventoryItem } from "@slices/character/player-character.interface";
import { PhaserEventBus } from "@/shared/services/phaser.service";
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
  private selectedSeedType: EFarmingCrops | "" = EFarmingCrops.CARROT; // Default seed type

  // Seed packet sprite
  private seedPacketSprite?: Phaser.GameObjects.Sprite;
  private readonly SEED_PACKET_OFFSET_Y = 8; // Adjust based on your character's size
  private readonly SEED_PACKET_FRAME_INDEX: Record<EFarmingCrops, number> = {
    [EFarmingCrops.CARROT]: 0,
    [EFarmingCrops.RADISH]: 1,
    [EFarmingCrops.CAULIFLOWER]: 2,
  };

  private readonly CROP_HARVEST_CONFIG: CropHarvestMapping = {
    [EFarmingCrops.CARROT]: {
      cropId: EFarmingCropYields.CARROT,
      baseYield: 1,
      name: "Carrot",
      qualityBonusChance: 0.1, // 10% chance for extra crop
    },
    [EFarmingCrops.RADISH]: {
      cropId: EFarmingCropYields.RADISH,
      baseYield: 1,
      name: "Radish",
      qualityBonusChance: 0.15,
    },
    [EFarmingCrops.CAULIFLOWER]: {
      cropId: EFarmingCropYields.CAULIFLOWER,
      baseYield: 1,
      name: "Cauliflower",
      qualityBonusChance: 0.15,
    },
    // Add more crop types here
  };

  constructor(config: FarmingConfig) {
    this.scene = config.scene;
    this.map = config.map;
    this.farmableLayer = config.farmableLayer;
    this.player = config.player;
    this.plantSeedSound = config.plantSeedSound;
    this.harvestCropSound = config.harvestCropSound;

    this.setupInput();
    this.setupEventListeners();
  }

  private setupInput() {
    if (this.scene.input.keyboard) {
      // Define key for farming action (e.g., SPACE)
      const actionKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );

      actionKey.on("down", () => {
        this.handlePlayerAction();
      });
    }
  }

  private setupEventListeners() {
    this.scene.events.on(
      "inventory:seedSelected",
      (selectedSeedId: string | null) => {
        console.log("BLAAH");
        if (selectedSeedId) {
          this.changeSelectedSeed(selectedSeedId as EFarmingCrops);
        } else {
          this.clearSelectedSeed();
        }
      }
    );
    PhaserEventBus.on(
      "inventory:seedSelected",
      (selectedSeedId: string | null) => {
        console.log("Seed selected:", selectedSeedId);
        if (selectedSeedId) {
          this.changeSelectedSeed(selectedSeedId as EFarmingCrops);
        } else {
          this.clearSelectedSeed();
        }
      }
    );

    this.scene.events.on("inventory:update", () => {
      // Optionally, handle inventory updates (e.g., refresh UI)
    });
  }

  private calculateHarvestYield(cropType: EFarmingCrops): number {
    const cropConfig = this.CROP_HARVEST_CONFIG[cropType];
    let cropYield = cropConfig.baseYield;

    // Calculate bonus crops if applicable
    if (
      cropConfig.qualityBonusChance &&
      Math.random() < cropConfig.qualityBonusChance
    ) {
      cropYield += 1;
    }

    return cropYield;
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
      const seedId = `${this.selectedSeedType}` as InventoryItem;
      const seedItem = this.player.inventory.getItem(seedId);
      if (seedItem && seedItem.quantity > 0) {
        this.player.useItem(seedId, 1); // Deduct one seed

        const worldX = tile.getCenterX();
        const worldY = tile.getCenterY();
        const crop = new Crop(
          this.scene,
          worldX,
          worldY,
          this.selectedSeedType as EFarmingCrops
        );
        this.crops[tileKey] = crop;
        // Check if last item then clear selected item
        if (seedItem.quantity === 0) {
          this.clearSelectedSeed();
        }

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
          // Get the frame index for the harvested crop animation
          const frameIndex = this.getHarvestedCropFrame(
            crop.cropType as EFarmingCrops
          );

          // Play harvest sound
          this.harvestCropSound.play();
          const harvestedAmount = this.calculateHarvestYield(
            crop.cropType as EFarmingCrops
          );

          console.log("HARVESTED AMOUNT: ", harvestedAmount);
          console.log("CROP HARVESTED: ", crop);
          // Animate the crop being harvested
          this.animateHarvestedCrop(
            crop.sprite.x,
            crop.sprite.y,
            this.player.facingDirection,
            frameIndex
          );

          // Remove the crop from the ground
          crop.sprite.destroy();
          delete this.crops[tileKey];

          // Add crop to inventory

          this.player.pickUpItem({
            id: this.CROP_HARVEST_CONFIG[crop.cropType as EFarmingCrops].cropId,
            name: `${crop.cropType}`,
            quantity: harvestedAmount,
            category: "crops",
          });

          console.log(crop);
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

  private changeSelectedSeed(seedType: EFarmingCrops) {
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

  // Make sure your animateHarvestedCrop method is working correctly:
  private animateHarvestedCrop(
    startX: number,
    startY: number,
    direction: string,
    frameIndex: number
  ): void {
    const arcHeight = 70; // Height of the arc
    const arcDistance = 40; // Distance to move horizontally
    let targetX = startX;
    let targetY = startY - 50; // Final Y position above the starting point

    // Create the harvested crop sprite
    const harvestedCrop = this.scene.add.sprite(
      startX,
      startY,
      "harvested-crops",
      frameIndex
    );
    harvestedCrop.setDepth(20); // Ensure it appears above other elements

    // Adjust target position based on direction
    switch (direction) {
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

    // First Tween: Move up in an arc
    const tweenUp = this.scene.tweens.add({
      targets: harvestedCrop,
      y: startY - arcHeight,
      duration: 350,
      ease: "Sine.easeOut",
      onUpdate: () => {
        harvestedCrop.rotation += 0.05;
      },
      onComplete: () => {
        tweenOut.play();
      },
    });

    // Second Tween: Move to final position
    const tweenOut = this.scene.tweens.add({
      targets: harvestedCrop,
      x: targetX,
      y: targetY,
      duration: 350,
      ease: "Sine.easeIn",
      onUpdate: () => {
        harvestedCrop.rotation += 0.05;
        harvestedCrop.setScale(Math.max(0, harvestedCrop.scaleX - 0.005));
      },
      onComplete: () => {
        harvestedCrop.destroy();
      },
      paused: true,
    });

    // Start the animation sequence
    tweenUp.play();
  }

  private getHarvestedCropFrame(cropType: string): number {
    const frameMapping: { [key: string]: number } = {
      carrot: 0,
      radish: 1,
      cauliflower: 2,
      // Add more crop types and their corresponding frame indices here
    };

    return frameMapping[cropType] || 0;
  }

  // Method to be called in the scene's update loop to manage crop animations
  public update(delta: number) {
    // Update all crops
    Object.values(this.crops).forEach((crop) => {
      crop.update(delta);
    });
  }

  // New method to update seed packet position
  public updateSeedPacketPosition(playerX: number, playerY: number): void {
    if (this.seedPacketSprite) {
      this.seedPacketSprite.setPosition(
        playerX,
        playerY - this.SEED_PACKET_OFFSET_Y
      );
    }
  }
}
