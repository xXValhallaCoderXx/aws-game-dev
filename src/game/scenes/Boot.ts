import { Scene } from 'phaser';

export class Boot extends Scene {
  controls = null;
  constructor() {
    super("Boot");
  }

  preload() {
    this.load.image("mario-tiles", "assets/tile-sets/super-mario-tiles.png");

    this.load.image(
      "tiles",
      "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/tilesets/catastrophi_tiles_16_blue.png"
    );
    this.load.tilemapCSV(
      "map",
      "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/tilemaps/catastrophi_level3.csv"
    );
  }

  create() {
    // const level = [
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 1, 2, 3, 0, 0, 0, 1, 2, 3, 0],
    //   [0, 5, 6, 7, 0, 0, 0, 5, 6, 7, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 14, 13, 14, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 14, 14, 14, 14, 14, 0, 0, 0, 15],
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 15],
    //   [35, 36, 37, 0, 0, 0, 0, 0, 15, 15, 15],
    //   [39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39],
    // ];

    // const map = this.make.tilemap({
    //   data: level,
    //   tileWidth: 16,
    //   tileHeight: 16,
    // });
    // const tiles = map.addTilesetImage("mario-tiles");
    // const layer = map.createLayer(0, tiles, 0, 0);

    const map = this.make.tilemap({
      key: "map",
      tileWidth: 16,
      tileHeight: 16,
    });
    const tileset = map.addTilesetImage("tiles");
    const layer = map.createLayer(0, tileset, 0, 0); // layer index, tileset, x, y

    const camera = this.cameras.main;

    // Set up the arrows to control the camera
    const cursors = this.input.keyboard.createCursorKeys();
    this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
      camera: camera,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      speed: 0.5,
    });

    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.add
      .text(16, 16, "Arrow keys to scroll", {
        font: "18px monospace",
        fill: "#ffffff",
        padding: { x: 20, y: 10 },
        backgroundColor: "#000000",
      })
      .setScrollFactor(0);
  }

  update(time, delta) {
    // Apply the controls to the camera each update tick of the game
    this.controls.update(delta);
  }
}
