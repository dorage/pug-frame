import { FRAME_SIZES, type FrameType } from "./frames.js";

export interface StyleOptions {
  /**
   * 캔버스를 페이지 전체가 아닌 작은 영역에 임베드할 때 true.
   * 전역 body 리셋과 min-height:100vh를 생략해 컨텐츠 크기에 맞춘다.
   * (@pug-frame/canvas가 Shadow DOM에 주입할 때 사용)
   */
  embedded?: boolean;
}

/**
 * 캔버스/프레임/구조/버튼 스타일을 생성한다.
 * 프레임별 크기 규칙은 FRAME_SIZES에서 자동 생성되므로 프레임 타입 추가 시
 * 별도 수정이 필요 없다.
 */
export function generateStyles(options: StyleOptions = {}): string {
  const { embedded = false } = options;

  const frameSizeRules = (Object.keys(FRAME_SIZES) as FrameType[])
    .map((type) => {
      const { width, height } = FRAME_SIZES[type];
      return `.frame--${type} { width: ${width}px; height: ${height}px; }`;
    })
    .join("\n");

  // 임베드 시에는 문서 전역(body)이 없으므로 리셋/뷰포트 규칙을 뺀다.
  const documentReset = embedded ? "" : "\nbody { margin: 0; }\n";
  const canvasSizing = embedded
    ? "  width: max-content;"
    : "  min-height: 100vh;";

  return `
* { box-sizing: border-box; }
${documentReset}
.canvas {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 24px;
  background: #f0f0f0;
${canvasSizing}
}

.frame {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid #000;
  background: #fff;
}

/* 프레임 ID를 프레임 바깥쪽 위에 표시한다. */
.frame[id]::before {
  content: attr(id);
  position: absolute;
  top: -20px;
  left: 0;
  font: 12px/1 monospace;
  color: #000;
  pointer-events: none;
}

${frameSizeRules}

.frame-header,
.frame-nav,
.frame-main,
.frame-body,
.frame-footer {
  border: 1px solid #000;
  background: #fff;
  padding: 12px;
  overflow: hidden;
}

/* main/body는 남는 세로 공간을 채운다. */
.frame-main,
.frame-body {
  flex: 1;
}

/* --- 기본 유틸리티 클래스 --- */
/* Tailwind 없이도 항상 동작하는 최소 세트. Tailwind의 동명 규칙과 충돌하지 않는다. */
.flex {
  display: flex;
}

.text-small {
  font-size: 12px;
}

/* --- 와이어프레임 요소 자리표시자 --- */
/* 원형 아바타. 내부 아이콘 SVG를 가운데 정렬한다. */
.pf-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1px solid #000;
  border-radius: 50%;
  overflow: hidden;
}

/* 이미지 자리표시자: 회색 박스 + 대각선. */
.pf-image {
  min-width: 64px;
  min-height: 64px;
  border: 1px solid #000;
  background: #eee
    linear-gradient(
      to top right,
      transparent calc(50% - 1px),
      #999 calc(50% - 1px),
      #999 calc(50% + 1px),
      transparent calc(50% + 1px)
    );
}

button {
  display: inline-block;
  background: #000;
  color: #fff;
  border: none;
  padding: 8px 16px;
  margin: 4px 0;
  font: inherit;
  cursor: pointer;
}
`.trim();
}
