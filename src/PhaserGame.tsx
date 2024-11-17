/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import StartGame from "./PhaserRoot";
import { EventBus } from "./game/EventBus";

interface PhaserGameProps {
  currentActiveScene?: (scene: any) => void; // Adjust type `any` to match the actual type of the scene
}

export interface PhaserGameRef {
  game: any; // Replace `any` with the specific type returned by `StartGame` if possible
  scene: any; // Replace `any` with the actual type of the scene
}

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

      EventBus.on("current-scene-ready", handleSceneReady);

      return () => {
        EventBus.removeListener("current-scene-ready", handleSceneReady);
      };
    }, [currentActiveScene, ref]);

    return <div id="game-container"></div>;
  }
);
