import { mapTag } from "./frames.js";

/**
 * pug-frame 문법을 표준 pug 소스로 변환한다.
 *
 * 들여쓰기는 그대로 보존하고(=pug의 들여쓰기 파싱을 그대로 활용) 각 줄의
 * 태그 토큰과 텍스트만 변환한다.
 *
 * 변환 규칙:
 * 1. 따옴표 텍스트 제거: `div "Rescene"` → `div Rescene`
 * 2. 구조 키워드 → 클래스 div: `mobile` → `div.frame.frame--mobile`
 * 3. ID/attribute 보존: `mobile#main-1` → `div.frame.frame--mobile#main-1`
 *
 * 여러 줄 attribute(`button(` ... `)`)는 열린 괄호가 닫힐 때까지 변환 없이
 * 그대로 통과시킨다.
 */
export function preprocess(source: string): string {
  let parenDepth = 0;
  return source
    .split("\n")
    .map((line) => {
      // 이미 열린 attribute 블록 안이면 변환 없이 통과시킨다.
      if (parenDepth > 0) {
        parenDepth += countParenDelta(line);
        return line;
      }
      const transformed = transformLine(line);
      parenDepth += countParenDelta(transformed);
      return transformed;
    })
    .join("\n");
}

/** 한 줄에서 여는 괄호와 닫는 괄호 개수 차이를 센다. */
function countParenDelta(line: string): number {
  let delta = 0;
  for (const ch of line) {
    if (ch === "(") delta++;
    else if (ch === ")") delta--;
  }
  return delta;
}

/** 태그 토큰 뒤에 오는 따옴표(", ') 텍스트를 캡처하는 패턴 */
const LINE_PATTERN = /^(\s*)(\S+)(?:\s+(.*))?$/;

function transformLine(line: string): string {
  // 빈 줄은 그대로 둔다.
  if (line.trim() === "") {
    return line;
  }

  const match = LINE_PATTERN.exec(line);
  if (!match) {
    return line;
  }

  const [, indent, tag, rest] = match;
  const mappedTag = mapTag(tag);

  if (rest === undefined) {
    return `${indent}${mappedTag}`;
  }

  const text = stripQuotes(rest);
  return `${indent}${mappedTag} ${text}`;
}

/** 앞뒤를 감싼 큰/작은따옴표 한 쌍을 제거한다. */
function stripQuotes(value: string): string {
  const trimmed = value.trim();
  const quoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));
  if (quoted && trimmed.length >= 2) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}
