import { execSync } from "child_process";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

import getConfig from "./script/getConfig";

const OUT_DIR = "build";

const COMMIT_HASH = execSync("git rev-parse --short HEAD").toString().trim();

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: OUT_DIR,
  },
  define: {
    "process.env.__COMMIT_HASH__": JSON.stringify(COMMIT_HASH),
  },
  plugins: [
    getConfig(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
    react({
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    tsconfigPaths(),
    checker({ typescript: true }),
    svgr(),
  ],
  // It should help resolve issues with linking the SDK
  //
  optimizeDeps: {
    // exclude: ["@compolabs/spark-orderbook-ts-sdk"],
    exclude: ["@compolabs/spark-perpetual-ts-sdk"],
  },
});
