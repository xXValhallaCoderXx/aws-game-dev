import {
  CharacterConfig,
  AnimationKeys,
  TextureConfig,
  CharacterFaceDirection,
} from "./player-character.interface";

// Abstract prevents direct instantiation, ensuring that only subclasses implement specific behaviors.
export abstract class BaseCharacter extends Phaser.Physics.Arcade.Sprite {
  protected speed: number;
  protected cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  public animations: AnimationKeys;
  protected textureConfig: TextureConfig;
  public facingDirection: CharacterFaceDirection = "down";

  constructor(config: CharacterConfig) {
    super(config.scene, config.x, config.y, config.texture.key);

    this.speed = config.speed;
    this.animations = config.animations;
    this.textureConfig = config.texture;

    // Add sprite to scene and enable physics
    config.scene.add.existing(this);
    config.scene.physics.add.existing(this);

    // **Set the origin to the center**
    this.setOrigin(0.5, 0.5);

    if (this.body) {
      // **Adjust the physics body to match the sprite**
      this.body.setSize(16, 16);
      this.body.setOffset(0, 0); // Adjust as necessary
    }

    // Enable physics
    this.setCollideWorldBounds(true);
  }

  // Abstract methods to enforce implementation in subclasses
  public abstract setupAnimations(): void;
  public abstract handleMovement(): void;

  // Utility method to capitalize direction
  protected capitalize(str: CharacterFaceDirection): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
