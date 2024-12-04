/* eslint-disable @typescript-eslint/no-explicit-any */
import classes from "./inventory-toolbar.module.css";
import { SpriteIcon } from "../../atoms/SpriteIcon";
import { PhaserEventBus } from "@services/phaser.service";
import { useInventory } from "./InventoryContext";

const InventoryToolbar = () => {
  const { items, selectedItem, selectItem } = useInventory();
  console.log("ITEMS: ", items);
  console.log("SELECTED ITEM: ", selectedItem);
  console.log("SELECT ITEM: ", selectItem);
  const handleOnClickToolbar = (_data: any) => {
    console.log("DATA: ", _data);
    //  scene.events.emit("inventory:seedSelected", seedId);
    PhaserEventBus.emit("inventory:seedSelected", "carrot-seed");
  };
  return (
    <div className={classes.toolbar}>
      {/* Add multiple buttons */}
      <button className={classes.toolbarButton} title="Open Magic Menu">
        <SpriteIcon
          onClick={handleOnClickToolbar}
          iconIndex={0}
          hotkeyNumber={0}
          itemCount={2}
        />
      </button>
      <button className={classes.toolbarButton}>
        <SpriteIcon
          onClick={handleOnClickToolbar}
          iconIndex={1}
          hotkeyNumber={1}
          itemCount={4}
        />
      </button>
      <button className={classes.toolbarButton}>
        <SpriteIcon
          onClick={handleOnClickToolbar}
          iconIndex={2}
          hotkeyNumber={2}
          itemCount={5}
        />
      </button>
    </div>
  );
};

export default InventoryToolbar;
