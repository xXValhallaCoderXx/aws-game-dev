import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/shared/components"),
      "@services": path.resolve(__dirname, "./src/shared/services"),
      "@scenes": path.resolve(__dirname, "./src/scenes"),
      "@game": path.resolve(__dirname, "./src/game"),
      "@slices": path.resolve(__dirname, "./src/slices"),
      "@shared": path.resolve(__dirname, "./src/shared"),
    },
  },
});
