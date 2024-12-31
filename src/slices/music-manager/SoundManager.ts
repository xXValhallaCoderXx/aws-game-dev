// services/sound-manager.service.ts
import { PhaserEventBus } from "@/shared/services/phaser-event.service";

export class SoundManager {
  private static instance: SoundManager;
  private game: Phaser.Game | null = null;

  private constructor() {
    console.log("LEGGO SOUND");
    // Initialize sound state
    PhaserEventBus.on("sound:toggle", () => {
      if (this.game) {
        const newMuteState = !this.game.sound.mute;
        this.game.sound.setMute(newMuteState);
        PhaserEventBus.emit("sound:stateChanged", newMuteState);
      }
    });
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public init(game: Phaser.Game) {
    this.game = game;
  }

  public toggleSound() {
    if (this.game) {
      const newMuteState = !this.game.sound.mute;
      this.game.sound.setMute(newMuteState);
      return newMuteState;
    }
    return false;
  }

  public isMuted(): boolean {
    return this.game?.sound.mute ?? false;
  }
}

export const soundManager = SoundManager.getInstance();
