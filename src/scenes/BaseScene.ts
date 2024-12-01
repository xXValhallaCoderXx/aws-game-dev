/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// BaseScene.ts
import { Scene } from "phaser";
import { PlayerCharacter } from "../slices/character/PlayerCharacter";
import { CharacterConfig } from "../slices/character/BaseCharacter";

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
    console.log("BaseScene update called");
    if (!this.cursors || !this.player) {
      console.log("Cursors or player not defined", this.cursors);
      console.log("PLAYUEER: ", this.player);
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
    const playerConfig: CharacterConfig = this.getPlayerConfig();
    this.player = new PlayerCharacter(playerConfig);
    this.player.setupAnimations();
    this.player.anims.play(this.player.animations.idleDown);
  }

  protected abstract createMap(): void;

  protected getPlayerConfig(): CharacterConfig {
    const { x, y } = this.getStartingPosition();
    return {
      scene: this,
      x,
      y,
      texture: {
        key: "player",
        walkSheet: "player-walk",
        idleSheet: "player-idle",
        harvestSheet: "player-harvest",
      },
      speed: 100,
      animations: {
        walkUp: "player-walk-up",
        walkDown: "player-walk-down",
        walkLeft: "player-walk-left",
        walkRight: "player-walk-right",
        idleUp: "player-idle-up",
        idleDown: "player-idle-down",
        idleLeft: "player-idle-left",
        idleRight: "player-idle-right",
        harvestUp: "player-harvest-up",
        harvestDown: "player-harvest-down",
        harvestLeft: "player-harvest-left",
        harvestRight: "player-harvest-right",
      },
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
