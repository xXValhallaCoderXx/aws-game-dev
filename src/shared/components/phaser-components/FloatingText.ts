interface FloatingTextConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  text: string;
  size?: number;
  color?: string;
  strokeColor?: string;
  strokeThickness?: number;
  shadowColor?: string;
  moveDistance?: number;
  duration?: number;
}

export class FloatingText extends Phaser.GameObjects.Text {
  constructor(config: FloatingTextConfig) {
    const {
      scene,
      x,
      y,
      text,
      size = 16,
      color = "#ff6b6b",
      strokeColor = "#ffffff",
      strokeThickness = Math.max(2, size / 10),
      shadowColor = "#000000",
      moveDistance = 60,
      duration = 1200,
    } = config;

    // Add a smaller random offset
    const randomOffset = Phaser.Math.Between(-10, 10);
    const adjustedX = x + randomOffset;
    // Adjust Y position to start slightly above the character
    const adjustedY = y;

    super(scene, adjustedX, adjustedY, text, {
      fontFamily: "Arial Round MT Bold, Arial, sans-serif",
      fontSize: `${size}px`,
      color: color,
      stroke: strokeColor,
      strokeThickness: strokeThickness,
      shadow: {
        color: shadowColor,
        fill: true,
        offsetX: Math.max(1, size / 20),
        offsetY: Math.max(1, size / 20),
        blur: Math.max(2, size / 10),
      },
    });

    scene.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setDepth(999);

    // Create the floating animation
    scene.tweens.add({
      targets: this,
      y: adjustedY - moveDistance,
      alpha: 0,
      scale: 0.7,
      duration: duration,
      ease: "Cubic.out",
      onComplete: () => {
        this.destroy();
      },
    });
  }
}
