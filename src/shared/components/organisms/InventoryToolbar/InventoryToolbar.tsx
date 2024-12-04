import classes from "./inventory-toolbar.module.css";
import { SpriteIcon } from "../../atoms/SpriteIcon";

const InventoryToolbar = () => {
  return (
    <div className={classes.toolbar}>
      {/* Add multiple buttons */}
      <button className={classes.toolbarButton} title="Open Magic Menu">
        <SpriteIcon iconIndex={0} hotkeyNumber={0} itemCount={2} />
      </button>
      <button className={classes.toolbarButton}>
        <SpriteIcon iconIndex={1} hotkeyNumber={1} itemCount={4} />
      </button>
      <button className={classes.toolbarButton}>
        <SpriteIcon iconIndex={2} hotkeyNumber={2} itemCount={5} />
      </button>
    </div>
  );
};

export default InventoryToolbar;
