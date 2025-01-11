/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseScene } from "../BaseScene";
import { ESCENE_KEYS } from "../../shared/scene-keys";
import { GuideCharacter } from "../../slices/character/GuideCharacter";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";

export class IntroCutScene extends BaseScene {
  private guideNPC!: GuideCharacter;
  private waterLayer?: Phaser.Tilemaps.TilemapLayer | null;
  private farmableLayer?: Phaser.Tilemaps.TilemapLayer | null;
  private waterAnimatedLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private backgroundMusic: Phaser.Sound.BaseSound | null = null;
  private cutsceneStep: number = 0;

  constructor() {
    super(ESCENE_KEYS.INTRO_CUTSCENE);
  }

  init(data: any) {
    super.init(data);
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("home-map", "maps/home-map.json");
    this.load.image("terrain-village-1", "tilesets/terrain-village-1.png");
    this.load.image("water-blank", "tilesets/water-blank.png");
    this.load.image("water-main-animated", "tilesets/water-main-animated.png"); // Add this line
    this.load.image("crops-tiles-main", "tilesets/crops-tiles-main.png");
    this.load.image("buildings-main", "tilesets/buildings-main.png");
    this.load.audio("backgroundMusic", "sounds/main-bgm.mp3");
  }

  protected getDefaultStartingPosition(): { x: number; y: number } {
    return { x: 25, y: 205 }; // Default spawn point on TownMap
  }

  create() {
    super.create();

    this.createMap();

    this.backgroundMusic = this.sound.add("backgroundMusic", {
      volume: 0.2, // Set lower volume (0 to 1)
      loop: true, // Loop the music
    });

    // Play the background music
    this.backgroundMusic.play();
    // Disable player input
    this.input.enabled = false;
    // this.player.setVisible(false); // Optionally hide the player during the cutscene

    // Create Guide NPC starting further away
    this.guideNPC = new GuideCharacter({
      scene: this,
      x: 400, // Start further away
      y: 200,
      texture: "guide-idle",
      characterType: "guide",
      stats: {
        defense: 10,
        health: 10,
        maxHealth: 10,
        speed: 2,
        strength: 10,
      },
      dialogues: [
        {
          key: "initial",
          dialogues: [
            { speaker: "Guide", text: "Oh! A new visitor to our village!" },
          ],
        },
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
      initialBranchKey: "initial",
    });

    // Make sure the guide is added to the scene and visible
    this.add.existing(this.guideNPC);
    this.guideNPC.setDepth(10); // Set a depth value higher than the map layers

    // Start with initial dialogue
    this.startCutsceneSequence();

    // Listen for dialogue choices and end events
    PhaserEventBus.on("choose-dialogue", this.handleDialogueChoice, this);
    PhaserEventBus.on("cutscene-end", this.handleDialogueEnd, this);
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

  private startCutsceneSequence() {
    // Start with initial greeting
    this.guideNPC.initiateDialogue();
  }

  private handleDialogueEnd = () => {
    this.cutsceneStep++;
    
    switch (this.cutsceneStep) {
      case 1:
        // After initial greeting, move closer to player
        this.guideNPC.moveAlongPath(
          [{ x: 250, y: 100 }],
          150,
          () => {
            // After reaching the position, start main dialogue
            this.time.delayedCall(500, () => {
              this.guideNPC.handleDialogueChoice("start");
            });
          }
        );
        break;
      
      case 2:
        // Final step - end cutscene
        this.endCutscene();
        break;
    }
  }

  private handleDialogueChoice = (choice: string) => {
    if (choice === "startAdventure") {
      // Move to a new position before ending
      this.guideNPC.moveAlongPath(
        [{ x: 200, y: 150 }],
        150,
        () => this.endCutscene()
      );
    } else {
      // For "tellMore", just continue the dialogue
      this.guideNPC.initiateDialogue();
    }
  }

  private endCutscene(): void {
    // Re-enable player input and make the player visible
    this.input.enabled = true;
    if (this.player) {
      this.player.setVisible(true);
      if (this.player.body) {
        this.player.body.enable = true;
      }
    }

    // Define the path for guideNPC to follow to the far right
    const path = [
      { x: this.guideNPC.x + 300, y: this.guideNPC.y }, // Move right by 300 units
    ];

    // Move guideNPC along the defined path
    this.guideNPC.moveAlongPath(path, 100, () => {
      // Create a promise to handle the fade out
      const fadeOutPromise = new Promise<void>((resolve) => {
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        this.cameras.main.once(
          Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
          () => {
            console.log("Fade-out complete. Transitioning to HOME_MAP.");
            resolve();
          }
        );
      });

      // Handle the scene transition after fade out
      fadeOutPromise.then(() => {
        this.scene.start(ESCENE_KEYS.HOME_MAP, { spawnX: 185, spawnY: 170 });
      });
    });
  }

  // destroy() {
  //   // Clean up event listeners
  //   PhaserEventBus.off("dialogue-complete");
  //   if (this.backgroundMusic) {
  //     this.backgroundMusic.stop();
  //   }
  //   super.destroy();
  // }
}
