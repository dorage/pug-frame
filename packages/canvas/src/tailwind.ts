/**
 * canvas Shadow DOM 안에서 Tailwind 유틸리티 클래스를 런타임에 생성한다.
 *
 * canvas는 사용자가 입력한 소스를 런타임에 Shadow DOM으로 렌더한다. 전역
 * Tailwind는 Shadow 격리 때문에 침투하지 못하므로, 렌더된 HTML에서 클래스
 * 후보를 뽑아 Tailwind v4 컴파일러로 해당 유틸리티 CSS만 생성해 Shadow 내부에
 * 직접 주입한다.
 *
 * 설계 메모:
 * - 입력 CSS는 theme(디자인 토큰 변수) + `@tailwind utilities`만 쓴다. preflight
 *   (전역 리셋)를 제외해 프레임/요소 기본 스타일을 건드리지 않는다.
 * - `@layer` 없이(unlayered) 생성한다. generateStyles 뒤에 주입하면 동일
 *   specificity에서는 소스 순서로 유틸리티가 기본 스타일을 이긴다.
 * - 컴파일러는 1회 생성해 캐시하고, 렌더마다 `build(candidates)`만 호출한다.
 */
import { compile } from "tailwindcss";
import themeCss from "virtual:tailwind-theme";

/**
 * theme 변수 + 유틸리티. preflight/레이어 없음.
 * `@theme default`의 `default`는 standalone 컴파일에서 값이 등록되지 않으므로 제거한다.
 */
const INPUT_CSS = `${themeCss.replace(/@theme default/g, "@theme")}\n@tailwind utilities;`;

interface Compiler {
  build(candidates: string[]): string;
}

let compilerPromise: Promise<Compiler> | null = null;

function getCompiler(): Promise<Compiler> {
  if (!compilerPromise) {
    compilerPromise = compile(INPUT_CSS) as Promise<Compiler>;
  }
  return compilerPromise;
}

const CLASS_ATTR_PATTERN = /class="([^"]*)"/g;

/** HTML 문자열의 모든 `class="..."` 토큰을 중복 없이 모은다. */
export function extractClasses(html: string): string[] {
  const classes = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = CLASS_ATTR_PATTERN.exec(html)) !== null) {
    for (const token of match[1].split(/\s+/)) {
      if (token) classes.add(token);
    }
  }
  return [...classes];
}

/**
 * 렌더된 HTML에 등장하는 클래스에 대한 Tailwind 유틸리티 CSS를 생성한다.
 * 클래스가 없거나 컴파일에 실패하면 빈 문자열을 반환한다(렌더는 계속 진행).
 */
export async function generateTailwind(html: string): Promise<string> {
  const candidates = extractClasses(html);
  if (candidates.length === 0) return "";
  try {
    const compiler = await getCompiler();
    return compiler.build(candidates);
  } catch {
    return "";
  }
}
