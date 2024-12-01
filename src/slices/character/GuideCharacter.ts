// src/sprites/GuideNPC.ts

import Phaser from "phaser";
import { PhaserEventBus } from "@services/phaser.service";
import {
  DialogueBranch,
  BaseCharacterConfig,
} from "./player-character.interface";

interface GuideCharacterConfig extends BaseCharacterConfig {
  dialogues: DialogueBranch[];
  initialBranchKey: string;
}

export class GuideCharacter extends Phaser.Physics.Arcade.Sprite {
  private dialogues: DialogueBranch[];
  private currentBranchKey: string;
  private isTalking: boolean = false;
  private currentPath: { x: number; y: number }[] = [];
  private currentPathIndex: number = 0;
  private moveSpeed: number = 100;

  constructor(config: GuideCharacterConfig) {
    const { scene, x, y, texture } = config;
    super(scene, x, y, texture);
    this.dialogues = config.dialogues;
    this.currentBranchKey = config.initialBranchKey;

    // Set up animations right after construction
    this.setupAnimations();

    // Start with idle animation
    this.play("guide-idle-down", true);

    // Listen for dialogue choice events
    PhaserEventBus.on("choose-dialogue", this.handleDialogueChoice, this);
  }

  protected getDefaultAnimations(): Record<string, string> {
    return {
      walkUp: "guide-walk-up",
      walkDown: "guide-walk-down",
      walkLeft: "guide-walk-left",
      walkRight: "guide-walk-right",
      idleUp: "guide-idle-up",
      idleDown: "guide-idle-down",
      idleLeft: "guide-idle-left",
      idleRight: "guide-idle-right",
    };
  }

  protected setupAnimations(): void {
    const directions = ["up", "down", "left", "right"];

    directions.forEach((direction, directionIndex) => {
      // Walk animations
      const walkKey = `guide-walk-${direction}`;
      if (!this.scene.anims.exists(walkKey)) {
        this.scene.anims.create({
          key: walkKey,
          frames: this.scene.anims.generateFrameNumbers("guide-walk", {
            start: directionIndex * 6,
            end: directionIndex * 6 + 5,
          }),
          frameRate: 10,
          repeat: -1,
        });
      }

      // Idle animations
      const idleKey = `guide-idle-${direction}`;
      if (!this.scene.anims.exists(idleKey)) {
        this.scene.anims.create({
          key: idleKey,
          frames: this.scene.anims.generateFrameNumbers("guide-idle", {
            start: directionIndex * 6,
            end: directionIndex * 6 + 5,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    // Start with idle down animation
    this.play("guide-idle-down");
  }

  public initiateDialogue() {
    if (this.isTalking) return; // Prevent overlapping dialogues
    console.log(`Initiating dialogue with branch: ${this.currentBranchKey}`);
    this.isTalking = true;
    this.play("guide-idle-down", true);

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
