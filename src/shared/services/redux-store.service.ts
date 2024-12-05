import { configureStore } from "@reduxjs/toolkit";
import {
  phaserSyncMiddleware,
  initializePhaserSync,
} from "@/middleware/phaser-sync.middleware";
import { platformSlice } from "@/slices/platform/game.slice";
import { inventorySlice } from "@/slices/inventory/inventory.slice";

export const store = configureStore({
  reducer: {
    inventory: inventorySlice.reducer,
    platform: platformSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(phaserSyncMiddleware),
});

// Initialize Phaser sync
initializePhaserSync(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
