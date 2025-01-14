/* eslint-disable @typescript-eslint/no-explicit-any */

import { PhaserGame } from "@components/organisms/PhaserGame";
import { useRef,  useEffect, useState } from "react";
import Dialogue from "@components/molecules/Dialogue";
import PopoverDialogue from "../shared/components/molecules/PopoverDialogue";
import { InventoryToolbar } from "../shared/components/organisms/InventoryToolbar";
import { GameManagerWindow } from "../shared/components/organisms/GameManagerWindow";
import { StoreInventoryWindow } from "../shared/components/organisms/StoreInventory";
import { AvatarDropdown } from "../shared/components/organisms/AvatarDropdown";
import { PLAYER_EVENTS } from "@/slices/events/phaser-events.types";
import useKeyEventManager from "../shared/hooks/useKeyEventManager";
import type { Schema } from '../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'
import { PhaserEventBus } from "@/shared/services/phaser-event.service";


const client = generateClient<Schema>()

const GamePage = ({ signOut, user }: any) => {

    useKeyEventManager();
  const phaserRef = useRef<any>();
  const [isLoading, setIsLoading] = useState(true);



const fetchPlayer = async () => {
  const { data } = await client.models.Player.get({id: user?.userId});
    console.log("DAAATAAA: ", data)
    if(!data){
       
        // Create Initial Account
        const {data: player} = await client.models.Player.create({
            id: user?.userId,
            userId: user?.userId,
            gold: 101,
            stats: {
                strength: 1,
                defense: 1,
                health: 110,
                maxHealth: 110,
                level: 1,
            }    
        });
        console.log("CREATE NEW USER: ", player)
    } else {
        console.log("USER EXISTS: ", data)
        const items = await data.items;
        console.log("USER INVENTORY: ", items)

        const quests = await data.quests;
        console.log("USER QUESTS: ", quests)
        // Sync Phaser State with Save State
        PhaserEventBus.emit(PLAYER_EVENTS.INITIALIZE_PLAYER, {
            player: {
              strength: data?.stats?.strength  ?? 5,
              defense: data?.stats?.defense ?? 5,
              health: data?.stats?.health ?? 101,
              maxHealth: data?.stats?.maxHealth ?? 101,
              level: data?.stats?.level ?? 1,
            },
            inventory: [],
            gold: 1000
        })
    }
};

useEffect(() => {
    fetchPlayer();
}, [user]);

  const currentScene = (scene: any) => console.log("Current Scene: ", scene.scene.key);

//   if(isLoading){
//     return <div>Hello World</div>
//   }

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
          <AvatarDropdown signOut={signOut} />
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

export default GamePage;
