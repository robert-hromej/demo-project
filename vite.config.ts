import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import RubyPlugin from "vite-plugin-ruby";
import { resolve } from "path";

export default defineConfig({
  plugins: [RubyPlugin(), react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "app/frontend"),
    },
  },
});
