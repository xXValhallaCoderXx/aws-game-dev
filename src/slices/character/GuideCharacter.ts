// src/sprites/GuideNPC.ts

import Phaser from "phaser";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import {
  DialogueBranch,
  BaseCharacterConfig,
} from "./player-character.interface";
import { BaseCharacter } from "./BaseChracter";

interface GuideCharacterConfig extends BaseCharacterConfig {
  dialogues: DialogueBranch[];
  initialBranchKey: string;
}

export class GuideCharacter extends BaseCharacter {
  private dialogues: DialogueBranch[];
  private currentBranchKey: string;
  private isTalking: boolean = false;
  private currentPath: { x: number; y: number }[] = [];
  private currentPathIndex: number = 0;
  private moveSpeed: number = 100;

  constructor(config: GuideCharacterConfig) {
    super(config);
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

  public moveAlongPath(
    path: { x: number; y: number }[],
    speed?: number,
    onComplete?: () => void
  ): void {
    this.currentPath = path;
    this.currentPathIndex = 0;
    if (speed) this.moveSpeed = speed;

    // Clear any existing worldstep listeners
    this.scene.physics.world.off("worldstep");

    this.moveToNextPoint(onComplete);
  }

  private moveToNextPoint(onComplete?: () => void): void {
    if (this.currentPathIndex >= this.currentPath.length) {
      // Path complete
      this.setVelocity(0);
      this.play(`guide-idle-${this.facingDirection}`, true);

      // Clear the worldstep listener
      this.scene.physics.world.off("worldstep");

      if (onComplete) {
        onComplete();
      }
      return;
    }

    const target = this.currentPath[this.currentPathIndex];
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);

    // Set facing direction based on angle
    if (Math.abs(angle) < Math.PI / 4) {
      this.facingDirection = "right";
    } else if (Math.abs(angle) > (3 * Math.PI) / 4) {
      this.facingDirection = "left";
    } else if (angle > 0) {
      this.facingDirection = "down";
    } else {
      this.facingDirection = "up";
    }

    // Play walking animation
    this.play(`guide-walk-${this.facingDirection}`, true);

    // Move to target
    this.scene.physics.moveTo(this, target.x, target.y, this.moveSpeed);

    // Create a single worldstep listener
    const checkDistance = () => {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        target.x,
        target.y
      );

      if (distance < 4) {
        this.setVelocity(0);
        this.currentPathIndex++;
        // Remove this listener before moving to next point
        this.scene.physics.world.off("worldstep", checkDistance);
        this.moveToNextPoint(onComplete);
      }
    };

    this.scene.physics.world.on("worldstep", checkDistance);
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
