import pug from "pug";
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
  return {
    html: renderFragment(source),
    css: generateStyles({ embedded: options.embedded ?? false }),
  };
}

/** preprocess → pug.render → `.canvas` 래핑까지의 fragment HTML을 만든다. */
export function renderFragment(source: string): string {
  const pugSource = preprocess(source);
  const fragment = pug.render(pugSource, { pretty: true });
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
