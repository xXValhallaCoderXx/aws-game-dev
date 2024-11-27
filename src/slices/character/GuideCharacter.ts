// src/sprites/GuideNPC.ts

import Phaser from "phaser";

interface GuideNPCConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture: string;
  animations: {
    idle: string;
    walk: string;
  };
}

export class GuideCharacter extends Phaser.Physics.Arcade.Sprite {
  private dialogues: string[];
  private currentDialogueIndex: number = 0;
  private isTalking: boolean = false;
  private dialogueBox!: Phaser.GameObjects.Graphics;
  private dialogueText!: Phaser.GameObjects.Text;
  public scene: Phaser.Scene;

  constructor(config: GuideNPCConfig) {
    super(config.scene, config.x, config.y, config.texture);

    this.scene = config.scene;
    this.dialogues = [
      "Welcome to our village!",
      "I'm here to guide you through your journey.",
      "Let's begin by exploring the nearby areas.",
    ];

    // Add the NPC to the scene
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    // Set physics properties
    this.setCollideWorldBounds(true);
    this.setDepth(10); // Ensure NPC is above other elements

    // Play idle animation
    this.play(config.animations.idle);
  }

  public setupAnimations(animations: {
    idle: Phaser.Types.Animations.Animation;
    walk: Phaser.Types.Animations.Animation;
  }) {
    // Create animations if not already created
    Object.keys(animations).forEach((key) => {
      const anim = animations[key as keyof typeof animations];
      if (!this.scene.anims.exists(String(anim.key))) {
        this.scene.anims.create(anim);
      }
    });
  }

  public initiateDialogue(dialogues: string[] = this.dialogues) {
    if (this.isTalking) return; // Prevent overlapping dialogues

    this.dialogues = dialogues;
    this.currentDialogueIndex = 0;
    this.isTalking = true;

    // Stop current animation and play talk animation
    this.anims.play("guide-talk", true);

    // Create dialogue box and text
    this.createDialogueBox();

    // Show first dialogue
    this.showDialogue();

    // Listen for pointer (mouse/touch) to advance dialogue
    this.scene.input.once("pointerdown", this.advanceDialogue, this);
  }

  private createDialogueBox(): void {
    // Create a semi-transparent rectangle for the dialogue box
    this.dialogueBox = this.scene.add.graphics();
    this.dialogueBox.fillStyle(0x000000, 0.7);
    this.dialogueBox.fillRect(50, 450, 700, 100); // Adjust position and size as needed

    // Create dialogue text
    this.dialogueText = this.scene.add.text(60, 460, "", {
      font: "20px Arial",
      color: "#ffffff",
      wordWrap: { width: 680 },
    });
  }

  private showDialogue(): void {
    if (this.currentDialogueIndex < this.dialogues.length) {
      this.dialogueText.setText(this.dialogues[this.currentDialogueIndex]);
    } else {
      // End of dialogues
      this.endDialogue();
    }
  }

  private advanceDialogue(): void {
    this.currentDialogueIndex++;
    this.showDialogue();

    if (this.currentDialogueIndex < this.dialogues.length) {
      // Listen for the next input
      this.scene.input.once("pointerdown", this.advanceDialogue, this);
    }
  }

  private endDialogue(): void {
    // Destroy dialogue elements
    this.dialogueBox.destroy();
    this.dialogueText.destroy();

    // Play idle animation
    this.anims.play("guide-idle", true);

    this.isTalking = false;

    // Additional actions after dialogue ends (e.g., move NPC, trigger events)
    this.scene.events.emit("cutscene-end"); // Emit an event to signal end of cutscene
  }

  public moveTo(targetX: number, targetY: number, duration: number = 2000) {
    // Move the NPC to a target position over a specified duration
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: duration,
      ease: "Power2",
      onStart: () => {
        this.anims.play("guide-walk", true);
      },
      onComplete: () => {
        this.anims.play("guide-idle", true);
      },
    });
  }

  public patrol(path: Array<{ x: number; y: number }>, speed: number = 100) {
    // Make the NPC patrol along a predefined path
    if (path.length === 0) return;

    let currentPoint = 0;

    const moveToNextPoint = () => {
      if (currentPoint >= path.length) {
        currentPoint = 0; // Loop patrol
      }

      const point = path[currentPoint];
      currentPoint++;

      this.scene.physics.moveTo(this, point.x, point.y, speed);

      this.once(
        Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "guide-walk",
        moveToNextPoint
      );
    };

    moveToNextPoint();
  }
}
