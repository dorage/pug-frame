import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// canvas는 dist에서 pug + Node 폴리필을 자체 번들링하므로 여기서는 추가 폴리필이 필요 없다.
export default defineConfig({
  plugins: [react()],
});
