import { FRAME_SIZES, type FrameType } from "./frames.js";

/**
 * 캔버스/프레임/구조/버튼 스타일을 생성한다.
 * 프레임별 크기 규칙은 FRAME_SIZES에서 자동 생성되므로 프레임 타입 추가 시
 * 별도 수정이 필요 없다.
 */
export function generateStyles(): string {
  const frameSizeRules = (Object.keys(FRAME_SIZES) as FrameType[])
    .map((type) => {
      const { width, height } = FRAME_SIZES[type];
      return `.frame--${type} { width: ${width}px; height: ${height}px; }`;
    })
    .join("\n");

  return `
* { box-sizing: border-box; }

body { margin: 0; }

.canvas {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 24px;
  background: #f0f0f0;
  min-height: 100vh;
}

.frame {
  display: flex;
  flex-direction: column;
  border: 1px solid #000;
  background: #fff;
  overflow: hidden;
}

${frameSizeRules}

.frame-header,
.frame-body,
.frame-footer {
  border: 1px solid #000;
  background: #fff;
  padding: 12px;
}

.frame-body {
  flex: 1;
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
