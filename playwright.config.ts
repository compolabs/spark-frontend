import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/specs",
  outputDir: "./e2e/artifacts/run",
  reporter: [["html", { outputFolder: "e2e/artifacts/report", open: "never" }]],
  workers: 1,
  use: {
    baseURL: `http://localhost:${process.env.VITE_PORT || 5173}`,
    headless: true,
    viewport: { width: 1280, height: 720 },
    // trace: "on",
    // video: "on",
    screenshot: "only-on-failure",
  },
});
