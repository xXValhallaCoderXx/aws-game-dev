class MusicManager {
  private static instance: MusicManager;
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private scene: Phaser.Scene | null = null;
  private musicVolume: number = 0.5;
  private musicKeys: Map<string, boolean> = new Map(); // Track loaded music
  private isLoading: boolean = false;

  private constructor() {}

  public static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }
  public initialize(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  public isInitialized(): boolean {
    return this.scene !== null;
  }

  public addMusic(key: string, path: string): void {
    if (!this.scene) {
      throw new Error("MusicManager not initialized. Call initialize() first.");
    }

    if (!this.musicKeys.has(key)) {
      this.scene.load.audio(key, path);
      this.musicKeys.set(key, false);
    }
  }

  // Method to create the music tracks after loading
  public create(): void {
    if (!this.scene) {
      throw new Error("MusicManager not initialized. Call initialize() first.");
    }

    this.isLoading = true;

    this.scene.load.once("complete", () => {
      for (const [key] of this.musicKeys) {
        if (!this.scene?.sound.get(key)) {
          this.scene?.sound.add(key, {
            loop: true,
            volume: this.musicVolume,
          });
        }
        this.musicKeys.set(key, true);
      }
      this.isLoading = false;
      console.log("Music loading complete");
    });

    this.scene.load.start();
  }

  public async crossFade(
    newMusicKey: string,
    duration: number = 1000
  ): Promise<void> {
    if (!this.scene) {
      throw new Error("MusicManager not initialized");
    }
    console.log("CROSSFADE: ", newMusicKey);
    console.log("MUSIC KEYS: ", this.musicKeys);
    console.log("LOADED STATUS: ", this.musicKeys.get(newMusicKey));

    // Check if the music is loaded

    if (this.isLoading) {
      console.log("Waiting for music to load...");
      await new Promise((resolve) => {
        this.scene!.load.once("complete", resolve);
      });
    }

    // Check if the music exists in the sound manager directly
    const newMusic = this.scene.sound.get(newMusicKey);
    if (!newMusic) {
      throw new Error(`Music track ${newMusicKey} not found in sound manager`);
    }

    // If there's current music playing, fade it out
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: 0,
        duration: duration,
        //   onUpdate: (tween: Phaser.Tweens.Tween) => {
        //     this.currentMusic?.setVolume(tween.getValue());
        //   },
        onComplete: () => {
          this.currentMusic?.stop();
        },
      });
    }

    // Start new music and fade it in
    newMusic.play();
    // newMusic.setVolume(0);
    this.scene.tweens.add({
      targets: newMusic,
      volume: this.musicVolume,
      duration: duration,
      //   onUpdate: (tween: Phaser.Tweens.Tween) => {
      //     newMusic.setVolume(tween.getValue());
      //   }
    });

    this.currentMusic = newMusic;
  }

  public setVolume(volume: number): void {
    this.musicVolume = volume;
    if (this.currentMusic) {
      console.log("VOLUME");
    }
  }

  public stop(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }
}

export default MusicManager.getInstance();
