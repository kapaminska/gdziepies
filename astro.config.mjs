// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: {
    port: 3000,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 3000,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      hmr: {
        clientPort: 3000,
      },
    },
  },
  adapter: node({
    mode: "standalone",
  }),
});
