import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// One-off build config for producing a bundle to publish as a Claude
// Artifact. Fonts stay inlined via CSS (small, and that path is fine at
// this size); images are kept as separate hashed files so the JS bundle
// itself stays small — they get uploaded separately as artifact assets
// and the built JS/CSS is rewritten to reference their blob URLs.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist-artifact",
    cssCodeSplit: false,
    assetsInlineLimit: (filePath: string) => /\.(ttf|otf|woff2?)$/i.test(filePath),
  },
});
