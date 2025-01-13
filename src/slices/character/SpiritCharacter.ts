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
import { Inventory } from "../inventory/inventory.service";
import { INVENTORY_EVENTS } from "../events/phaser-events.types";

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
  private isDebugEnabled: boolean = false;

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
    if (this.isDebugEnabled) {
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
    console.log(
      "SPIRIT CHARACTER - INITIATE DIALOGUE - QUEST ACCEPTED?? ",
      this.questAccepted
    );
    if (this.questAccepted) {
      this.checkQuestCompletion();
      return;
    }

    const dialogueBranch: DialogueBranch = {
      key: "spirit-initial",
      dialogues: [
        {
          speaker: "Spirit",
          text: `Ohh, hello! You...You see me?. I don't know how I got here, but I need help.`,
        },
        {
          speaker: "Spirit",
          text: `I feel so scared,  Could you help me gather them ${this.questAmount} ${this.questItem}(s), I miss those.`,
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
    console.log("SPRITI CHARACTER - HANDLE DIALOGUE CHOICE: ", nextBranchKey);
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
        PhaserEventBus.emit("check-inventory", () => {
          this.checkQuestCompletion();
        });
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
    console.log(
      "SPIRIT CHARACTER - HANDLE QUEST ACCEPTED: ",
      this.questAccepted
    );
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
    // this.fadeAway();
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
    // this.fadeAway();
  }

  public checkQuestCompletion() {
    const inventoryInstance = Inventory.getInstance();
    console.log("CHECK QUEST COMPLETION - ACCEPTED?: ", this.questAccepted);
    console.log("CHECK QUEST COMPLETION: - QUEST ITEM  ", this.questItem);
    const questItem = inventoryInstance.getItem(
      this.questItem as GAME_ITEM_KEYS
    );
    console.log("CHECK QUEST COMPLETION: - INVENTORY ITEM  ", questItem);
    const itemQuantity = questItem?.quantity || 0;

    if (itemQuantity >= this.questAmount) {
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
    const inventoryInstance = Inventory.getInstance();
    inventoryInstance.removeItem({
      id: this.questItem,
      quantity: this.questAmount,
    });

    // Give rewards
    if (this.rewards.gold) {
      inventoryInstance.addGold(this.rewards.gold);
    }

    if (this.rewards.items) {
      this.rewards.items.forEach(({ item, amount }) => {
        inventoryInstance.addItem({
          id: item,
          quantity: amount,
        });
      });
    }

    const items = inventoryInstance.getAllItems();
    const gold = inventoryInstance.getGold();

    PhaserEventBus.emit(INVENTORY_EVENTS.GET_ALL_ITEMS, items);
    PhaserEventBus.emit(INVENTORY_EVENTS.GET_GOLD, gold);

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
    this.destroy();
  }

  public destroy(fromScene?: boolean): void {
    PhaserEventBus.off("choose-dialogue", this.dialogueListener);
    super.destroy(fromScene);
  }
}
