import { defineConfig } from "vitest/config";
import { tailwindThemePlugin } from "./vite-plugins";

export default defineConfig({
  // Tailwind 런타임 유틸리티 테스트가 virtual:tailwind-theme를 쓰므로 플러그인을 붙인다.
  plugins: [tailwindThemePlugin()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
});
