import { renderParts } from "@pug-frame/render";
import { Camera } from "./camera";
import { createControls, type Controls } from "./controls";
import {
  P_ATTR_PREFIX,
  pAttrHandlers,
  pAttrStyles,
  type PAttrContext,
} from "./pAttributes";
import { generateTailwind } from "./tailwind";

export interface PugFrameCanvasOptions {
  /** pug-frame 소스. URL 링크(http/https) 또는 pug-frame 컨텐츠. */
  pugframe?: string;
  /** 이동/줌 물리 버튼 표시 여부. 기본 true */
  controls?: boolean;
}

export interface PugFrameCanvas {
  /** 대상 요소(뷰포트) */
  readonly element: HTMLElement;
  /**
   * pug-frame을 렌더링한다.
   * 소스 우선순위: render 인자 > 생성자 options.pugframe.
   * 둘 다 없거나 렌더링 실패 시 fallback 메시지를 표시한다.
   */
  render(pugframe?: string): Promise<void>;
  /** 이벤트 리스너와 DOM을 정리한다. */
  destroy(): void;
}

const WHEEL_ZOOM_INTENSITY = 0.0015;
const BUTTON_ZOOM_STEP = 1.2;
/** 이 픽셀 이상 움직이면 클릭이 아니라 드래그(팬)로 본다. */
const CLICK_MOVE_THRESHOLD = 5;

/**
 * 대상 DOM 요소(또는 selector)를 pug-frame 렌더링 캔버스로 만든다.
 * selector가 주어지면 항상 첫 번째 매치를 사용한다.
 */
export function pugFrameCanvas(
  target: HTMLElement | string,
  options: PugFrameCanvasOptions = {},
): PugFrameCanvas {
  const element = resolveElement(target);
  return new PugFrameCanvasImpl(element, options);
}

function resolveElement(target: HTMLElement | string): HTMLElement {
  if (typeof target !== "string") {
    return target;
  }
  const found = document.querySelector(target);
  if (!(found instanceof HTMLElement)) {
    throw new Error(`pugFrameCanvas: 요소를 찾을 수 없습니다: ${target}`);
  }
  return found;
}

/** http/https로 시작하는 한 줄짜리 문자열이면 URL로 간주한다. */
function looksLikeUrl(source: string): boolean {
  const trimmed = source.trim();
  return !/\s/.test(trimmed) && /^https?:\/\//i.test(trimmed);
}

class PugFrameCanvasImpl implements PugFrameCanvas {
  readonly element: HTMLElement;
  private readonly options: PugFrameCanvasOptions;
  private readonly camera = new Camera();
  private readonly stage: HTMLElement;
  private readonly shadow: ShadowRoot;
  private readonly fallback: HTMLElement;
  private controls?: Controls;

  /** 활성 포인터들의 최신 위치 (팬/핀치 계산용) */
  private readonly pointers = new Map<number, { x: number; y: number }>();
  private pinchDistance = 0;
  private readonly cleanups: Array<() => void> = [];

  /** className → 그 클래스가 붙은 활성 요소 집합 (focus/tooltip 등). */
  private readonly active = new Map<string, Set<HTMLElement>>();
  /** p-attribute 핸들러에 전달하는 컨텍스트. */
  private readonly pAttrCtx: PAttrContext;
  /** 이번 포인터 제스처 시작점 (클릭/드래그 판별용) */
  private downPoint?: { x: number; y: number };
  /** 이번 제스처가 임계값 이상 움직였는지 (드래그면 클릭으로 보지 않음) */
  private moved = false;

  constructor(element: HTMLElement, options: PugFrameCanvasOptions) {
    this.element = element;
    this.options = options;

    Object.assign(element.style, {
      position: element.style.position || "relative",
      overflow: "hidden",
      touchAction: "none",
    } satisfies Partial<CSSStyleDeclaration>);

    this.stage = document.createElement("div");
    Object.assign(this.stage.style, {
      position: "absolute",
      top: "0",
      left: "0",
      willChange: "transform",
    } satisfies Partial<CSSStyleDeclaration>);
    // Shadow DOM으로 주입 스타일을 격리한다.
    this.shadow = this.stage.attachShadow({ mode: "open" });
    element.appendChild(this.stage);

    this.pAttrCtx = {
      shadow: this.shadow,
      focusOnElement: (el) => this.focusOnElement(el),
      setActive: (el, className, exclusive) =>
        this.setActive(el, className, exclusive),
      toggleActive: (el, className) => this.toggleActive(el, className),
      clearActiveOutside: (className, target) =>
        this.clearActiveOutside(className, target),
    };

    this.fallback = this.createFallback();
    element.appendChild(this.fallback);

    if (options.controls !== false) {
      this.controls = createControls({
        onZoomIn: () => this.zoomFromCenter(BUTTON_ZOOM_STEP),
        onZoomOut: () => this.zoomFromCenter(1 / BUTTON_ZOOM_STEP),
        onReset: () => {
          this.camera.reset();
          this.applyCamera();
        },
      });
      element.appendChild(this.controls.element);
    }

    this.bindInteractions();
    this.applyCamera();
  }

  async render(pugframe?: string): Promise<void> {
    const source = pugframe ?? this.options.pugframe;
    if (source === undefined) {
      this.showFallback("표시할 pug-frame 소스가 없습니다.");
      return;
    }

    try {
      const content = looksLikeUrl(source) ? await fetchText(source) : source;
      const { html, css } = renderParts(content, { embedded: true });
      // 사용자가 쓴 Tailwind 유틸리티 CSS를 런타임에 생성한다.
      // generateStyles 뒤에 두어 동일 specificity에서 유틸리티가 기본값을 이긴다.
      const tailwindCss = await generateTailwind(html);
      // 새 컨텐츠로 교체되므로 이전 활성 상태(focus/tooltip 등)를 버린다.
      this.active.clear();
      this.shadow.innerHTML = `<style>${css}\n${pAttrStyles()}\n${tailwindCss}</style>${html}`;
      this.hideFallback();
    } catch (error) {
      this.showFallback(
        `pug-frame을 렌더링할 수 없습니다: ${(error as Error).message}`,
      );
    }
  }

  destroy(): void {
    for (const cleanup of this.cleanups) cleanup();
    this.cleanups.length = 0;
    this.controls?.destroy();
    this.stage.remove();
    this.fallback.remove();
  }

  // --- 내부 ---

  private applyCamera(): void {
    this.camera.applyTo(this.stage);
  }

  private zoomFromCenter(factor: number): void {
    this.camera.zoomAt(
      this.element.clientWidth / 2,
      this.element.clientHeight / 2,
      factor,
    );
    this.applyCamera();
  }

  /**
   * 클릭(탭) 대상을 등록된 p-attribute 핸들러로 디스패치한다.
   * - `[p-*]` 트리거에 맞으면 해당 핸들러의 `onTap`을 실행한다.
   * - 어떤 트리거에도 맞지 않으면 각 핸들러의 `onOutsideTap`으로 정리한다.
   */
  private handleClick(target: HTMLElement | null): void {
    for (const handler of pAttrHandlers) {
      const attr = `${P_ATTR_PREFIX}${handler.name}`;
      const trigger = target?.closest<HTMLElement>(`[${attr}]`);
      if (trigger && handler.onTap) {
        handler.onTap(trigger, trigger.getAttribute(attr) ?? "", this.pAttrCtx);
        return;
      }
    }
    for (const handler of pAttrHandlers) {
      handler.onOutsideTap?.(this.pAttrCtx, target);
    }
  }

  /** 주어진 요소를 뷰포트 중앙으로 카메라 이동·정렬한다. */
  private focusOnElement(el: HTMLElement): void {
    const vp = this.element.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const z = this.camera.zoom;
    // 화면 좌표 → stage 자연(비스케일) 좌표로 환산.
    this.camera.focusOn(
      {
        x: (er.left - vp.left - this.camera.x) / z,
        y: (er.top - vp.top - this.camera.y) / z,
        width: er.width / z,
        height: er.height / z,
      },
      vp.width,
      vp.height,
    );
    this.applyCamera();
  }

  /** 요소에 className을 붙여 활성 상태로 추적한다. exclusive면 같은 클래스의 이전 요소를 해제. */
  private setActive(el: HTMLElement, className: string, exclusive = false): void {
    let set = this.active.get(className);
    if (exclusive && set) {
      for (const prev of set) prev.classList.remove(className);
      set.clear();
    }
    if (!set) {
      set = new Set();
      this.active.set(className, set);
    }
    el.classList.add(className);
    set.add(el);
  }

  /** 요소의 활성 상태를 토글한다. */
  private toggleActive(el: HTMLElement, className: string): void {
    const set = this.active.get(className);
    if (set?.has(el)) {
      el.classList.remove(className);
      set.delete(el);
      return;
    }
    this.setActive(el, className);
  }

  /** className 활성 요소 중 target을 포함하지 않는 것만 해제한다. */
  private clearActiveOutside(
    className: string,
    target: HTMLElement | null,
  ): void {
    const set = this.active.get(className);
    if (!set) return;
    for (const el of [...set]) {
      if (target && el.contains(target)) continue;
      el.classList.remove(className);
      set.delete(el);
    }
  }

  private bindInteractions(): void {
    const el = this.element;

    const onPointerDown = (event: PointerEvent) => {
      el.setPointerCapture(event.pointerId);
      this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      this.downPoint = { x: event.clientX, y: event.clientY };
      this.moved = false;
      if (this.pointers.size === 2) {
        // 두 손가락이면 핀치 제스처 → 클릭 아님.
        this.moved = true;
        this.pinchDistance = this.currentPinchDistance();
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const prev = this.pointers.get(event.pointerId);
      if (!prev) return;
      const next = { x: event.clientX, y: event.clientY };

      if (this.downPoint && !this.moved) {
        const moved = Math.hypot(
          next.x - this.downPoint.x,
          next.y - this.downPoint.y,
        );
        if (moved > CLICK_MOVE_THRESHOLD) this.moved = true;
      }

      if (this.pointers.size === 1) {
        this.camera.panBy(next.x - prev.x, next.y - prev.y);
        this.applyCamera();
      }
      this.pointers.set(event.pointerId, next);

      if (this.pointers.size === 2) {
        this.handlePinch();
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      const wasSingle = this.pointers.size === 1;
      this.pointers.delete(event.pointerId);
      if (this.pointers.size < 2) this.pinchDistance = 0;
      // 움직임 없는 단일 포인터 탭이면 클릭으로 처리한다.
      if (wasSingle && !this.moved) {
        const target = this.shadow.elementFromPoint(
          event.clientX,
          event.clientY,
        ) as HTMLElement | null;
        this.handleClick(target);
      }
      this.downPoint = undefined;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      const factor = Math.exp(-event.deltaY * WHEEL_ZOOM_INTENSITY);
      this.camera.zoomAt(
        event.clientX - rect.left,
        event.clientY - rect.top,
        factor,
      );
      this.applyCamera();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    this.cleanups.push(() => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("wheel", onWheel);
    });
  }

  private handlePinch(): void {
    const distance = this.currentPinchDistance();
    if (this.pinchDistance === 0 || distance === 0) {
      this.pinchDistance = distance;
      return;
    }
    const factor = distance / this.pinchDistance;
    const rect = this.element.getBoundingClientRect();
    const mid = this.pinchMidpoint();
    this.camera.zoomAt(mid.x - rect.left, mid.y - rect.top, factor);
    this.applyCamera();
    this.pinchDistance = distance;
  }

  private twoPointers(): Array<{ x: number; y: number }> {
    return [...this.pointers.values()].slice(0, 2);
  }

  private currentPinchDistance(): number {
    const [a, b] = this.twoPointers();
    if (!a || !b) return 0;
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  private pinchMidpoint(): { x: number; y: number } {
    const [a, b] = this.twoPointers();
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  private createFallback(): HTMLElement {
    const fallback = document.createElement("div");
    Object.assign(fallback.style, {
      position: "absolute",
      inset: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      textAlign: "center",
      color: "#900",
      font: "14px/1.5 sans-serif",
      background: "#fff",
      zIndex: "1",
    } satisfies Partial<CSSStyleDeclaration>);
    return fallback;
  }

  private showFallback(message: string): void {
    this.fallback.textContent = message;
    this.fallback.style.display = "flex";
  }

  private hideFallback(): void {
    this.fallback.style.display = "none";
    this.fallback.textContent = "";
  }
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}
