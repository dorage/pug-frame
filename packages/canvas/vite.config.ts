import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("src/index.ts", import.meta.url)),
      name: "PugFrameCanvas",
      fileName: "index",
      formats: ["es"],
    },
  },
  plugins: [
    // render(pug 하위 패키지 포함)를 번들에 넣고 assert/util/process를
    // 폴리필해, 소비자가 별도 설정 없이 브라우저에서 바로 쓸 수 있게 한다.
    nodePolyfills(),
    dts({ include: ["src"], rollupTypes: true }),
  ],
});
