import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import * as brand from "./src/lib/brand";

// Sustituye los marcadores %BRAND_*% de index.html con src/lib/brand.ts.
const brandHtml = () => ({
  name: "brand-html",
  transformIndexHtml: {
    order: "pre" as const,
    handler: (html: string) =>
      html.replace(/%(BRAND_[A-Z_]+)%/g, (match, key: string) => {
        const value = (brand as Record<string, string>)[key];
        return value ?? match;
      }),
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), brandHtml(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
