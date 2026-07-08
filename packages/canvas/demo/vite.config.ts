import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// 데모는 pug를 브라우저에서 실행하므로 Node 내장 모듈 폴리필이 필요하다.
export default defineConfig({
  plugins: [nodePolyfills()],
});
