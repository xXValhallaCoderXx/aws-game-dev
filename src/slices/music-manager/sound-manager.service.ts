/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// services/sound-manager.service.ts
import { Game, Scene } from "phaser";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import { SYSTEM_EVENTS } from "../events/phaser-events.types";
import { ESOUND_NAMES } from "./sound-manager.types";

// Define interfaces for configurations
interface ISoundConfig {
  key: string;
  loop?: boolean;
  volume?: number;
}

interface IAudioTrack {
  key: string;
  sound: Phaser.Sound.BaseSound;
}

// Define valid keys as types
type MusicKeys = ESOUND_NAMES.MAIN_BG;
type SFXKeys =
  | ESOUND_NAMES.HARVEST_CROP
  | ESOUND_NAMES.PLACE_SEED
  | ESOUND_NAMES.SWORD_SWING_BASE
  | ESOUND_NAMES.PLAYER_WALKING
  | ESOUND_NAMES.PLAYER_DODGE
  | ESOUND_NAMES.PLAYER_GRUNT_ONE
  | ESOUND_NAMES.PLAYER_LIGHT_PUNCH
  | ESOUND_NAMES.ZOMBIE_GROWL_1
  | ESOUND_NAMES.ZOMBIE_GROWL_2
  | ESOUND_NAMES.ZOMBIE_GROWL_3
  | ESOUND_NAMES.ZOMBIE_BITE_1
  | ESOUND_NAMES.POTION_DRINK_1;
type UIKeys = ESOUND_NAMES.HARVEST_CROP;

// Define the audio configuration interface
interface IAudioConfig {
  music: Record<MusicKeys, ISoundConfig>;
  sfx: Record<SFXKeys, ISoundConfig>;
  ui: Record<UIKeys, ISoundConfig>;
}

export class SoundManager {
  private static instance: SoundManager;
  private game: Phaser.Game | null = null;
  private activeScene: Phaser.Scene | null = null;
  private isInitialized: boolean = false;

  // Track current music state
  private currentMusicKey: string | null = null;
  private isMusicTransitioning: boolean = false;

  // Separate storage for different audio types
  private bgMusic: IAudioTrack | null = null;
  private soundEffects: Map<string, Phaser.Sound.BaseSound> = new Map();
  private uiSounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private walkingSound: Phaser.Sound.BaseSound | null = null;

  // Volume controls for different channels
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.7;
  private uiVolume: number = 0.6;

  // Audio configurations with proper typing
  private readonly AUDIO_CONFIG: IAudioConfig = {
    music: {
      [ESOUND_NAMES.MAIN_BG]: {
        key: ESOUND_NAMES.MAIN_BG,
        loop: true,
        volume: 0.5,
      },
    },
    sfx: {
      [ESOUND_NAMES.HARVEST_CROP]: {
        key: ESOUND_NAMES.HARVEST_CROP,
        volume: 0.7,
      },
      [ESOUND_NAMES.POTION_DRINK_1]: {
        key: ESOUND_NAMES.POTION_DRINK_1,
        volume: 0.7,
      },
      [ESOUND_NAMES.PLAYER_LIGHT_PUNCH]: {
        key: ESOUND_NAMES.PLAYER_LIGHT_PUNCH,
        volume: 0.7,
      },
      [ESOUND_NAMES.ZOMBIE_BITE_1]: {
        key: ESOUND_NAMES.ZOMBIE_BITE_1,
        volume: 0.7,
      },
      [ESOUND_NAMES.ZOMBIE_GROWL_1]: {
        key: ESOUND_NAMES.ZOMBIE_GROWL_1,
        volume: 0.7,
      },
      [ESOUND_NAMES.ZOMBIE_GROWL_2]: {
        key: ESOUND_NAMES.ZOMBIE_GROWL_2,
        volume: 0.7,
      },
      [ESOUND_NAMES.ZOMBIE_GROWL_3]: {
        key: ESOUND_NAMES.ZOMBIE_GROWL_3,
        volume: 0.7,
      },
      [ESOUND_NAMES.PLACE_SEED]: { key: ESOUND_NAMES.PLACE_SEED, volume: 0.6 },
      [ESOUND_NAMES.PLAYER_WALKING]: {
        key: ESOUND_NAMES.PLAYER_WALKING,
        volume: 0.6,
        loop: true,
      },
      [ESOUND_NAMES.SWORD_SWING_BASE]: {
        key: ESOUND_NAMES.SWORD_SWING_BASE,
        volume: 0.6,
      },
      [ESOUND_NAMES.PLAYER_GRUNT_ONE]: {
        key: ESOUND_NAMES.PLAYER_GRUNT_ONE,
        volume: 0.6,
      },
      [ESOUND_NAMES.PLAYER_DODGE]: {
        key: ESOUND_NAMES.PLAYER_DODGE,
        volume: 0.6,
      },
    },
    ui: {
      [ESOUND_NAMES.HARVEST_CROP]: {
        key: ESOUND_NAMES.HARVEST_CROP,
        volume: 0.6,
      },
    },
  };

  private constructor() {}

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public static initialize(game: Game): void {
    const instance = SoundManager.getInstance();
    instance.init(game);
  }

  private init(game: Game): void {
    if (this.isInitialized) return;
    this.game = game;
    this.activeScene = game.scene.scenes[0];

    this.isInitialized = true;
    this.loadAudioSettings();
    this.setupEventListeners();
    this.setupSceneEvents(); // Add scene transition handling

    // Start background music after a short delay to ensure assets are loaded
    this.playMusic(ESOUND_NAMES.MAIN_BG, 0);
  }

  private loadAudioSettings(): void {
    // Load saved audio settings from localStorage or your preferred storage
    const savedSettings = localStorage.getItem("audioSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.musicVolume = settings.musicVolume ?? 0.5;
      this.sfxVolume = settings.sfxVolume ?? 0.7;
      this.uiVolume = settings.uiVolume ?? 0.6;
    }
  }

  // Add method to get current music state
  public getCurrentMusicKey(): string | null {
    return this.currentMusicKey;
  }

  // Add method to check if music is transitioning
  public isMusicCurrentlyTransitioning(): boolean {
    return this.isMusicTransitioning;
  }

  private saveAudioSettings(): void {
    const settings = {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      uiVolume: this.uiVolume,
    };
    localStorage.setItem("audioSettings", JSON.stringify(settings));
  }

  private getTweensManager(): Phaser.Tweens.TweenManager | null {
    if (!this.game) return null;

    // Get tweens from active scene
    if (this.activeScene) {
      return this.activeScene.tweens;
    }

    // Fallback to first available scene
    const firstScene = this.game.scene.scenes[0];
    if (firstScene) {
      return firstScene.tweens;
    }

    return null;
  }

  // Music Methods
  public playMusic(key: MusicKeys, fadeIn: number = 1000): void {
    if (!this.game || this.isMusicTransitioning) return;

    if (this.currentMusicKey === key && this.bgMusic?.sound.isPlaying) {
      return;
    }

    const musicConfig = this.AUDIO_CONFIG.music[key];
    if (!musicConfig) return;

    this.isMusicTransitioning = true;

    if (this.bgMusic?.sound) {
      this.fadeOutCurrentMusic(fadeIn, () => {
        this.startNewMusic(key, musicConfig, fadeIn);
      });
    } else {
      this.startNewMusic(key, musicConfig, fadeIn);
    }
  }

  private fadeOutCurrentMusic(duration: number, onComplete: () => void): void {
    if (!this.game || !this.bgMusic?.sound) return;

    const tweens = this.getTweensManager();

    if (!tweens) {
      // Fallback if no tweens manager is available
      this.bgMusic.sound.destroy();
      onComplete();
      return;
    }

    tweens.add({
      targets: this.bgMusic.sound,
      volume: 0,
      duration: duration / 2,
      onComplete: () => {
        this.bgMusic?.sound.destroy();
        onComplete();
      },
    });
  }

  public startWalkingSound(): void {
    if (!this.game) return;

    // If sound is already playing, don't start it again
    if (this.walkingSound?.isPlaying) return;

    const sfxConfig = this.AUDIO_CONFIG.sfx[ESOUND_NAMES.PLAYER_WALKING];
    if (!sfxConfig) return;

    const sfxVolume = sfxConfig?.volume || 6;
    this.walkingSound = this.game.sound.add(ESOUND_NAMES.PLAYER_WALKING, {
      loop: true,
      volume: sfxVolume * this.sfxVolume,
      rate: 1.5,
    });

    this.walkingSound.play();
  }

  public stopWalkingSound(): void {
    if (this.walkingSound?.isPlaying) {
      this.walkingSound.stop();
    }
  }

  public stopMusic(fadeOut: number = 1000): void {
    if (!this.activeScene || !this.bgMusic?.sound) return;

    const tweens = this.getTweensManager();
    if (!tweens) {
      // Fallback if no tweens manager is available
      this.bgMusic.sound.destroy();
      this.bgMusic = null;
      this.currentMusicKey = null;
      this.isMusicTransitioning = false;
      return;
    }

    const currentMusic = this.bgMusic.sound;
    tweens.add({
      targets: currentMusic,
      volume: 0,
      duration: fadeOut,
      onComplete: () => {
        currentMusic.destroy();
        this.bgMusic = null;
        this.currentMusicKey = null;
        this.isMusicTransitioning = false;
      },
    });
  }

  public forceMusicChange(key: MusicKeys, fadeIn: number = 1000): void {
    this.currentMusicKey = null;
    this.playMusic(key, fadeIn);
  }

  // Sound Effects Methods
  public playSFX(key: SFXKeys): void {
    if (!this.game) return;

    const sfxConfig = this.AUDIO_CONFIG.sfx[key];
    if (!sfxConfig) return;

    let sound = this.soundEffects.get(sfxConfig.key);
    if (!sound) {
      sound = this.game.sound.add(sfxConfig.key);
      this.soundEffects.set(sfxConfig.key, sound);
    }

    // Cast to WebAudioSound to access volume property
    (sound as Phaser.Sound.WebAudioSound).volume =
      this.sfxVolume * (sfxConfig.volume || 1);
    sound.play();
  }

  // Add new method to check music status
  public isMusicPlaying(): boolean {
    return this.bgMusic?.sound?.isPlaying || false;
  }

  // UI Sound Methods
  public playUISound(key: UIKeys): void {
    if (!this.game) return;

    const uiConfig = this.AUDIO_CONFIG.ui[key];
    if (!uiConfig) return;

    let sound = this.uiSounds.get(uiConfig.key);
    if (!sound) {
      sound = this.game.sound.add(uiConfig.key);
      this.uiSounds.set(uiConfig.key, sound);
    }

    (sound as Phaser.Sound.WebAudioSound).volume =
      this.uiVolume * (uiConfig.volume || 1);
    sound.play();
  }

  // Volume Control Methods
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic?.sound) {
      (this.bgMusic.sound as Phaser.Sound.WebAudioSound).volume =
        this.musicVolume;
    }
    this.saveAudioSettings();
  }

  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.soundEffects.forEach((sound) => {
      (sound as Phaser.Sound.WebAudioSound).volume = this.sfxVolume;
    });
    this.saveAudioSettings();
  }
  public setUIVolume(volume: number): void {
    this.uiVolume = Math.max(0, Math.min(1, volume));
    this.uiSounds.forEach((sound) => {
      (sound as Phaser.Sound.WebAudioSound).volume = this.uiVolume;
    });
    this.saveAudioSettings();
  }

  // Mute/Unmute Methods
  public muteAll(): void {
    if (!this.game) return;
    this.game.sound.mute = true;
  }

  public unmuteAll(): void {
    if (!this.game) return;
    this.game.sound.mute = false;
  }

  // Cleanup Method
  public destroy(): void {
    if (this.bgMusic?.sound) {
      this.bgMusic.sound.destroy();
    }
    this.cleanupSceneSounds();
    this.currentMusicKey = null;
    this.isMusicTransitioning = false;
  }

  // Scene transition handling
  private setupSceneEvents(): void {
    if (!this.game) return;

    // Handle existing scenes
    this.game.scene.scenes.forEach((scene) => {
      this.setupSceneEventListeners(scene);
    });

    // Handle new scenes added after initialization
    this.game.events.on("scenecreate", (scene: Scene) => {
      this.setupSceneEventListeners(scene);
    });
  }

  private setupSceneEventListeners(scene: Scene): void {
    scene.events.on("create", () => {
      this.activeScene = scene;

      this.handleSceneTransition(scene);
    });

    scene.events.on("shutdown", () => {
      // Only clear scene-specific sounds, not background music
      this.cleanupSceneSounds();
    });
  }

  private handleSceneTransition(scene: Scene): void {
    // Ensure music continues playing during scene transitions

    if (
      this.bgMusic?.sound &&
      !this.bgMusic.sound.isPlaying &&
      this.currentMusicKey
    ) {
      this.playMusic(this.currentMusicKey as MusicKeys);
    }
    this.playMusic(this.currentMusicKey as MusicKeys);
  }

  private cleanupSceneSounds(): void {
    // Clean up scene-specific sounds but preserve background music
    this.soundEffects.forEach((sound) => sound.destroy());
    this.uiSounds.forEach((sound) => sound.destroy());
    this.soundEffects.clear();
    this.uiSounds.clear();
  }

  private startNewMusic(
    key: MusicKeys,
    musicConfig: ISoundConfig,
    fadeIn: number
  ): void {
    if (!this.game) return;

    // Cleanup any existing music
    if (this.bgMusic?.sound) {
      this.bgMusic.sound.stop();
      this.bgMusic.sound.destroy();
      this.bgMusic = null;
    }

    const initialVolume =
      fadeIn > 0 ? 0 : this.musicVolume * (musicConfig.volume || 1);

    // Create new music instance with correct initial volume
    const music = this.game.sound.add(musicConfig.key, {
      loop: musicConfig.loop,
      volume: initialVolume,
    });

    music.play();

    if (fadeIn > 0) {
      // Only use tween if we want to fade in
      const tweens = this.getTweensManager();
      if (!tweens) {
        // Fallback if no tweens manager is available
        music.setVolume(this.musicVolume * (musicConfig.volume || 1));
        this.isMusicTransitioning = false;
      } else {
        tweens.add({
          targets: music,
          volume: this.musicVolume * (musicConfig.volume || 1),
          duration: fadeIn / 2,
          onComplete: () => {
            this.isMusicTransitioning = false;
          },
        });
      }
    } else {
      // If no fade, just mark as not transitioning
      this.isMusicTransitioning = false;
    }

    this.currentMusicKey = key;
    this.bgMusic = { key: musicConfig.key, sound: music };
  }

  private setupEventListeners(): void {
    if (!this.game) return;

    PhaserEventBus.on(SYSTEM_EVENTS.DISABLE_MUSIC, this.stopMusic, this);
    PhaserEventBus.on(
      SYSTEM_EVENTS.ENABLE_MUSIC,
      () => {
        if (this.currentMusicKey) {
          this.playMusic(this.currentMusicKey as MusicKeys);
        }
      },
      this
    );
  }
}

export default SoundManager.getInstance();
