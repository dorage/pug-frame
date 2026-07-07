import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("src/index.ts", import.meta.url)),
      name: "PugFrameCanvas",
      fileName: "index",
      formats: ["es"],
    },
    // render(및 pug)는 소비자/데모 번들러가 처리하도록 외부화한다.
    rollupOptions: {
      external: ["@pug-frame/render", "pug"],
    },
  },
  plugins: [dts({ include: ["src"], rollupTypes: true })],
});
