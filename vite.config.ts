import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: [path.resolve(__dirname, "src/index.ts")],
      formats: ["es"],
    },
    outDir: "lib",
    rollupOptions: {
      external: (id: string) => !id.startsWith(".") && !path.isAbsolute(id),
    },
  },
});
