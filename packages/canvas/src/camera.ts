export interface CameraOptions {
  minZoom?: number;
  maxZoom?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 팬(translate)과 줌(scale) 상태를 관리하는 2D 카메라.
 * transform-origin을 0 0으로 두고 `translate(x,y) scale(zoom)`을 stage에 적용한다.
 */
export class Camera {
  x = 0;
  y = 0;
  zoom = 1;
  readonly minZoom: number;
  readonly maxZoom: number;

  constructor(options: CameraOptions = {}) {
    this.minZoom = options.minZoom ?? 0.1;
    this.maxZoom = options.maxZoom ?? 8;
  }

  /** 현재 카메라 상태를 stage 요소의 CSS transform으로 반영한다. */
  applyTo(stage: HTMLElement): void {
    stage.style.transformOrigin = "0 0";
    stage.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.zoom})`;
  }

  /** 화면 좌표계 기준으로 카메라를 이동한다. */
  panBy(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  /**
   * 뷰포트 좌표 (px, py)를 중심으로 줌한다.
   * 해당 지점 아래의 컨텐츠가 화면상 같은 위치에 머물도록 x,y를 보정한다.
   */
  zoomAt(px: number, py: number, factor: number): void {
    const nextZoom = clamp(this.zoom * factor, this.minZoom, this.maxZoom);
    const applied = nextZoom / this.zoom;
    this.x = px - (px - this.x) * applied;
    this.y = py - (py - this.y) * applied;
    this.zoom = nextZoom;
  }

  reset(): void {
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
  }
}
