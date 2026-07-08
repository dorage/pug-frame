import { describe, expect, it } from "vitest";
import { Camera } from "./camera";

describe("Camera", () => {
  it("panBy는 이동을 누적한다", () => {
    const camera = new Camera();
    camera.panBy(10, 20);
    camera.panBy(5, -5);
    expect(camera.x).toBe(15);
    expect(camera.y).toBe(15);
  });

  it("zoomAt은 최소/최대 줌으로 clamp한다", () => {
    const camera = new Camera({ minZoom: 0.5, maxZoom: 2 });
    camera.zoomAt(0, 0, 100);
    expect(camera.zoom).toBe(2);
    camera.zoomAt(0, 0, 0.0001);
    expect(camera.zoom).toBe(0.5);
  });

  it("zoomAt은 지정한 지점 아래 컨텐츠를 화면상 고정한다", () => {
    const camera = new Camera();
    // 화면 좌표 (100,100) 아래의 월드 좌표
    const worldBefore = (100 - camera.x) / camera.zoom;
    camera.zoomAt(100, 100, 2);
    const screenAfter = worldBefore * camera.zoom + camera.x;
    expect(screenAfter).toBeCloseTo(100);
  });

  it("reset은 초기 상태로 되돌린다", () => {
    const camera = new Camera();
    camera.panBy(50, 50);
    camera.zoomAt(0, 0, 3);
    camera.reset();
    expect(camera).toMatchObject({ x: 0, y: 0, zoom: 1 });
  });

  it("focusOn은 줌을 1로 되돌리고 요소를 뷰포트 중앙에 정렬한다", () => {
    const camera = new Camera();
    camera.panBy(123, -45);
    camera.zoomAt(0, 0, 3);
    // 자연 좌표 (100,200)에 100x50 요소, 400x600 뷰포트
    camera.focusOn({ x: 100, y: 200, width: 100, height: 50 }, 400, 600);
    expect(camera.zoom).toBe(1);
    // 요소 중심 (150, 225)이 뷰포트 중심 (200, 300)에 오도록 이동
    expect(camera.x).toBe(50);
    expect(camera.y).toBe(75);
    const centerX = (150 + camera.x) * camera.zoom;
    const centerY = (225 + camera.y) * camera.zoom;
    expect(centerX).toBe(200);
    expect(centerY).toBe(300);
  });
});
