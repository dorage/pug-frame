import { renderParts } from "@pug-frame/render";
import { Camera } from "./camera";
import { createControls, type Controls } from "./controls";

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
      this.shadow.innerHTML = `<style>${css}</style>${html}`;
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

  private bindInteractions(): void {
    const el = this.element;

    const onPointerDown = (event: PointerEvent) => {
      el.setPointerCapture(event.pointerId);
      this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (this.pointers.size === 2) {
        this.pinchDistance = this.currentPinchDistance();
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const prev = this.pointers.get(event.pointerId);
      if (!prev) return;
      const next = { x: event.clientX, y: event.clientY };

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
      this.pointers.delete(event.pointerId);
      if (this.pointers.size < 2) this.pinchDistance = 0;
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
