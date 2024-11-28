/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { phaserConfig, PhaserEventBus } from "../../services/phaser.service";

interface PhaserGameProps {
  currentActiveScene?: (scene: any) => void; // Adjust type `any` to match the actual type of the scene
}

export interface PhaserGameRef {
  game: any; // Replace `any` with the specific type returned by `StartGame` if possible
  scene: any; // Replace `any` with the actual type of the scene
}

const StartGame = (parent: any) => {
  return new Phaser.Game({ ...phaserConfig, parent });
};

export const PhaserGame = forwardRef<PhaserGameRef, PhaserGameProps>(
  ({ currentActiveScene }, ref) => {
    const game = useRef<any | undefined>(undefined); // Replace `any` with the specific type returned by `StartGame`

    // Create the game inside a useLayoutEffect hook to avoid the game being created outside the DOM
    useLayoutEffect(() => {
      if (!game.current) {
        game.current = StartGame("game-container");

        if (ref && typeof ref === "object" && "current" in ref) {
          ref.current = { game: game.current, scene: null };
        }
      }

      return () => {
        if (game.current) {
          game.current.destroy(true);
          game.current = undefined;
        }
      };
    }, [ref]);

    useEffect(() => {
      const handleSceneReady = (currentScene: any) => {
        // Replace `any` with the actual type of the scene
        if (currentActiveScene) {
          currentActiveScene(currentScene);
        }
        if (ref && typeof ref === "object" && "current" in ref) {
          ref.current!.scene = currentScene;
        }
      };

      PhaserEventBus.on("current-scene-ready", handleSceneReady);

      return () => {
        PhaserEventBus.removeListener("current-scene-ready", handleSceneReady);
      };
    }, [currentActiveScene, ref]);

    // Listen for events from React to advance dialogue or choose branches
    useEffect(() => {
      const advanceDialogue = () => {
        // Find the active scene and advance the dialogue
        const activeScene = game.current?.scene.keys[0];
        if (activeScene) {
          const phaserScene = game.current?.scene.getScene(activeScene) as any;
          if (phaserScene?.guideNPC?.dialogueManager) {
            // Implement a method in DialogueManager to handle advancing dialogue
            // Alternatively, manage via events
          }
        }
      };

      const chooseDialogue = (nextBranch: string) => {
        // Handle choosing a dialogue branch
        const activeScene = game.current?.scene.keys[0];
        if (activeScene) {
          const phaserScene = game.current?.scene.getScene(activeScene) as any;
          if (phaserScene?.guideNPC) {
            phaserScene.guideNPC.handleDialogueChoice(nextBranch);
          }
        }
      };

      const showDiag = (_x: any) => {
        console.log("LALALA: ", _x);
      };

      PhaserEventBus.on("advance-dialogue", advanceDialogue);
      PhaserEventBus.on("choose-dialogue", chooseDialogue);
      PhaserEventBus.on("show-dialogue", showDiag);

      return () => {
        PhaserEventBus.off("advance-dialogue", advanceDialogue);
        PhaserEventBus.off("choose-dialogue", chooseDialogue);
        PhaserEventBus.off("show-dialogue", showDiag);
      };
    }, []);

    return <div id="game-container"></div>;
  }
);
