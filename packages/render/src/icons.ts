/**
 * `p-icon` attribute → lucide 아이콘 인라인 SVG 치환.
 *
 * `p-icon`은 다른 `p-*`(focus/tooltip 등 인터랙션)와 달리 **컨텐츠 지시자**다.
 * 렌더 단계에서 인라인 SVG로 치환하므로 정적 HTML 출력과 canvas 뷰어 양쪽에서
 * 모두 아이콘이 보인다.(인터랙션 attribute는 정적 출력에서 제거되는 것과 다름)
 *
 * lucide-static이 제공하는 이름별 SVG 문자열(`stroke="currentColor"`, 24×24)을
 * 그대로 사용한다. 아이콘 이름은 kebab-case(예: `user`, `chevron-right`).
 */
import * as lucideIcons from "lucide-static";

/** lucide-static은 PascalCase named export(예: `User`, `ChevronRight`)로 SVG 문자열을 노출한다. */
const iconStrings = lucideIcons as unknown as Record<string, string>;

/** 미지원 아이콘 이름에 쓰는 자리표시자(점선 사각형). */
const FALLBACK_SVG =
  '<svg class="lucide pf-icon-missing" xmlns="http://www.w3.org/2000/svg" ' +
  'width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-dasharray="3 3">' +
  '<rect x="3" y="3" width="18" height="18" rx="2" /></svg>';

/** kebab-case(또는 snake_case) 이름을 lucide export 키(PascalCase)로 변환한다. */
function toPascalCase(name: string): string {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * 아이콘 이름에 해당하는 인라인 SVG 문자열을 반환한다.
 * 알 수 없는 이름은 점선 사각형 자리표시자를 반환한다.
 */
export function iconToSvg(name: string): string {
  const svg = iconStrings[toPascalCase(name)];
  return typeof svg === "string" ? svg.trim() : FALLBACK_SVG;
}

/** 여는 태그의 `p-icon="이름"`(작은/큰따옴표 모두)을 잡아내는 패턴. */
const P_ICON_PATTERN =
  /(<[a-zA-Z][\w-]*\b[^>]*\bp-icon=(?:"([^"]*)"|'([^']*)')[^>]*>)/g;

/**
 * 컴파일된 HTML에서 `p-icon`을 가진 요소 여는 태그 뒤에 lucide SVG를 삽입한다.
 * 요소 자체(예: `.pf-circle`)와 `p-icon` attribute는 보존한다. attribute는
 * 이후 정적 출력에서 제거되지만 SVG는 이미 삽입되어 남는다.
 */
export function resolveIcons(html: string): string {
  return html.replace(P_ICON_PATTERN, (_match, openTag, dq, sq) => {
    const name = dq ?? sq ?? "";
    return `${openTag}${iconToSvg(name)}`;
  });
}
