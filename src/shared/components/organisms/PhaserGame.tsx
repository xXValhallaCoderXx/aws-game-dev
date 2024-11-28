/* eslint-disable @typescript-eslint/no-explicit-any */
import Phaser, { Scene } from "phaser";
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

    // Handle any custom event bus listeners if necessary
    useEffect(() => {
      const handleSceneReady = (currentScene: Scene) => {
        if (currentActiveScene) {
          currentActiveScene(currentScene);
        }
      };

      PhaserEventBus.on("current-scene-ready", handleSceneReady);

      return () => {
        PhaserEventBus.off("current-scene-ready", handleSceneReady);
      };
    }, [currentActiveScene]);

    // Listen for events from React to handle dialogue choices
    useEffect(() => {
      const chooseDialogue = (nextBranch: string) => {
        // Find the active scene and handle the dialogue choice
        const activeScene = game.current?.scene.keys[0];
        if (activeScene) {
          const phaserScene = game.current?.scene.getScene(activeScene) as any;
          if (phaserScene?.guideNPC) {
            phaserScene.guideNPC.handleDialogueChoice(nextBranch);
          }
        }
      };

      PhaserEventBus.on("choose-dialogue", chooseDialogue);

      return () => {
        PhaserEventBus.off("choose-dialogue", chooseDialogue);
      };
    }, []);

    return <div id="game-container"></div>;
  }
);
