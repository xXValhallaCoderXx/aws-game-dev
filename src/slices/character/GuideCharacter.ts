// src/sprites/GuideNPC.ts

import Phaser from "phaser";
import { PhaserEventBus } from "../../shared/services/phaser.service";

interface Dialogue {
  speaker: string;
  text: string;
}

interface DialogueBranch {
  key: string;
  dialogues: Dialogue[];
  choices?: {
    text: string;
    nextBranch: string;
  }[];
}

interface GuideNPCConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture: string;
  animations: {
    idle: string;
    walk: string;
  };
  dialogues: DialogueBranch[];
  initialBranchKey: string;
}
export class GuideCharacter extends Phaser.Physics.Arcade.Sprite {
  private dialogues: DialogueBranch[];
  private currentBranchKey: string;
  private isTalking: boolean = false;
  public scene: Phaser.Scene;

  constructor(config: GuideNPCConfig) {
    super(config.scene, config.x, config.y, config.texture);

    this.scene = config.scene;
    this.dialogues = config.dialogues;
    this.currentBranchKey = config.initialBranchKey;

    // Add the NPC to the scene
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    // Set physics properties
    this.setCollideWorldBounds(true);
    this.setDepth(10); // Ensure NPC is above other elements

    // Play idle animation
    this.play(config.animations.idle);
    // Listen for dialogue choice events
    PhaserEventBus.on("choose-dialogue", this.handleDialogueChoice, this);
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

  public initiateDialogue() {
    if (this.isTalking) return; // Prevent overlapping dialogues
    console.log(`Initiating dialogue with branch: ${this.currentBranchKey}`);
    this.isTalking = true;
    this.play("guide-idle", true);

    // Emit an event with the current dialogue branch data
    const branch = this.dialogues.find((b) => b.key === this.currentBranchKey);
    if (branch) {
      console.log(`Emitting show-dialogue for branch: ${branch.key}`);
      PhaserEventBus.emit("show-dialogue", branch);
    } else {
      console.warn(`Dialogue branch not found: ${this.currentBranchKey}`);
    }
  }
  // Method to handle dialogue responses from React
  private handleDialogueChoice(nextBranchKey: string) {
    this.currentBranchKey = nextBranchKey;
    console.log(`Initiating dialogue with branch: ${this.currentBranchKey}`);
    this.isTalking = false;
    this.play("guide-idle", true);

    // Emit event to proceed with the next dialogue branch
    const branch = this.dialogues.find((b) => b.key === this.currentBranchKey);
    if (branch) {
      console.log(`Emitting show-dialogue for branch: ${branch.key}`);
      PhaserEventBus.emit("show-dialogue", branch);
    } else {
      console.warn(`Dialogue branch not found: ${this.currentBranchKey}`);
    }
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

  public moveAlongPath(
    path: Array<{ x: number; y: number }>,
    speed: number = 100,
    onComplete?: () => void
  ) {
    if (path.length === 0) return;

    const moveToPoint = (index: number) => {
      if (index >= path.length) {
        if (onComplete) onComplete();
        return;
      }

      const point = path[index];
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        point.x,
        point.y
      );
      const duration = (distance / speed) * 1000; // Duration in ms

      this.scene.tweens.add({
        targets: this,
        x: point.x,
        y: point.y,
        duration: duration,
        ease: "Power2",
        onStart: () => {
          this.anims.play("guide-walk", true);
        },
        onComplete: () => {
          this.anims.play("guide-idle", true);
          moveToPoint(index + 1);
        },
      });
    };

    moveToPoint(0);
  }

  public standStill(duration: number, onComplete?: () => void) {
    // Make the NPC stand still for a certain duration
    this.anims.play("guide-idle", true);
    this.scene.time.delayedCall(
      duration,
      () => {
        if (onComplete) onComplete();
      },
      [],
      this
    );
  }

  // Clean up event listeners when NPC is destroyed
  public destroy(fromScene?: boolean): void {
    PhaserEventBus.off("choose-dialogue", this.handleDialogueChoice, this);
    super.destroy(fromScene);
  }
}
