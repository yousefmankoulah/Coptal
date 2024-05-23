import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target:
          "https://cautious-journey-5xx4666q445cvjp5-3000.app.github.dev/",
        secure: false,
      },
    },
  },

  plugins: [react()],
});
