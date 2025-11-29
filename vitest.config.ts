import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersConfig({
  plugins: [tanstackStart(), viteReact(), tsconfigPaths()],
  // resolve: {
  //   alias: {
  //     "@tanstack/react-start/server-entry": path.resolve(
  //       process.cwd(),
  //       "node_modules/@tanstack/react-start/dist/default-entry/esm/server.js",
  //     ),
  //   },
  // },
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
      },
    },
  },
});
