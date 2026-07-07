import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pugFrameCanvas } from "./pugFrameCanvas";

const SAMPLE = `mobile
    body
        div "Hi"
`;

/** stage 요소(shadowRoot를 가진 자식)를 찾아 shadow 내부 HTML을 반환한다. */
function shadowHtml(host: HTMLElement): string {
  const stage = [...host.children].find(
    (child): child is HTMLElement => child instanceof HTMLElement && !!child.shadowRoot,
  );
  return stage?.shadowRoot?.innerHTML ?? "";
}

function fallbackText(host: HTMLElement): string {
  const fallback = [...host.children].find(
    (child) =>
      child instanceof HTMLElement && child.style.position === "absolute" && !child.shadowRoot,
  ) as HTMLElement | undefined;
  return fallback?.style.display !== "none" ? (fallback?.textContent ?? "") : "";
}

describe("pugFrameCanvas", () => {
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement("div");
    host.id = "canvas-host";
    document.body.appendChild(host);
  });

  afterEach(() => {
    host.remove();
    vi.restoreAllMocks();
  });

  it("selector로 첫 번째 매치 요소를 캔버스로 사용한다", () => {
    const canvas = pugFrameCanvas("#canvas-host");
    expect(canvas.element).toBe(host);
  });

  it("요소를 찾지 못하면 에러를 던진다", () => {
    expect(() => pugFrameCanvas("#nope")).toThrow();
  });

  it("컨텐츠를 shadow DOM에 렌더한다", async () => {
    const canvas = pugFrameCanvas(host);
    await canvas.render(SAMPLE);
    expect(shadowHtml(host)).toContain('class="canvas"');
    expect(shadowHtml(host)).toContain("<style>");
  });

  it("render 인자가 생성자 options.pugframe보다 우선한다", async () => {
    const canvas = pugFrameCanvas(host, { pugframe: 'mobile\n    body\n        div "옵션"' });
    await canvas.render('mobile\n    body\n        div "인자"');
    expect(shadowHtml(host)).toContain("인자");
    expect(shadowHtml(host)).not.toContain("옵션");
  });

  it("소스가 없으면 fallback 메시지를 표시한다", async () => {
    const canvas = pugFrameCanvas(host);
    await canvas.render();
    expect(fallbackText(host)).toContain("소스가 없습니다");
  });

  it("URL 소스는 fetch 후 body text를 사용한다", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, text: async () => SAMPLE }));
    vi.stubGlobal("fetch", fetchMock);

    const canvas = pugFrameCanvas(host);
    await canvas.render("https://example.com/frame.pf");

    expect(fetchMock).toHaveBeenCalledWith("https://example.com/frame.pf");
    expect(shadowHtml(host)).toContain('class="canvas"');
  });

  it("fetch 실패 시 fallback을 표시한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 404, text: async () => "" })),
    );
    const canvas = pugFrameCanvas(host);
    await canvas.render("https://example.com/missing.pf");
    expect(fallbackText(host)).toContain("렌더링할 수 없습니다");
  });

  it("controls:false면 버튼을 만들지 않는다", () => {
    pugFrameCanvas(host, { controls: false });
    expect(host.querySelector("button")).toBeNull();
  });

  it("controls 기본값은 버튼을 만든다", () => {
    pugFrameCanvas(host);
    expect(host.querySelector("button")).not.toBeNull();
  });
});
