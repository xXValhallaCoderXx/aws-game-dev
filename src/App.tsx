/* eslint-disable @typescript-eslint/no-explicit-any */

import { PhaserGame } from "./shared/components/organisms/PhaserGame";
import { useRef } from "react";

const App = () => {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<any>();

  // Event emitted from the PhaserGame component
  const currentScene = (scene: any) => {
    // setCanMoveSprite(scene.scene.key !== "MainMenu");
    console.log("Current Scene: ", scene.scene.key);
  };

  return (
    <div id="app">
      <div id="phaser-overlay" style={{ position: "relative" }}>
        <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
      </div>
    </div>
  );
};

export default App;
