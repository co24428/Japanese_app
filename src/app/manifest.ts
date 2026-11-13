/**
 * Web app manifest: lets phones "Add to Home Screen" and open the site
 * full screen like an installed app. Served at /manifest.webmanifest.
 */
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nihongo Daily",
    short_name: "Nihongo",
    description: "Everyday Japanese conversation practice.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4ef",
    theme_color: "#3f51d6",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      // "maskable" lets Android crop the icon to its own shape.
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
