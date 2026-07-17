/**
 * pug-frame 전용 인터랙션 attribute(`p-*`) 레지스트리.
 *
 * `p-` 접두는 pug-frame이 canvas 뷰어에서 해석하는 자체 기능 네임스페이스다.
 * 각 핸들러는 이름(`focus`, `tooltip`)으로 `[p-${name}]` 요소를 담당하며,
 * Shadow에 주입할 CSS(`style`)와 탭/바깥탭 동작을 제공한다.
 *
 * 새 인터랙션 attribute를 추가하려면 `PAttrHandler`를 만들어 `pAttrHandlers`에
 * 넣기만 하면 된다. canvas는 접두만 알고 이름별 분기는 이 레지스트리에 위임한다.
 */

/** pug-frame 인터랙션 attribute의 공통 접두. */
export const P_ATTR_PREFIX = "p-";

/** 핸들러가 canvas 기능을 사용하기 위한 최소 컨텍스트. */
export interface PAttrContext {
  /** 렌더된 컨텐츠가 들어있는 Shadow root. */
  readonly shadow: ShadowRoot;
  /** 카메라를 대상 요소로 이동·정렬한다. */
  focusOnElement(el: HTMLElement): void;
  /**
   * 요소에 클래스를 붙여 활성 상태로 표시한다.
   * `exclusive`면 같은 className을 가진 이전 활성 요소에서 클래스를 뗀다.
   */
  setActive(el: HTMLElement, className: string, exclusive?: boolean): void;
  /** 활성 상태를 토글한다(터치 탭 등). */
  toggleActive(el: HTMLElement, className: string): void;
  /**
   * 주어진 className의 활성 요소 중 `target`을 포함하지 않는 것만 해제한다.
   * (포커스된 요소 내부를 탭하면 유지, 바깥을 탭하면 해제)
   */
  clearActiveOutside(className: string, target: HTMLElement | null): void;
}

export interface PAttrHandler {
  /** `p-` 접두를 뺀 이름. 담당 셀렉터는 `[p-${name}]`. */
  readonly name: string;
  /** Shadow 내부에 주입할 CSS. stage transform과 함께 줌에 비례해 스케일된다. */
  readonly style: string;
  /** 이 attribute를 가진 요소(또는 그 조상)를 탭했을 때. */
  onTap?(el: HTMLElement, value: string, ctx: PAttrContext): void;
  /** 어떤 p-attribute 트리거에도 맞지 않는 탭이 발생했을 때 정리한다. */
  onOutsideTap?(ctx: PAttrContext, target: HTMLElement | null): void;
}

/**
 * focus된 요소의 붉은 outline과 ID 라벨 스타일.
 * Shadow 내부에 주입해 stage transform과 함께 스케일된다(줌에 비례).
 */
const FOCUS_STYLE = `
.pf-focused {
  position: relative;
  outline: 2px solid #e00;
  outline-offset: 2px;
}
.pf-focused::after {
  content: attr(id);
  position: absolute;
  top: -20px;
  left: 0;
  font: 12px/1 monospace;
  color: #e00;
  pointer-events: none;
}
/* focus 시에는 붉은 라벨만 남기고 기본 프레임 ID 라벨은 숨긴다. */
.frame[id].pf-focused::before {
  content: none;
}
`;

/**
 * `p-tooltip` 마커(*)와 말풍선 오버레이 스타일.
 * 마커는 요소 바깥 오른쪽 상단, 말풍선은 요소 위쪽에 표시된다.
 * 마우스 호버(`:hover`) 또는 터치 탭(`.pf-tooltip-open`)에서 나타난다.
 */
const TOOLTIP_STYLE = `
[p-tooltip] {
  position: relative;
}
[p-tooltip]::before {
  content: "*";
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  color: #e00;
  font: bold 14px/1 monospace;
  pointer-events: none;
}
[p-tooltip]::after {
  content: attr(p-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  max-width: 220px;
  padding: 6px 8px;
  border-radius: 6px;
  background: #333;
  color: #fff;
  font: 12px/1.4 sans-serif;
  white-space: pre-wrap;
  text-align: left;
  z-index: 5;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
[p-tooltip]:hover::after,
[p-tooltip].pf-tooltip-open::after {
  opacity: 1;
  visibility: visible;
}
`;

/** 클릭 시 값(id)과 같은 요소로 카메라를 이동하는 focus 핸들러. */
const focusHandler: PAttrHandler = {
  name: "focus",
  style: FOCUS_STYLE,
  onTap(_trigger, value, ctx) {
    const target = ctx.shadow.getElementById(value);
    if (!(target instanceof HTMLElement)) return;
    ctx.focusOnElement(target);
    ctx.setActive(target, "pf-focused", true);
  },
  onOutsideTap(ctx, target) {
    ctx.clearActiveOutside("pf-focused", target);
  },
};

/** 마커와 말풍선을 표시하는 tooltip 핸들러. 터치 탭으로 토글한다. */
const tooltipHandler: PAttrHandler = {
  name: "tooltip",
  style: TOOLTIP_STYLE,
  onTap(el, _value, ctx) {
    ctx.toggleActive(el, "pf-tooltip-open");
  },
  onOutsideTap(ctx, target) {
    ctx.clearActiveOutside("pf-tooltip-open", target);
  },
};

/** 등록된 p-attribute 핸들러 목록. canvas가 이 순서로 디스패치한다. */
export const pAttrHandlers: PAttrHandler[] = [focusHandler, tooltipHandler];

/** 모든 핸들러가 주입할 CSS를 하나로 합친다. */
export function pAttrStyles(): string {
  return pAttrHandlers.map((handler) => handler.style).join("\n");
}
