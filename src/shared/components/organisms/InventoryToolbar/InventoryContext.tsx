// contexts/InventoryContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { PhaserEventBus } from "@/shared/services/phaser.service";
import { INVENTORY_EVENTS } from "@/slices/events/events.types";
import { InventoryItem } from "@/slices/inventory/inventory.service";

interface InventoryContextType {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  selectItem: (item: InventoryItem | null) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const handleInventoryChange = (newItems: InventoryItem[]) => {
      setItems(newItems);

      // Update selected item if it was removed/changed
      if (selectedItem) {
        const updatedSelectedItem = newItems.find(
          (item) => item.id === selectedItem.id
        );
        if (!updatedSelectedItem || updatedSelectedItem.quantity === 0) {
          setSelectedItem(null);
        } else if (updatedSelectedItem !== selectedItem) {
          setSelectedItem(updatedSelectedItem);
        }
      }
    };

    const handleListen = (_data) => {
      console.log("LISTEN: ", _data);
    };

    PhaserEventBus.on(
      INVENTORY_EVENTS.INVENTORY_CHANGED,
      handleInventoryChange
    );

    PhaserEventBus.on(INVENTORY_EVENTS.ITEM_ADDED, handleListen);

    return () => {
      PhaserEventBus.off(
        INVENTORY_EVENTS.INVENTORY_CHANGED,
        handleInventoryChange
      );
    };
  }, [selectedItem]);

  const selectItem = (item: InventoryItem | null) => {
    setSelectedItem(item);
  };

  return (
    <InventoryContext.Provider value={{ items, selectedItem, selectItem }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
