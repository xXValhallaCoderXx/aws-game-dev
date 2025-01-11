/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene } from "phaser";
import { ESCENE_KEYS } from "../shared/scene-keys";
import { ESOUND_NAMES } from "@/slices/music-manager/sound-manager.types";
import {
  SPRITE_SHEETS,
  ICON_SPRITE_SHEETS,
} from "@/shared/constants/sprite-sheet-names";

export class Preloader extends Scene {
  constructor() {
    super(ESCENE_KEYS.PRELOADER);
  }

  init() {}

  preload() {
    this.load.audio(ESOUND_NAMES.MAIN_BG, "sounds/main-bgm.mp3");
    this.load.audio(ESOUND_NAMES.PLACE_SEED, "sounds/seed-place.wav");
    this.load.audio(ESOUND_NAMES.HARVEST_CROP, "sounds/harvest-crop-sound.wav");
    this.load.audio(ESOUND_NAMES.PLAYER_WALKING, "sounds/player-walking.mp3");
    this.load.audio(ESOUND_NAMES.PLAYER_DODGE, "sounds/player-dodge.wav");
    this.load.audio(
      ESOUND_NAMES.PLAYER_GRUNT_ONE,
      "sounds/player-grunt-one.wav"
    );
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
      SPRITE_SHEETS.PlayerWalk,
      "sprites/characters/player/player-walk.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    this.load.spritesheet(
      SPRITE_SHEETS.PlayerRoll,
      "sprites/characters/player/player-roll.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    this.load.spritesheet(
      SPRITE_SHEETS.PlayerDamage,
      "sprites/characters/player/player-damage.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    this.load.spritesheet(
      SPRITE_SHEETS.PlayerAttackOneHand,
      "sprites/characters/player/player-attack-one-hand.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    this.load.spritesheet(
      SPRITE_SHEETS.PlayerAttackOneHandSword,
      "sprites/characters/player/player-attack-one-hand-sword.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    this.load.spritesheet(
      SPRITE_SHEETS.PlayerIdle,
      "sprites/characters/player/player-idle.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    // Load the carry walking sprite sheet
    this.load.spritesheet(
      SPRITE_SHEETS.PlayerCarryWalk,
      "sprites/characters/player/player-carry-walk.png",
      {
        frameWidth: 80, // Replace with actual frame width
        frameHeight: 80, // Replace with actual frame height
      }
    );

    // Load the carry idle sprite sheet
    this.load.spritesheet(
      SPRITE_SHEETS.PlayerCarryIdle,
      "sprites/characters/player/player-carry-idle.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    // Load Crop pull
    this.load.spritesheet(
      SPRITE_SHEETS.PlayerCropPull,
      "sprites/characters/player/player-crop-pull.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );
    this.load.spritesheet(
      ICON_SPRITE_SHEETS.FARMING.file,
      ICON_SPRITE_SHEETS.FARMING.path,
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );

    this.load.spritesheet(
      ICON_SPRITE_SHEETS.BLACKSMITH_ICONS.file,
      ICON_SPRITE_SHEETS.BLACKSMITH_ICONS.path,
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );

    this.load.spritesheet(
      "harvested-crops",
      "sprites/crops/crops-harvested.png",
      {
        frameWidth: 16, // Width of each frame
        frameHeight: 16, // Height of each frame
      }
    );
  }

  create() {
    // Start loading all assets
    // this.load.start();

    if (this.sound.get(ESOUND_NAMES.MAIN_BG)) {
      console.log("Audio loaded successfully");
    }

    // Start the next scene
    this.scene.start(ESCENE_KEYS.CAVE_MAP);
  }
}
