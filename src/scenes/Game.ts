/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene } from "phaser";
import { ESCENE_KEYS } from "../shared/scene-keys";
// import debugDrawer from "../shared/services/utils/phaser-debug.util";

export class Game extends Scene {
  // So we don't need non null assertion operator (!) in the code
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super(ESCENE_KEYS.GAME);
  }

  init() {}

  preload() {
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors) {
      this.cursors = cursors;
    }
  }

  create() {
    const map = this.make.tilemap({ key: "main-map" });
    const tileset = map.addTilesetImage("grass", "grass");
    const tileset2 = map.addTilesetImage("hills", "hills");

    if (!tileset || !tileset2) {
      throw new Error("Failed to load tilesets");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const grassLayer = map.createLayer("GrassLayer", tileset, 0, 0);
    const hillsLayer = map.createLayer("HillsLayer", tileset2, 0, 0);

    if (!hillsLayer) {
      throw new Error("Failed to create hills layer");
    }

    hillsLayer.setCollisionByProperty({ collides: true });

    // debugDrawer(hillsLayer, this);

    this.player = this.physics.add.sprite(20, 20, "player", "walk-1");

    if (!this.player) {
      throw new Error("Failed to create player sprite");
    }

    this.player.body?.setSize(
      this.player.width * 1.2,
      this.player.height * 1.2
    );

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

    this.player.anims.play("player-idle-down");
    this.physics.add.collider(this.player, hillsLayer);
  }

  update(t: number, dt: number) {
    console.log("Update: T ", t);
    console.log("Update: DT ", dt);
    if (!this.cursors || !this.player) return;

    const speed = 100;
    if (this.cursors.left?.isDown) {
      this.player.anims.play("player-move-side", true);
      this.player.setVelocity(-speed, 0);
      this.player.scaleX = 1;
      this.player.body.offset.x = -2;
    } else if (this.cursors.right?.isDown) {
      this.player.anims.play("player-move-side", true);
      this.player.setVelocity(speed, 0);
      this.player.scaleX = -1;
      this.player.body.offset.x = 18;
    } else if (this.cursors.up?.isDown) {
      this.player.anims.play("player-move-up", true);
      this.player.setVelocity(0, -speed);
    } else if (this.cursors.down?.isDown) {
      this.player.anims.play("player-move-down", true);
      this.player.setVelocity(0, speed);
    } else {
      const parts = this.player.anims.currentAnim.key.split("-");
      parts[1] = "idle";
      this.player.play(parts.join("-"));
      this.player.setVelocity(0);
    }
  }
}
