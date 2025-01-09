import Phaser from "phaser";

export class HealthBar {
  private readonly container: Phaser.GameObjects.Graphics;
  private readonly bar: Phaser.GameObjects.Graphics;
  private readonly scene: Phaser.Scene;

  constructor(
    scene: Phaser.Scene,
    private config: {
      width?: number;
      height?: number;
      borderThickness?: number;
      borderColor?: number;
      backgroundColor?: number;
      barColor?: number;
    } = {}
  ) {
    this.scene = scene;
    this.container = scene.add.graphics();
    this.bar = scene.add.graphics();

    // Set default values
    this.config = {
      width: 20,
      height: 2.5,
      borderThickness: 1,
      borderColor: 0x8b5a2b, // Brown border
      backgroundColor: 0xd4a374, // Light brown
      barColor: 0xff5555, // Red
      ...config,
    };
  }

  public update(x: number, y: number, ratio: number, offsetY: number): void {
    this.container.clear();
    this.bar.clear();

    // Update position
    this.container.setPosition(x, y);
    this.bar.setPosition(x, y);

    this.drawBorder(offsetY);
    this.drawBackground(offsetY);
    this.drawHealthBar(offsetY, ratio);
  }

  private drawBorder(offsetY: number): void {
    const { width, height, borderThickness, borderColor } = this.config;
    this.container.fillStyle(borderColor!);
    this.container.fillRect(
      -width! / 2 - borderThickness!,
      offsetY - borderThickness!,
      width! + borderThickness! * 2,
      height! + borderThickness! * 2
    );
  }

  private drawBackground(offsetY: number): void {
    const { width, height, backgroundColor } = this.config;
    this.container.fillStyle(backgroundColor!);
    this.container.fillRect(-width! / 2, offsetY, width!, height!);
  }

  private drawHealthBar(offsetY: number, ratio: number): void {
    const { width, height, barColor } = this.config;
    this.bar.fillStyle(barColor!);
    this.bar.fillRect(-width! / 2, offsetY, width! * ratio, height!);
  }

  public destroy(): void {
    this.container.destroy();
    this.bar.destroy();
  }
}
