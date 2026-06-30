import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Neckarline — Rhine-Neckar Transit",
        short_name: "Neckarline",
        description: "English bus & tram journeys for Mannheim, Heidelberg, Ludwigshafen.",
        theme_color: "#0B1F33",
        background_color: "#0B1F33",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: { cacheName: "api-cache", networkTimeoutSeconds: 5, expiration: { maxEntries: 50, maxAgeSeconds: 120 } }
          },
          {
            urlPattern: ({ url }) => url.host.includes("openstreetmap") || url.host.includes("maptiler") || url.host.includes("protomaps"),
            handler: "CacheFirst",
            options: { cacheName: "map-tiles", expiration: { maxEntries: 500, maxAgeSeconds: 604800 } }
          }
        ]
      }
    })
  ],
  server: { proxy: { "/api": "http://localhost:8787" } }
});
