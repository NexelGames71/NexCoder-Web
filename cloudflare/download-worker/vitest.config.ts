import { defineConfig } from "vitest/config";

// Isolated config so the Worker suite never inherits the website's vitest
// setup (jsdom, React). These are plain Node unit tests over the fetch handler.
export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
  },
});
