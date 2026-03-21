import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    port: 3300,
    strictPort: true, // Fail if port 3000 is taken, to ensure we match backend CORS
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'home.html'),
      },
    },
  },
});
