/**
 * 프레임 타입과 크기 정의.
 *
 * 새 프레임 타입(tablet, desktop 등)을 추가하려면 이 맵에 항목만 넣으면
 * 전처리(preprocess)와 스타일(styles) 양쪽에 자동 반영된다.
 */
export interface FrameSize {
  /** 프레임 너비(px) */
  width: number;
  /** 프레임 높이(px) */
  height: number;
}

export const FRAME_SIZES = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
} as const satisfies Record<string, FrameSize>;

export type FrameType = keyof typeof FRAME_SIZES;

/** 최상위 프레임 키워드 집합 */
export const FRAME_TYPES = Object.keys(FRAME_SIZES) as FrameType[];

/**
 * 구조 키워드 → 클래스 매핑.
 *
 * 프레임 내부의 시맨틱 영역. 이들을 실제 <header>/<body>/<footer> 태그로
 * 렌더하면 중첩 <body>가 브라우저에서 무효 처리되므로, 클래스가 붙은 div로
 * 매핑해 일관되게 스타일링한다.
 */
export const SECTION_CLASSES: Record<string, string> = {
  header: "frame-header",
  nav: "frame-nav",
  main: "frame-main",
  body: "frame-body",
  footer: "frame-footer",
};

/**
 * 와이어프레임 기본 요소 키워드 → 클래스 매핑.
 *
 * 자주 쓰는 자리표시자(원형 아바타, 이미지 박스)를 짧은 키워드로 제공한다.
 * 실제 스타일은 styles.ts의 `.pf-*` 규칙이 담당한다.
 */
export const ELEMENT_CLASSES: Record<string, string> = {
  circle: "pf-circle",
  image: "pf-image",
};

/**
 * 태그 토큰에서 선행 키워드와 그 뒤의 pug 셀렉터/attribute 잔여부를 분리한다.
 * 예: `mobile#main-1` → { keyword: "mobile", suffix: "#main-1" },
 *     `button(p-focus='x')` → { keyword: "button", suffix: "(p-focus='x')" }
 */
const TAG_PATTERN = /^([A-Za-z][\w-]*)(.*)$/;

/**
 * 주어진 태그 토큰을 pug 태그 표현으로 변환한다.
 * 선행 키워드만 매핑하고 `#id`/`.class`/`(attrs)` 등 pug 잔여부는 보존한다.
 * - 프레임 키워드(mobile 등): `div.frame.frame--{type}` + 잔여부
 * - 구조 키워드(header/nav/main/body/footer): `div.frame-{section}` + 잔여부
 * - 요소 키워드(circle/image): `div.pf-{element}` + 잔여부
 * - 그 외(div, button, section 등): 그대로 반환
 */
export function mapTag(tag: string): string {
  const match = TAG_PATTERN.exec(tag);
  if (!match) {
    return tag;
  }
  const [, keyword, suffix] = match;

  if ((FRAME_TYPES as string[]).includes(keyword)) {
    return `div.frame.frame--${keyword}${suffix}`;
  }
  const sectionClass = SECTION_CLASSES[keyword];
  if (sectionClass) {
    return `div.${sectionClass}${suffix}`;
  }
  const elementClass = ELEMENT_CLASSES[keyword];
  if (elementClass) {
    return `div.${elementClass}${suffix}`;
  }
  return tag;
}
