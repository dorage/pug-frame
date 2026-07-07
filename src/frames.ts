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
  body: "frame-body",
  footer: "frame-footer",
};

/**
 * 주어진 태그 토큰을 pug 태그 표현으로 변환한다.
 * - 프레임 키워드(mobile 등): `div.frame.frame--{type}`
 * - 구조 키워드(header/body/footer): `div.frame-{section}`
 * - 그 외(div, button 등): 그대로 반환
 */
export function mapTag(tag: string): string {
  if ((FRAME_TYPES as string[]).includes(tag)) {
    return `div.frame.frame--${tag}`;
  }
  const sectionClass = SECTION_CLASSES[tag];
  if (sectionClass) {
    return `div.${sectionClass}`;
  }
  return tag;
}
