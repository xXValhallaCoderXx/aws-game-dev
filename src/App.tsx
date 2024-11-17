/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useSelector, useDispatch } from "react-redux";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import "./App.css";
// import { RootState } from "./shared/services/redux-store.service";
// import { decrement, increment } from "./slices/game/game.slice";

import Phaser from "phaser";
import { PhaserGame } from "./PhaserGame";
import { useRef, useState } from "react";

function App() {
  // const count = useSelector((state: RootState) => state.counter.value);
  // const dispatch = useDispatch();

  const [canMoveSprite, setCanMoveSprite] = useState(true);

  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<any>();
  const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

  const moveSprite = () => {
    const scene = phaserRef.current.scene;

    if (scene && scene.scene.key === "MainMenu") {
      // Get the update logo position
      scene.moveLogo(({ x, y }: any) => {
        setSpritePosition({ x, y });
      });
    }
  };

  const addSprite = () => {
    const scene = phaserRef.current.scene;

    if (scene) {
      // Add more stars
      const x = Phaser.Math.Between(64, scene.scale.width - 64);
      const y = Phaser.Math.Between(64, scene.scale.height - 64);

      //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
      const star = scene.add.sprite(x, y, "star");

      //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
      //  You could, of course, do this from within the Phaser Scene code, but this is just an example
      //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
      scene.add.tween({
        targets: star,
        duration: 500 + Math.random() * 1000,
        alpha: 0,
        yoyo: true,
        repeat: -1,
      });
    }
  };

  // Event emitted from the PhaserGame component
  const currentScene = (scene: any) => {
    setCanMoveSprite(scene.scene.key !== "MainMenu");
  };

  const changeScene = () => {
    const scene = phaserRef.current.scene;

    if (scene) {
      scene.changeScene();
    }
  };

  return (
    <div id="app">
      <div id="phaser-overlay" style={{ position: "relative" }}>
        <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
        {/* <button
          onClick={changeScene}
          style={{ position: "absolute", top: 0, right: 0 }}
        >
          Change Scene
        </button> */}
      </div>
      {/* <div>
        <div>
          <button
            disabled={canMoveSprite}
            className="button"
            onClick={moveSprite}
          >
            Toggle Movement
          </button>
        </div>
        <div className="spritePosition">
          Sprite Position:
          <pre>{`{\n  x: ${spritePosition.x}\n  y: ${spritePosition.y}\n}`}</pre>
        </div>
        <div>
          <button className="button" onClick={addSprite}>
            Add New Sprite
          </button>
        </div>
      </div> */}
    </div>
  );
}

export default App;
