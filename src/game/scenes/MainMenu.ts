import { PhaserEventBus as EventBus } from "../../shared/services/phaser.service";
import { Scene, Tweens } from "phaser";

export class MainMenu extends Scene {
  private logoTween: Tweens.Tween | null = null;
  private logo!: Phaser.GameObjects.Image;

  constructor() {
    super("MainMenu");
  }

  create(): void {
    // Add background image
    this.add.image(512, 384, "background");

    // Add logo image
    this.logo = this.add.image(512, 300, "logo").setDepth(100);

    // Add text for main menu
    this.add
      .text(512, 460, "Main Menu", {
        fontFamily: "Arial Black",
        fontSize: "38px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setDepth(100)
      .setOrigin(0.5);

    // Notify the EventBus that this scene is ready
    EventBus.emit("current-scene-ready", this);
  }

  changeScene(): void {
    if (this.logoTween) {
      this.logoTween.stop();
      this.logoTween = null;
    }

    // Start the 'Game' scene
    this.scene.start("Game");
  }

  moveLogo(reactCallback?: (position: { x: number; y: number }) => void): void {
    if (this.logoTween) {
      if (this.logoTween.isPlaying()) {
        this.logoTween.pause();
      } else {
        this.logoTween.play();
      }
    } else {
      this.logoTween = this.tweens.add({
        targets: this.logo,
        x: { value: 750, duration: 3000, ease: "Back.easeInOut" },
        y: { value: 80, duration: 1500, ease: "Sine.easeOut" },
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
          if (reactCallback) {
            reactCallback({
              x: Math.floor(this.logo.x),
              y: Math.floor(this.logo.y),
            });
          }
        },
      });
    }
  }
}
