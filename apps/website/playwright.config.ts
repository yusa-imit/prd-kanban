import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./app/features/kanban/scenario-tests",
  webServer: {
    command: "vp dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: "http://localhost:5173" },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
