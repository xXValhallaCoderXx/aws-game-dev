/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene } from "phaser";
import { ESCENE_KEYS } from "../shared/scene-keys";
import { ESOUND_NAMES } from "@/slices/music-manager/sound-manager.types";

export class Preloader extends Scene {
  constructor() {
    super(ESCENE_KEYS.PRELOADER);
  }

  init() {}

  preload() {
    console.log("PRELOADER STARTING");
    this.load.audio(ESOUND_NAMES.MAIN_BG, "sounds/main-bgm.mp3");
    this.load.audio(ESOUND_NAMES.PLACE_SEED, "sounds/seed-place.wav");
    this.load.audio(ESOUND_NAMES.HARVEST_CROP, "sounds/harvest-crop-sound.wav");
    this.load.audio(ESOUND_NAMES.PLAYER_WALKING, "sounds/player-walking.mp3");
    this.load.audio(ESOUND_NAMES.PLAYER_DODGE, "sounds/player-dodge.wav");
    this.load.audio(
      ESOUND_NAMES.SWORD_SWING_BASE,
      "sounds/sword-swing-base.wav"
    );

    // Load Assets
    this.load.image("grass", "tiles/grass.png");
    this.load.image("hills", "tiles/hills.png");
    this.load.image("tilled_dirt", "tiles/tilled_dirt.png");

    this.load.spritesheet(
      "guide-walk",
      "sprites/characters/guide/guide-walk.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    this.load.spritesheet(
      "slime-normal",
      "sprites/characters/enemy/slime-normal.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );

    this.load.spritesheet(
      "slime-epic",
      "sprites/characters/enemy/slime-epic.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );


    this.load.spritesheet(
      "rat-normal",
      "sprites/characters/enemy/rat-normal.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );

    this.load.spritesheet("rat-epic", "sprites/characters/enemy/rat-epic.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet(
      "zombie-normal",
      "sprites/characters/enemy/zombie-normal.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );

    this.load.spritesheet(
      "zombie-epic",
      "sprites/characters/enemy/zombie-epic.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );

    this.load.spritesheet(
      "guide-idle",
      "sprites/characters/guide/guide-idle.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    this.load.spritesheet(
      "player-walk",
      "sprites/characters/player/player-walk.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    this.load.spritesheet(
      "player-roll",
      "sprites/characters/player/player-roll.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );


    this.load.spritesheet(
      "player-attack-one-hand",
      "sprites/characters/player/player-attack-one-hand.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    this.load.spritesheet(
      "player-attack-one-hand-sword",
      "sprites/characters/player/player-attack-one-hand-sword.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );


    this.load.spritesheet(
      "player-idle",
      "sprites/characters/player/player-idle.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    // Load the carry walking sprite sheet
    this.load.spritesheet(
      "player-carry-walk",
      "sprites/characters/player/player-carry-walk.png",
      {
        frameWidth: 80, // Replace with actual frame width
        frameHeight: 80, // Replace with actual frame height
      }
    );

    // Load the carry idle sprite sheet
    this.load.spritesheet(
      "player-carry-idle",
      "sprites/characters/player/player-carry-idle.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    // Load Crop pull
    this.load.spritesheet(
      "player-harvest",
      "sprites/characters/player/player-crop-pull.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );
    this.load.spritesheet("seed-packets", "sprites/crops/seed-packets.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet(
      "harvested-crops",
      "sprites/crops/crops-harvested.png",
      {
        frameWidth: 16, // Width of each frame
        frameHeight: 16, // Height of each frame
      }
    );
    console.log("PRELOADER ENDING");
  }

  create() {
    // Start loading all assets
    // this.load.start();

    if (this.sound.get(ESOUND_NAMES.MAIN_BG)) {
      console.log("Audio loaded successfully");
    }

    // Start the next scene
    this.scene.start(ESCENE_KEYS.HOME_MAP);
  }
}
