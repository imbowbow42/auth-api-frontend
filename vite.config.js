import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3300,
    strictPort: true, // Fail if port 3000 is taken, to ensure we match backend CORS
  },
});
