import { defineConfig, devices } from "@playwright/test";

// Mocked-network smoke tests: every Supabase call (auth + edge function) is
// intercepted in-test, so this runs fully offline against the Vite dev server.
// Chromium is the pre-installed system build (no download in this environment).
const CHROMIUM = process.env.PLAYWRIGHT_CHROMIUM_PATH || "/opt/pw-browsers/chromium";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:5173",
    trace: "off",
    ...devices["Pixel 7"],
    permissions: ["camera"],
    launchOptions: {
      executablePath: CHROMIUM,
      // Synthesize a fake camera device so the QR scanner's real getUserMedia
      // + <video> rendering path can be exercised headlessly (no real webcam
      // in this environment). Harmless for tests that never touch the camera.
      args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
    },
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "npm run dev -- --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
