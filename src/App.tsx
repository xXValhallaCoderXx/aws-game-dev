/* eslint-disable @typescript-eslint/no-explicit-any */

import { PhaserGame } from "./shared/components/organisms/PhaserGame";
import { useRef, useState } from "react";

const App = () => {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<any>();
  const [isMuted, setIsMuted] = useState(false);

  // Event emitted from the PhaserGame component
  const currentScene = (scene: any) => {
    // setCanMoveSprite(scene.scene.key !== "MainMenu");
    console.log("Current Scene: ", scene.scene.key);
  };

  // Handler for the toggle button
  const handleToggleMute = () => {
    if (phaserRef.current) {
      phaserRef.current.game.sound.mute = !phaserRef.current.game.sound.mute;
      setIsMuted(() => !phaserRef.current.game.sound.mute);
    }
  };

  return (
    <div id="app">
      <div id="phaser-overlay" style={{ position: "relative" }}>
        <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
        <div style={{ position: "absolute", right: 10, top: 0 }}>
          <button onClick={handleToggleMute}>
            {isMuted ? "Unmute Sound" : "Mute Sound"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
