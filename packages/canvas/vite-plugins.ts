import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import type { Plugin } from "vite";

/**
 * Tailwind 기본 테마(theme.css)를 문자열로 노출하는 가상 모듈.
 *
 * `tailwindcss/theme.css?raw`는 vite의 CSS 특수 처리 때문에 빈 문자열이 되므로,
 * Node fs로 파일을 직접 읽어 `virtual:tailwind-theme`로 제공한다.
 * vite build와 vitest 양쪽에서 동일하게 쓰기 위해 별도 파일로 분리한다.
 */
export function tailwindThemePlugin(): Plugin {
  const VIRTUAL_ID = "virtual:tailwind-theme";
  const RESOLVED_ID = "\0" + VIRTUAL_ID;
  const require = createRequire(import.meta.url);
  return {
    name: "pug-frame:tailwind-theme",
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      const css = readFileSync(require.resolve("tailwindcss/theme.css"), "utf8");
      return `export default ${JSON.stringify(css)};`;
    },
  };
}
