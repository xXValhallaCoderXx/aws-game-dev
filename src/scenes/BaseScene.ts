/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// BaseScene.ts
import { Scene } from "phaser";
import { PlayerCharacter } from "../slices/character/PlayerCharacter";
import { BaseCharacterConfig } from "@/slices/character/character.interface";
import { IEntranceConfig } from "@/slices/scenes/scenes.interface";
export abstract class BaseScene extends Scene {
  protected player!: PlayerCharacter;
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected map!: Phaser.Tilemaps.Tilemap;
  private spawnData: {
    startingPosition: { x: number; y: number };
    comingFrom: string;
  } | null = null;

  constructor(sceneKey: string) {
    super({ key: sceneKey });
  }

  init(data: any) {
    this.cursors = this.input.keyboard!.createCursorKeys();
    if (data && data.startingPosition) {
      this.spawnData = data;
    }
  }

  preload() {}

  create() {
    this.createMap(); // Abstract method to be implemented by subclasses

    // Set world bounds to match the map size
    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    this.createPlayer();

    // Set up camera to follow the player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Set camera bounds to prevent it from moving outside the map
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    // Adjust camera zoom to make the character larger
    this.adjustCameraZoom();
  }

  update(time: any, delta: any) {
    if (!this.cursors || !this.player) {
      return;
    }
    this.player.handleMovement();
  }

  private adjustCameraZoom() {
    // Desired size of the player on screen (in pixels)
    const desiredPlayerSize = 256;
    const zoomFactor = desiredPlayerSize / this.player.height;
    this.cameras.main.setZoom(zoomFactor);
  }

  protected createPlayer(): void {
    const playerConfig: BaseCharacterConfig = this.getPlayerConfig();
    this.player = new PlayerCharacter({
      ...playerConfig,
      stats: {
        maxHealth: 120,
        health: 120,
        strength: 10,
        defense: 10,
        speed: 100,
      },
    });

    // this.player.anims.play(this.player.animations.idleDown);
  }

  protected abstract createMap(): void;

  protected getPlayerConfig(): BaseCharacterConfig {
    const { x, y } = this.getStartingPosition();
    return {
      scene: this,
      x,
      y,
      texture: "player-idle",
    };
  }

  protected abstract getDefaultStartingPosition(): { x: number; y: number };
  /**
   * Provides the starting position for the player.
   * Subclasses can override this method to specify custom positions.
   */
  protected getStartingPosition(): { x: number; y: number } {
    if (this.spawnData && this.spawnData.startingPosition) {
      return this.spawnData.startingPosition;
    }
    return this.getDefaultStartingPosition();
  }

  /**
   * Creates an entrance zone that transitions to another scene when the player overlaps.
   * @param config The configuration object for the entrance.
   */
  protected createEntrance(config: IEntranceConfig): void {
    // Create the zone
    const zone = this.add.zone(
      config.zoneX,
      config.zoneY,
      config.zoneWidth,
      config.zoneHeight
    );
    this.physics.world.enable(zone);
    const zoneBody = zone.body as Phaser.Physics.Arcade.Body;
    zoneBody.setAllowGravity(false);
    zoneBody.setImmovable(true);

    // Optional: Add a visible border for debugging
    if (config.debug) {
      const graphics = this.add.graphics();
      graphics.lineStyle(2, 0xff0000, 1); // Red color, 2px thickness
      graphics.strokeRect(
        config.zoneX - config.zoneWidth / 2,
        config.zoneY - config.zoneHeight / 2,
        config.zoneWidth,
        config.zoneHeight
      );
    }

    // Add overlap between player and entrance zone
    this.physics.add.overlap(
      this.player,
      zone,
      () => {
        this.handleSceneTransition(config);
      },
      undefined,
      this
    );
  }

  /**
   * Handles the transition to the target scene with the specified starting position.
   * @param config The configuration object for the entrance.
   */
  private handleSceneTransition(config: IEntranceConfig): void {
    if (this.scene.isSleeping(config.targetScene)) {
      this.scene.wake(config.targetScene);
    }

    // Check if a condition function is provided
    if (config.canTransition) {
      const canProceed = config.canTransition();
      if (!canProceed) {
        // Provide feedback to the player if transition is blocked
        if (config.feedbackMessage) {
          console.log("BLOVKED - 1", config.feedbackMessage);
        }
        return; // Do not proceed with the transition
      }
    }

    // Optionally, stop background music or perform other cleanup
    // Example:
    // this.backgroundMusic?.stop();

    // Transition to the target scene with starting position data
    this.scene.start(config.targetScene, {
      startingPosition: config.targetStartingPosition,
      comingFrom: config.comingFrom,
    });
  }
}
