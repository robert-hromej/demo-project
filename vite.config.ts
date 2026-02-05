import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import RubyPlugin from "vite-plugin-ruby";
import { resolve } from "path";

export default defineConfig({
  plugins: [RubyPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "app/frontend"),
    },
  },
});
