import { BaseScene } from "../BaseScene";
import { ESCENE_KEYS } from "../../shared/scene-keys";
import { GuideCharacter } from "../../slices/character/GuideCharacter";
import { PhaserEventBus } from "../../shared/services/phaser.service";

export class IntroCutScene extends BaseScene {
  private guideNPC!: GuideCharacter;
  private waterLayer?: Phaser.Tilemaps.TilemapLayer | null;
  private farmableLayer?: Phaser.Tilemaps.TilemapLayer | null;
  private waterAnimatedLayer: Phaser.Tilemaps.TilemapLayer | null = null;

  constructor() {
    super(ESCENE_KEYS.INTRO_CUTSCENE);
  }

  init() {
    super.init();
    console.log("INTRO CUTSCENE");
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("home-map", "maps/home-map.json");
    this.load.image("terrain-village-1", "tilesets/terrain-village-1.png");
    this.load.image("water-blank", "tilesets/water-blank.png");
    this.load.image("water-main-animated", "tilesets/water-main-animated.png"); // Add this line
    this.load.image("crops-tiles-main", "tilesets/crops-tiles-main.png");
    this.load.image("buildings-main", "tilesets/buildings-main.png");
  }

  create() {
    super.create();

    // Disable player input
    this.input.enabled = false;
    this.player.setVisible(false); // Optionally hide the player during the cutscene

    // Create Guide NPC
    this.guideNPC = new GuideCharacter({
      scene: this,
      x: 250,
      y: 250,
      texture: "guide-idle",
      animations: {
        idle: "guide-idle",
        walk: "guide-walk",
      },
      dialogues: [
        {
          key: "start",
          dialogues: [
            { speaker: "Guide", text: "Welcome to our village!" },
            {
              speaker: "Guide",
              text: "I'm here to guide you through your journey.",
            },
            {
              speaker: "Guide",
              text: "Would you like to start your adventure now?",
            },
          ],
          choices: [
            { text: "Yes, let's go!", nextBranch: "startAdventure" },
            { text: "Tell me more.", nextBranch: "tellMore" },
          ],
        },
        {
          key: "startAdventure",
          dialogues: [
            { speaker: "Guide", text: "Great! Follow me to your first task." },
          ],
        },
        {
          key: "tellMore",
          dialogues: [
            {
              speaker: "Guide",
              text: "Our village is full of mysteries and adventures.",
            },
            {
              speaker: "Guide",
              text: "Explore, interact, and uncover the secrets that lie ahead.",
            },
            {
              speaker: "Guide",
              text: "Whenever you're ready, let me know to begin.",
            },
          ],
        },
      ],
      initialBranchKey: "start",
    });

    // Setup NPC Animations
    this.guideNPC.setupAnimations({
      idle: {
        key: "guide-idle",
        frames: this.anims.generateFrameNumbers("guide-idle", {
          start: 0,
          end: 3,
        }),
        frameRate: 2,
        repeat: -1,
      },
      walk: {
        key: "guide-walk",
        frames: this.anims.generateFrameNumbers("guide-idle", {
          start: 4,
          end: 7,
        }),
        frameRate: 10,
        repeat: -1,
      },
    });

    // Start Dialogue
    this.guideNPC.initiateDialogue();
    // Listen for cutscene-end event to transition to HomeMap
    PhaserEventBus.on("cutscene-end", this.endCutscene, this);
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

    const buildingTileset = this.map.addTilesetImage(
      "buildings-main",
      "buildings-main"
    );

    if (
      !terrainVillage1Tileset ||
      !waterBlankTileset ||
      !waterAnimatedTileset ||
      !cropsTileset ||
      !buildingTileset
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

    if (this.waterLayer) {
      this.waterLayer.setCollisionByProperty({ collides: true });
    }

    if (this.waterAnimatedLayer) {
      this.waterAnimatedLayer.setCollisionByProperty({ collides: true });
    }
  }

  private endCutscene(): void {
    // Re-enable player input and make the player visible
    this.input.enabled = true;
    this.player.setVisible(true);
    if (this.player.body) {
      this.player.body.enable = true;
    }

    // Transition to the main game scene
    this.scene.start(ESCENE_KEYS.HOME_MAP, { spawnX: 185, spawnY: 170 });
  }

  // Clean up event listeners when scene is destroyed
  // public shutdown() {
  //   super.shutdown();
  //   PhaserEventBus.off("cutscene-end", this.endCutscene, this);
  // }

  // public destroy() {
  //   super.destroy();
  //   PhaserEventBus.off("cutscene-end", this.endCutscene, this);
  // }
}
