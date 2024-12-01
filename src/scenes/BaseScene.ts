/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// BaseScene.ts
import { Scene } from "phaser";
import { PlayerCharacter } from "../slices/character/PlayerCharacter";
import { BaseCharacterConfig } from "@/slices/character/player-character.interface";

export abstract class BaseScene extends Scene {
  protected player!: PlayerCharacter;
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected map!: Phaser.Tilemaps.Tilemap;

  constructor(sceneKey: string) {
    super({ key: sceneKey });
  }

  init() {
    this.cursors = this.input.keyboard!.createCursorKeys();
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
    this.player = new PlayerCharacter({ ...playerConfig, speed: 100 });

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

  /**
   * Provides the starting position for the player.
   * Subclasses can override this method to specify custom positions.
   */
  protected getStartingPosition(): { x: number; y: number } {
    return { x: 185, y: 170 }; // Default starting position
  }
}
