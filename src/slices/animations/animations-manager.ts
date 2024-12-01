export class AnimationManager {
  private static animationsCreated = false;

  public static createPlayerAnimations(scene: Phaser.Scene): void {
    if (this.animationsCreated) return;

    // Create harvest animations
    ["up", "down", "left", "right"].forEach((direction, index) => {
      scene.anims.create({
        key: `player-harvest-${direction}`,
        frames: scene.anims.generateFrameNumbers("player-harvest", {
          start: index * 6,
          end: index * 6 + 5,
        }),
        frameRate: 12,
        repeat: 0,
      });
    });

    this.animationsCreated = true;
  }
}
