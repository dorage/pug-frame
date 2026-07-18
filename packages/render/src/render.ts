import { compilePug } from "./compile.js";
import { resolveIcons } from "./icons.js";
import { preprocess } from "./preprocess.js";
import { generateStyles } from "./styles.js";

export interface RenderOptions {
  /** HTML <title>에 사용할 제목 */
  title?: string;
}

export interface RenderPartsOptions {
  /** 작은 영역 임베드용 스타일 생성 여부 (Shadow DOM 등). 기본 false */
  embedded?: boolean;
}

export interface RenderFragmentOptions {
  /**
   * pug-frame 전용 인터랙션 attribute(`p-*`)를 fragment에 남길지 여부.
   * canvas 뷰어처럼 이 attribute를 해석하는 소비자만 true로 준다.
   * 기본 false — 정적 HTML 출력에서는 제거한다.
   */
  keepInteractive?: boolean;
}

/**
 * 컴파일된 HTML에서 pug-frame 전용 `p-*` attribute를 제거한다.
 * 정적 출력에는 표준 HTML만 남기고, 인터랙션은 canvas 뷰어에서만 해석하기 위함.
 * 문자열 정규식이라 본문 텍스트의 `p-x="y"` 형태를 오탐할 수 있으나 DSL 특성상 위험은 낮다.
 */
function stripInteractiveAttrs(html: string): string {
  return html.replace(/\s+p-[\w-]+(=("[^"]*"|'[^']*'))?/g, "");
}

export interface RenderParts {
  /** `.canvas` 래퍼를 포함한 fragment HTML */
  html: string;
  /** fragment에 적용할 CSS */
  css: string;
}

/**
 * pug-frame 소스를 fragment HTML과 CSS로 **분리**해 반환한다.
 * 전체 문서가 아닌 조각이 필요한 경우(@pug-frame/canvas 등)에 사용한다.
 */
export function renderParts(
  source: string,
  options: RenderPartsOptions = {},
): RenderParts {
  const embedded = options.embedded ?? false;
  return {
    // embedded(=canvas 등 인터랙션 소비자)일 때만 p-* attribute를 보존한다.
    html: renderFragment(source, { keepInteractive: embedded }),
    css: generateStyles({ embedded }),
  };
}

/** preprocess → pug.render → `.canvas` 래핑까지의 fragment HTML을 만든다. */
export function renderFragment(
  source: string,
  options: RenderFragmentOptions = {},
): string {
  const pugSource = preprocess(source);
  const compiled = compilePug(pugSource);
  // p-icon은 컨텐츠 지시자이므로 정적/canvas 양쪽에 남도록 attribute 제거 전에 SVG를 삽입한다.
  const withIcons = resolveIcons(compiled);
  const fragment = options.keepInteractive
    ? withIcons
    : stripInteractiveAttrs(withIcons);
  return `<div class="canvas">${fragment}</div>`;
}

/**
 * pug-frame 소스를 자기완결적 단일 HTML 문서로 렌더한다.
 *
 * 흐름: renderFragment + generateStyles를 인라인 CSS 문서로 조합.
 */
export function render(source: string, options: RenderOptions = {}): string {
  const html = renderFragment(source);
  const css = generateStyles();
  const title = options.title ?? "pug-frame";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
${css}
</style>
</head>
<body>
${html}
</body>
</html>
`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
