/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene } from "phaser";
import { ESCENE_KEYS } from "../shared/scene-keys";
// import debugDrawer from "../shared/services/utils/phaser-debug.util";

export class Game extends Scene {
  // So we don't need non null assertion operator (!) in the code
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: Phaser.Physics.Arcade.Sprite;
  private hillsLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private facingDirection: string = "down";

  constructor() {
    super(ESCENE_KEYS.GAME);
  }

  init() {
    const cursors = this.input.keyboard!.createCursorKeys();
    this.cursors = cursors;
  }

  preload() {}

  create() {
    this.createMap();
    this.createPlayer();
    this.createAnimations();
    // debugDrawer(hillsLayer, this);

    this.player.anims.play("player-idle-down");

    if (this.hillsLayer) {
      this.physics.add.collider(this.player, this.hillsLayer);
    }
  }

  update() {
    if (!this.cursors || !this.player) return;

    this.handlePlayerMovement();
  }

  private createMap() {
    const map = this.make.tilemap({ key: "main-map" });
    const tileset = map.addTilesetImage("grass", "grass");
    const tileset2 = map.addTilesetImage("hills", "hills");
    const tileset3 = map.addTilesetImage("tilled_dirt", "tilled_dirt");

    if (!tileset || !tileset2) {
      throw new Error("Failed to load tilesets");
    }

    map.createLayer("GrassLayer", tileset, 0, 0);
    this.hillsLayer = map.createLayer("HillsLayer", tileset2, 0, 0);
    map.createLayer("GardenPlotLayer", tileset3, 0, 0);

    if (!this.hillsLayer) {
      throw new Error("Failed to load hills layer");
    }

    this.hillsLayer.setCollisionByProperty({ collides: true });
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(20, 20, "player", "walk-1");

    this.player.body?.setSize(
      this.player.width * 1.2,
      this.player.height * 1.2
    );

    this.player.setCollideWorldBounds(true); // Prevent the player from moving off the screen
  }

  private handlePlayerMovement(): void {
    if (!this.player.body || !this.player.anims.currentAnim) {
      throw new Error("Failed to load player object");
    }

    const speed = 100;
    let velocityX = 0;
    let velocityY = 0;
    let moving = false;

    // Reset velocity
    this.player.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      velocityX = -speed;
      this.player.setFlipX(false);
      moving = true;
    }
    if (this.cursors.right.isDown) {
      velocityX = speed;
      this.player.setFlipX(true);
      moving = true;
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      velocityY = -speed;
      moving = true;
    }
    if (this.cursors.down.isDown) {
      velocityY = speed;
      moving = true;
    }

    // Normalize speed if moving diagonally
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= Math.SQRT1_2;
      velocityY *= Math.SQRT1_2;
    }

    // Set the player's velocity
    this.player.setVelocity(velocityX, velocityY);

    // Determine facing direction for animation
    if (velocityY < 0) {
      this.facingDirection = "up";
    } else if (velocityY > 0) {
      this.facingDirection = "down";
    } else if (velocityX !== 0) {
      this.facingDirection = "side";
    }

    // Play animations
    if (moving) {
      this.player.anims.play(`player-move-${this.facingDirection}`, true);
    } else {
      this.player.anims.play(`player-idle-${this.facingDirection}`, true);
    }
  }

  private createAnimations(): void {
    this.anims.create({
      key: "player-idle-down",
      frames: [{ key: "player", frame: "walk-1.png" }],
    });

    this.anims.create({
      key: "player-idle-up",
      frames: [{ key: "player", frame: "walk-up-1.png" }],
    });

    this.anims.create({
      key: "player-idle-side",
      frames: [{ key: "player", frame: "walk-side-1.png" }],
    });

    this.anims.create({
      key: "player-move-down",
      frames: this.anims.generateFrameNames("player", {
        prefix: "walk-",
        start: 1,
        end: 4,
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 5,
    });

    this.anims.create({
      key: "player-move-up",
      frames: this.anims.generateFrameNames("player", {
        prefix: "walk-up-",
        start: 1,
        end: 4,
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 5,
    });

    this.anims.create({
      key: "player-move-side",
      frames: this.anims.generateFrameNames("player", {
        prefix: "walk-side-",
        start: 1,
        end: 4,
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 5,
    });
  }
}
