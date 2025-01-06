import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlayerState {
  health: number;
  maxHealth: number;
}

const initialState: PlayerState = {
  health: 100,
  maxHealth: 100,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    updateHealth: (state, action: PayloadAction<number>) => {
      state.health = action.payload;
    },
    updateMaxHealth: (state, action: PayloadAction<number>) => {
      state.maxHealth = action.payload;
    },
  },
});

export const { updateHealth, updateMaxHealth } = playerSlice.actions;
export default playerSlice.reducer;
