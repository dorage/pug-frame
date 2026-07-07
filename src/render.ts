import pug from "pug";
import { preprocess } from "./preprocess.js";
import { generateStyles } from "./styles.js";

export interface RenderOptions {
  /** HTML <title>에 사용할 제목 */
  title?: string;
}

/**
 * pug-frame 소스를 자기완결적 단일 HTML 문서로 렌더한다.
 *
 * 흐름: preprocess → pug.render(여러 화면 = 형제 노드) → .canvas 래핑 →
 * 인라인 CSS를 포함한 완전한 HTML 문서.
 */
export function render(source: string, options: RenderOptions = {}): string {
  const pugSource = preprocess(source);
  const fragment = pug.render(pugSource, { pretty: true });
  const styles = generateStyles();
  const title = options.title ?? "pug-frame";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
${styles}
</style>
</head>
<body>
<div class="canvas">${fragment}</div>
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
