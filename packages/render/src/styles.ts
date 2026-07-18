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

/* 비디오 자리표시자: 회색 박스 + 가운데 재생 삼각형. */
.pf-video {
  position: relative;
  min-width: 96px;
  min-height: 64px;
  border: 1px solid #000;
  background: #eee;
}
.pf-video::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-40%, -50%);
  border-style: solid;
  border-width: 9px 0 9px 15px;
  border-color: transparent transparent transparent #000;
}

/* --- 제목/링크 --- */
h1 { font-size: 28px; font-weight: 700; margin: 0; }
h2 { font-size: 24px; font-weight: 700; margin: 0; }
h3 { font-size: 20px; font-weight: 700; margin: 0; }
h4 { font-size: 18px; font-weight: 600; margin: 0; }
h5 { font-size: 16px; font-weight: 600; margin: 0; }
h6 { font-size: 14px; font-weight: 600; margin: 0; }

/* link 키워드와 실제 a 태그에 동일 적용. */
a {
  color: #000;
  text-decoration: underline;
  cursor: pointer;
}

/* 검색 입력: 둥근 박스 + 돋보기 + 입력 자리표시 라인. */
.pf-search {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid #000;
  border-radius: 18px;
  background: #fff;
}
.pf-search::before {
  content: "";
  width: 13px;
  height: 13px;
  border: 2px solid #999;
  border-radius: 50%;
  flex: none;
}
.pf-search::after {
  content: "";
  flex: 1;
  height: 8px;
  background: #eee;
}

/* 하단 내비게이션 바: 균등 분할 탭 느낌. */
.pf-navigation {
  height: 48px;
  border: 1px solid #000;
  background: #fff;
  background-image: repeating-linear-gradient(
    90deg,
    #999 0 1px,
    transparent 1px 20%
  );
}

/* 스피너: 회전 원호. */
.pf-spinner {
  display: inline-block;
  width: 28px;
  height: 28px;
  border: 3px solid #ccc;
  border-top-color: #000;
  border-radius: 50%;
  animation: pf-spin 0.8s linear infinite;
}
@keyframes pf-spin {
  to { transform: rotate(360deg); }
}

/* 진행바: 트랙 + 채움(폭은 인라인 style). */
.pf-progress {
  overflow: hidden;
  min-width: 120px;
  height: 12px;
  border: 1px solid #000;
  background: #fff;
}
.pf-progress-fill {
  height: 100%;
  background: #000;
}

/* 별점: 채운 별(검정) / 빈 별(회색). */
.pf-rating {
  display: inline-flex;
  gap: 2px;
  font-size: 18px;
  line-height: 1;
}
.pf-star { color: #ccc; }
.pf-star--on { color: #000; }

/* 토글 스위치: off(흰 트랙·왼쪽 노브) / on(검은 트랙·오른쪽 흰 노브). */
.pf-toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  border: 1px solid #000;
  border-radius: 11px;
  background: #fff;
  vertical-align: middle;
}
.pf-toggle--on { background: #000; }
.pf-toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #000;
}
.pf-toggle--on .pf-toggle-knob {
  left: auto;
  right: 2px;
  background: #fff;
}

/* 체크박스: off(빈 박스) / on(검은 박스 + 흰 체크). */
.pf-checkbox {
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 1px solid #000;
  background: #fff;
  vertical-align: middle;
}
.pf-checkbox--on { background: #000; }
.pf-checkbox--on::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 6px;
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* 드롭다운: 라벨 + 아래 방향 캐럿 + 아이템 목록. */
.pf-dropdown {
  position: relative;
  display: inline-block;
  min-width: 140px;
  padding: 6px 24px 6px 12px;
  border: 1px solid #000;
  background: #fff;
  font-size: 13px;
}
.pf-dropdown::after {
  content: "";
  position: absolute;
  top: 12px;
  right: 10px;
  border-style: solid;
  border-width: 5px 4px 0 4px;
  border-color: #000 transparent transparent transparent;
}
.pf-item {
  margin: 6px -12px 0 -12px;
  padding: 6px 12px;
  border-top: 1px solid #ddd;
  cursor: pointer;
}

/* --- 달력 / 월·연 선택 --- */
.pf-calendar,
.pf-monthpick,
.pf-yearpick {
  display: inline-block;
  border: 1px solid #000;
  background: #fff;
  padding: 8px;
}
.pf-cal-head {
  text-align: center;
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 6px;
}
.pf-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  font-size: 11px;
}
.pf-cal-dow {
  text-align: center;
  color: #999;
  font-size: 10px;
}
.pf-cal-day {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pf-cal-day--sel {
  background: #000;
  color: #fff;
  border-radius: 50%;
}
.pf-pick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  font-size: 12px;
}
.pf-pick-cell {
  min-width: 44px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
}
.pf-pick-cell--sel {
  background: #000;
  color: #fff;
  border-color: #000;
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

/* 선택된 탭/버튼 표시: 반전(흰 배경 + 검은 테두리). */
button.active {
  background: #fff;
  color: #000;
  box-shadow: inset 0 0 0 2px #000;
}
`.trim();
}
