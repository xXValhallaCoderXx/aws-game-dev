// CharacterClass.ts
export interface AnimationKeys {
  walkUp: string;
  walkDown: string;
  walkLeft: string;
  walkRight: string;
  idleUp: string;
  idleDown: string;
  idleLeft: string;
  idleRight: string;
  harvestUp: string;
  harvestDown: string;
  harvestLeft: string;
  harvestRight: string;
}

export interface CharacterConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture: {
    key: string;
    walkSheet: string;
    idleSheet: string;
    harvestSheet: string;
  };
  animations: AnimationKeys;
  speed: number;
}

export class Character extends Phaser.Physics.Arcade.Sprite {
  protected speed: number;
  protected cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  public animations: AnimationKeys;
  protected textureConfig: CharacterConfig["texture"]; // Add this line
  public facingDirection: "up" | "down" | "left" | "right" = "down";

  constructor(config: CharacterConfig) {
    // Call the parent class constructor with texture key and initial position
    super(config.scene, config.x, config.y, config.texture.key);

    this.speed = config.speed;
    this.animations = config.animations;
    this.textureConfig = config.texture; // Store the texture config

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
