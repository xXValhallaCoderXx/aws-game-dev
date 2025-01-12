/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseCharacter } from "./BaseChracter";
import type {
  BaseCharacterConfig,
  DialogueBranch,
} from "./character.interface";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import { GAME_ITEM_KEYS } from "../items/items.interface";
import { IActionType, IAnimationConfig } from "./character.interface";
import { SPRITE_SHEETS } from "@/shared/constants/sprite-sheet-names";
import { KEY_BINDINGS } from "@/shared/constants/key-bindings";

interface SpiritCharacterConfig extends BaseCharacterConfig {
  questItem: GAME_ITEM_KEYS;
  questAmount: number;
  rewards: {
    gold?: number;
    items?: { item: GAME_ITEM_KEYS; amount: number }[];
  };
}

export class SpiritCharacter extends BaseCharacter {
  private questItem: GAME_ITEM_KEYS;
  private questAmount: number;
  private rewards: SpiritCharacterConfig["rewards"];
  private dialogueListener: (branchKey: string) => void;

  private interactionRadius: number = 100;
  private playerRef: Phaser.GameObjects.GameObject | null = null;

  private keyboardListeners: Phaser.Input.Keyboard.Key[] = [];

  constructor(config: SpiritCharacterConfig) {
    super({
      ...config,
      characterType: config.characterType,
    });

    this.questItem = config.questItem;
    this.questAmount = config.questAmount;
    this.rewards = config.rewards;

    // Bind the dialogue choice handler
    this.setupListeners();
    this.dialogueListener = this.handleDialogueChoice.bind(this);
    PhaserEventBus.on("choose-dialogue", this.dialogueListener);

    // Create interaction circle for debug visualization
    if (process.env.NODE_ENV === "development") {
      const circle = this.scene.add.circle(
        this.x,
        this.y,
        this.interactionRadius,
        0x00ff00,
        0.2
      );
      this.scene.events.on("update", () => {
        circle.setPosition(this.x, this.y);
      });
    }
  }

  protected override getAnimationConfigs(): Record<
    IActionType,
    IAnimationConfig
  > {
    const baseConfigs = super.getAnimationConfigs();
    return {
      ...baseConfigs,
      walk: {
        type: "sequential",
        framesPerDirection: 4,
        frameRate: 10,
        repeat: -1,
        spritesheet: SPRITE_SHEETS.SpiritNormal,
        frameStart: (dirIndex: number) => dirIndex * 6,
        frameEnd: (dirIndex: number) => dirIndex * 6 + 5,
      },
      idle: {
        type: "sequential",
        framesPerDirection: 4,
        frameRate: 5,
        repeat: -1,
        spritesheet: SPRITE_SHEETS.SpiritNormal,
        frameStart: (dirIndex: number) => dirIndex * 6,
        frameEnd: (dirIndex: number) => dirIndex * 6 + 5,
      },
    };
  }

  public setPlayer(player: Phaser.GameObjects.GameObject) {
    this.playerRef = player;
  }

  private isPlayerInRange(): boolean {
    if (!this.playerRef) return false;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      (this.playerRef as any).x,
      (this.playerRef as any).y
    );

    return distance <= this.interactionRadius;
  }

  private setupListeners(): void {
    // Add interaction key listener
    if (this.scene.input.keyboard) {
      this.keyboardListeners.push(
        this.scene.input.keyboard
          .addKey(KEY_BINDINGS.INTERACT)
          .on("down", () => {
            if (this.isPlayerInRange()) {
              this.initiateDialogue();
            }
          })
      );
    }
  }

  private questAccepted = false;

  private initiateDialogue() {
    if (this.questAccepted) {
      this.checkQuestCompletion();
      return;
    }

    const dialogueBranch: DialogueBranch = {
      key: "spirit-initial",
      dialogues: [
        {
          speaker: "Spirit",
          text: `Greetings, traveler. I seek ${this.questAmount} ${this.questItem}. Will you help me?`,
        },
      ],
      choices: [
        {
          text: "Yes, I'll help",
          nextBranch: "accept-quest",
        },
        {
          text: "Not now",
          nextBranch: "reject-quest",
        },
      ],
    };

    PhaserEventBus.emit("show-dialogue", dialogueBranch);
  }

  private handleDialogueChoice(nextBranchKey: string) {
    switch (nextBranchKey) {
      case "accept-quest":
        this.handleQuestAccepted();
        break;
      case "reject-quest":
        this.handleQuestRejected();
        break;
      case "complete-quest":
        this.completeQuest();
        break;
      case "check-inventory":
        console.log("CHECKING INVETORY: ", this.playerRef);
        PhaserEventBus.emit(
          "check-inventory",
          (inventory: Record<string, number>) => {
            this.checkQuestCompletion(inventory);
          }
        );
        break;
      case "delay-completion":
        PhaserEventBus.emit("show-dialogue", {
          key: "delay-completion",
          dialogues: [
            {
              speaker: "Spirit",
              text: "I will await your return.",
            },
          ],
        });
        break;
    }
  }

  private handleQuestAccepted() {
    this.questAccepted = true;
    const dialogueBranch: DialogueBranch = {
      key: "quest-accepted",
      dialogues: [
        {
          speaker: "Spirit",
          text: "Thank you. Return to me when you have what I seek.",
        },
      ],
    };
    PhaserEventBus.emit("show-dialogue", dialogueBranch);
  }

  private handleQuestRejected() {
    const dialogueBranch: DialogueBranch = {
      key: "quest-rejected",
      dialogues: [
        {
          speaker: "Spirit",
          text: "Perhaps another time then...",
        },
      ],
    };
    PhaserEventBus.emit("show-dialogue", dialogueBranch);
    this.fadeAway();
  }

  public checkQuestCompletion(inventory?: Record<string, number>) {
    console.log("CHECK COMPLETEION: ", inventory);
    if (!inventory) {
      const dialogueBranch: DialogueBranch = {
        key: "quest-progress",
        dialogues: [
          {
            speaker: "Spirit",
            text: `Have you gathered the ${this.questAmount} ${this.questItem} I requested?`,
          },
        ],
        choices: [
          {
            text: "Let me check",
            nextBranch: "check-inventory",
          },
          {
            text: "Not yet",
            nextBranch: "delay-completion",
          },
        ],
      };
      PhaserEventBus.emit("show-dialogue", dialogueBranch);
      return;
    }
    if (inventory[this.questItem] >= this.questAmount) {
      const dialogueBranch: DialogueBranch = {
        key: "can-complete",
        dialogues: [
          {
            speaker: "Spirit",
            text: `You have what I seek. Would you like to complete our arrangement?`,
          },
        ],
        choices: [
          {
            text: "Yes, here you go",
            nextBranch: "complete-quest",
          },
          {
            text: "Not yet",
            nextBranch: "delay-completion",
          },
        ],
      };
      PhaserEventBus.emit("show-dialogue", dialogueBranch);
    } else {
      const dialogueBranch: DialogueBranch = {
        key: "incomplete",
        dialogues: [
          {
            speaker: "Spirit",
            text: `Return when you have ${this.questAmount} ${this.questItem}.`,
          },
        ],
      };
      PhaserEventBus.emit("show-dialogue", dialogueBranch);
    }
  }

  private completeQuest() {
    // Emit event to remove items from inventory
    PhaserEventBus.emit("inventory-remove", {
      item: this.questItem,
      amount: this.questAmount,
    });

    // Give rewards
    if (this.rewards.gold) {
      PhaserEventBus.emit("add-gold", this.rewards.gold);
    }

    if (this.rewards.items) {
      this.rewards.items.forEach(({ item, amount }) => {
        PhaserEventBus.emit("inventory-add", {
          item,
          amount,
        });
      });
    }

    const dialogueBranch: DialogueBranch = {
      key: "quest-complete",
      dialogues: [
        {
          speaker: "Spirit",
          text: "Thank you for your help. Please accept this reward.",
        },
      ],
    };
    PhaserEventBus.emit("show-dialogue", dialogueBranch);

    this.fadeAway();
  }

  private fadeAway() {
    this.play("spirit-fade");
    this.once("animationcomplete", () => {
      this.destroy();
    });
  }

  public destroy(fromScene?: boolean): void {
    PhaserEventBus.off("choose-dialogue", this.dialogueListener);
    super.destroy(fromScene);
  }
}
