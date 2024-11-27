import { CharacterConfig } from "./player-character.interface";

export class Character extends Phaser.Physics.Arcade.Sprite {
  protected speed: number;
  protected cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  public facingDirection: "up" | "down" | "left" | "right" = "down";

  constructor(config: CharacterConfig) {
    // Call the parent class constructor with texture key and initial position
    super(config.scene, config.x, config.y, config.texture);

    this.speed = config.speed;

    // Add sprite to scene
    config.scene.add.existing(this);
    config.scene.physics.add.existing(this);

    // **Set the origin to the center**
    this.setOrigin(0.5, 0.5);

    if (this.body) {
      // **Adjust the physics body to match the sprite**
      this.body.setSize(16, 16);
      this.body.setOffset(this.width, this.height);
    }

    // Enable physics
    this.setCollideWorldBounds(true);
  }

  public setupAnimations(): void {
    // This will be overridden by child classes
  }

  public handleMovement(): void {
    // This will be overridden by child classes
  }
}
