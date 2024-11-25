export class Crop {
  public x: number;
  public y: number;
  public cropType: string;
  public growthStage: number;
  public maxGrowthStage: number;
  public growthTime: number; // Time required to reach next stage
  public elapsedTime: number = 0;
  public sprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number, cropType: string) {
    this.x = x;
    this.y = y;
    this.cropType = cropType;
    this.growthStage = 0;
    this.maxGrowthStage = 4; // Since stages are from 0 to 4
    this.growthTime = this.getGrowthTime(cropType);
    this.sprite = scene.add.sprite(x, y, "crops-objects");
    scene.add.existing(this.sprite);
    this.updateSpriteFrame();
  }

  private getGrowthTime(cropType: string): number {
    // Define growth times for different crops
    const growthTimes: { [key: string]: number } = {
      carrot: 1200,
      raddish: 1400,
      cauliflower: 1600,
      // Add more crops as needed
    };
    return growthTimes[cropType] || 5000; // Default to 5000 ms
  }

  update(delta: number) {
    this.elapsedTime += delta;

    if (
      this.elapsedTime >= this.growthTime &&
      this.growthStage < this.maxGrowthStage
    ) {
      this.elapsedTime -= this.growthTime;
      this.growthStage++;
      this.updateSpriteFrame();
    }
  }

  private updateSpriteFrame() {
    // Map crop types to their row indices
    const cropRows: { [key: string]: number } = {
      carrot: 0,
      raddish: 1,
      cauliflower: 2,
      // Add more crops as needed
    };

    const cropRow = cropRows[this.cropType];

    if (cropRow === undefined) {
      console.error(`Unknown crop type: ${this.cropType}`);
      return;
    }

    const framesPerRow = 5; // Number of growth stages
    const frameIndex = cropRow * framesPerRow + this.growthStage;

    this.sprite.setFrame(frameIndex);
  }
}
