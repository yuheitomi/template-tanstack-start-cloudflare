import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersConfig({
  plugins: [tsconfigPaths(), tanstackStart(), viteReact()],
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
      },
    },
    // deps: {
    //   optimizer: {
    //     ssr: {
    //       enabled: true,
    //       include: ["@tanstack/react-start", "@tanstack/router", "@tanstack/start-server-core"],
    //     },
    //   },
    // },
  },
});
