/* eslint-disable @typescript-eslint/no-explicit-any */
// src/game/objects/InteractionZone.ts
import { PhaserEventBus } from "@/shared/services/phaser-event.service";

function isCollisionEnabled(data: any) {
  // Loop through the keys of the object
  for (const key in data) {
    // Check if the object has the "name" property as "collision"
    if (data[key].name === "collision") {
      // Return the value of "value" property
      return data[key].value;
    }
  }
  // Return false if "collision" is not found
  return false;
}

function getObjectProperty({ data, id }: any) {
  // Loop through the keys of the object
  for (const key in data) {
    // Check if the object has the "name" property as "collision"
    if (data[key].name === id) {
      // Return the value of "value" property
      return data[key].value;
    }
  }
  // Return false if "collision" is not found
  return false;
}

import { Input } from "phaser";
const { JustDown } = Input.Keyboard;

export class InteractionZone extends Phaser.GameObjects.Zone {
  private isInteractable: boolean = true;
  private objectType: string;
  private properties: Record<string, any>;
  private indicator?: Phaser.GameObjects.Sprite;
  private player: any;
  private isPlayerInRange: boolean = false;
  private interactKey?: Phaser.Input.Keyboard.Key;
  private interactionRadius: Phaser.GameObjects.Zone;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    properties: any,
    player: any
  ) {
    super(scene, x, y, width, height);
    this.player = player;
    this.objectType = getObjectProperty({
      data: properties,
      id: "id",
    });
    this.properties = properties;

    // Enable physics for interaction
    scene.physics.add.existing(this, true);

    // Create a larger interaction radius
    const interactionWidth = width + 32; // Extend by 32 pixels on each side
    const interactionHeight = height + 32; // Extend by 32 pixels on each side
    this.interactionRadius = scene.add.zone(
      x,
      y,
      interactionWidth,
      interactionHeight
    );

    scene.physics.add.existing(this.interactionRadius, true);
    const interactionBody = this.interactionRadius
      .body as Phaser.Physics.Arcade.Body;
    if (interactionBody) {
      interactionBody.setSize(interactionWidth, interactionHeight);
      // Make sure it doesn't move when player touches it
      interactionBody.moves = false;
    }

    const isCollisonEnabled = isCollisionEnabled(properties);
    if (isCollisonEnabled) {
      // Explicitly cast the body to Arcade Physics body
      const body = this.body as Phaser.Physics.Arcade.StaticBody;
      if (body) {
        body.immovable = true;
        body.setSize(width, height);
        scene.physics.add.collider(this.player, this);
      }
    }

    // Setup interaction handling
    this.setupInteraction();

    // if (process.env.NODE_ENV === "development") {
    //   this.createDebugGraphics(interactionWidth, interactionHeight);
    //   console.log("Created interaction zone:", {
    //     type: this.objectType,
    //     properties: this.properties,
    //   });
    // }
  }

  private setupInteraction() {
    if (!this.scene.input.keyboard) return;
    // Create the interaction key and ensure it doesn't get consumed by other handlers
    this.interactKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );

    // Listen for player overlap
    this.scene.physics.add.overlap(
      this.player,
      this.interactionRadius,
      this.handlePlayerOverlap.bind(this)
    );

    // Add update callback to scene
    this.scene.events.on("update", this.update, this);
  }

  private handlePlayerOverlap() {
    if (!this.isInteractable) return;

    // Set player in range when overlap occurs
    this.isPlayerInRange = true;

    // if (process.env.NODE_ENV === "development") {
    //   console.log(
    //     "Player overlapping with:",
    //     this.objectType,
    //     "isPlayerInRange:",
    //     this.isPlayerInRange
    //   );
    // }
  }

  update() {
    // Handle overlap checking in update
    const isOverlapping = this.scene.physics.overlap(
      this.player,
      this.interactionRadius
    );

    // Debug logs
    // if (process.env.NODE_ENV === "development") {
    //   console.log("Player position:", {
    //     x: this.player.x,
    //     y: this.player.y,
    //     hasBody: !!this.player.body,
    //   });
    //   console.log("Interaction zone position:", {
    //     x: this.interactionRadius.x,
    //     y: this.interactionRadius.y,
    //     width: this.interactionRadius.width,
    //     height: this.interactionRadius.height,
    //     hasBody: !!this.interactionRadius.body,
    //   });
    //   console.log("IS OVERLAPPING: ", isOverlapping);
    // }

    // Update player in range status and handle zone transitions
    if (!isOverlapping && this.isPlayerInRange) {
      console.log("Player left interaction zone");
      this.isPlayerInRange = false;
    } else if (isOverlapping && !this.isPlayerInRange) {
      console.log("Player entered interaction zone");
      this.isPlayerInRange = true;
    }

    // Check for interaction only if player is in range
    if (
      this.isPlayerInRange &&
      this.isInteractable &&
      this.interactKey &&
      JustDown(this.interactKey)
    ) {
      console.log("Interaction triggered for:", this.objectType);
      this.interact();
      // Prevent multiple interactions by temporarily disabling
      this.isInteractable = false;
      this.scene.time.delayedCall(500, () => {
        this.isInteractable = true;
      });
    }
  }

  private interact() {
    if (!this.isInteractable) return;

    switch (this.objectType) {
      case "magic-well":
      case "ancient-well":
      case "sign":
        this.handleSignInteraction();
        break;
      case "door":
        this.handleDoorInteraction();
        break;
      // Add more types as needed
      default:
        console.log("No handler for object type:", this.objectType);
    }
  }

  private handleSignInteraction() {
    const message = getObjectProperty({
      data: this.properties,
      id: "message",
    });
    if (message) {
      console.log("Showing dialogue:", message);
      PhaserEventBus.emit("display-popover", {
        text: message,
      });
    }
  }

  private handleDoorInteraction() {
    if (this.properties.targetMap) {
      console.log("Changing map to:", this.properties.targetMap);
      PhaserEventBus.emit("change-map", {
        map: this.properties.targetMap,
        spawnPoint: this.properties.spawnPoint,
      });
    }
  }

  private createDebugGraphics(
    interactionWidth: number,
    interactionHeight: number
  ) {
    // Visualize the collision box
    const collisionGraphics = this.scene.add.graphics();
    collisionGraphics.lineStyle(2, 0xff0000); // Red for collision
    collisionGraphics.strokeRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    // Visualize the interaction radius
    const interactionGraphics = this.scene.add.graphics();
    interactionGraphics.lineStyle(2, 0x00ff00); // Green for interaction
    interactionGraphics.strokeRect(
      this.x - interactionWidth / 2,
      this.y - interactionHeight / 2,
      interactionWidth,
      interactionHeight
    );

    // Add coordinates text for debugging
    this.scene.add.text(
      this.x,
      this.y - 40,
      `(${Math.floor(this.x)}, ${Math.floor(this.y)})`,
      { color: "#00ff00", fontSize: "12px" }
    );
  }

  destroy() {
    // Clean up event listeners
    this.scene.events.off("update", this.update, this);
    if (this.indicator) {
      this.indicator.destroy();
    }
    this.interactionRadius.destroy();
    super.destroy();
  }
}
