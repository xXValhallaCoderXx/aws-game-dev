/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";

export interface IPlatformState {
  isMerchantStoreOpen: boolean;
  isSettingsOpen: boolean;
  isSoundEnabled: boolean;
  merchantItems: any;
}

const initialState: IPlatformState = {
  isSettingsOpen: false,
  isSoundEnabled: true,
  isMerchantStoreOpen: false,
  merchantItems: [],
};

export const platformSlice = createSlice({
  name: "platform",
  initialState,
  reducers: {
    toggleSettings: (state, action: PayloadAction<boolean>) => {
      state.isSettingsOpen = action.payload;
    },
    toggleSound(state, action: PayloadAction<boolean>) {
      state.isSoundEnabled = action.payload;
    },
    enableSound(state) {
      state.isSoundEnabled = true;
    },
    disableSound(state) {
      state.isSoundEnabled = false;
    },
    setIsMerchantStoreOpen(state, action: PayloadAction<boolean>) {
      state.isMerchantStoreOpen = action.payload;
    },
    setMerchantItems(state, action: any) {
      state.merchantItems = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  toggleSettings,
  toggleSound,
  enableSound,
  disableSound,
  setIsMerchantStoreOpen,
  setMerchantItems,
} = platformSlice.actions;

export default platformSlice.reducer;
