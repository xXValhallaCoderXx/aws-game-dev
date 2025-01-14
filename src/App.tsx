/* eslint-disable @typescript-eslint/no-explicit-any */

import { PhaserGame } from "@components/organisms/PhaserGame";
import { useRef, useState, useEffect } from "react";
import Dialogue from "@components/molecules/Dialogue";
import PopoverDialogue from "./shared/components/molecules/PopoverDialogue";
import useKeyEventManager from "./shared/hooks/useKeyEventManager";
import { InventoryToolbar } from "./shared/components/organisms/InventoryToolbar";
import { GameManagerWindow } from "./shared/components/organisms/GameManagerWindow";
import { StoreInventoryWindow } from "./shared/components/organisms/StoreInventory";
import { AvatarDropdown } from "./shared/components/organisms/AvatarDropdown";

import type { Schema } from '../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'

const client = generateClient<Schema>()

const App = () => {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<any>();
  const [todos, setTodos] = useState<Schema["Todo"]["type"][]>([]);
  useKeyEventManager();

  const fetchTodos = async () => {
    const { data: items, errors } = await client.models.Todo.list();
    setTodos(items);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const currentScene = (scene: any) => {
    console.log("Current Scene: ", scene.scene.key);
  };

  const createTodo = async () => {
    await client.models.Todo.create({
      content: window.prompt("Todo content?"),
    
    })
  }

  return <div>
    <button onClick={createTodo}>Add new todo <ul>
        {todos.map(({ id, content }) => (
          <li style={{color: "red"}} key={id}>ss{content}</li>
        ))}
      </ul></button>
  </div>

  return (
    <div id="app">
      <div id="phaser-overlay" style={{ position: "relative" }}>
        <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

        {/* Top right container */}
        <div
          id="top-right-container"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            zIndex: 10,
          }}
        >
          <AvatarDropdown />
        </div>

        {/* New center container */}
        <div
          id="center-container"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <GameManagerWindow />
          <StoreInventoryWindow />
        </div>

        {/* Center bottom container */}
        <div
          id="center-bottom-container"
          style={{
            position: "absolute",
            left: "50%",
            bottom: "20px",
            transform: "translateX(-50%)",

            width: "650px",
            zIndex: 10,
          }}
        >
          <Dialogue />

          <PopoverDialogue />
          <InventoryToolbar />
        </div>
      </div>
    </div>
  );
};

export default App;
