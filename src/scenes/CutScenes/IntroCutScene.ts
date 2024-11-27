import { BaseScene } from "../BaseScene";
import { ESCENE_KEYS } from "../../shared/scene-keys";

export class IntroCutScene extends BaseScene {
  private npc!: Phaser.GameObjects.Sprite;
  private dialogueBox!: Phaser.GameObjects.Graphics;
  private dialogueText!: Phaser.GameObjects.Text;
  private dialogues: string[] = [
    "Welcome to our village!",
    "I'm here to guide you through your journey.",
    "Let's get started by exploring your surroundings.",
  ];
  private currentDialogueIndex: number = 0;

  constructor() {
    super(ESCENE_KEYS.INTRO_CUTSCENE);
  }

  init() {
    super.init();
    console.log("INTRO CUTSCENE");
  }

  preload() {
    super.preload();
    this.load.image("intro", "images/intro.png");
  }

  create() {
    super.create();
    this.add.image(0, 0, "intro").setOrigin(0, 0);
    this.input.on("pointerdown", () => {
      this.scene.start(ESCENE_KEYS.HOME_HOUSE);
    });
  }

  protected createMap(): void {}
}
