import { describe, expect, it, vi } from "vitest";
import {
  pAttrHandlers,
  pAttrStyles,
  type PAttrContext,
} from "./pAttributes";

function handler(name: string) {
  const found = pAttrHandlers.find((h) => h.name === name);
  if (!found) throw new Error(`핸들러 없음: ${name}`);
  return found;
}

function mockContext(overrides: Partial<PAttrContext> = {}): PAttrContext {
  return {
    shadow: {
      getElementById: vi.fn(() => null),
    } as unknown as ShadowRoot,
    focusOnElement: vi.fn(),
    setActive: vi.fn(),
    toggleActive: vi.fn(),
    clearActiveOutside: vi.fn(),
    ...overrides,
  };
}

describe("pAttrHandlers", () => {
  it("focus와 tooltip 핸들러를 등록한다", () => {
    expect(pAttrHandlers.map((h) => h.name)).toEqual(
      expect.arrayContaining(["focus", "tooltip"]),
    );
  });

  it("합쳐진 스타일에 focus와 tooltip 셀렉터를 포함한다", () => {
    const styles = pAttrStyles();
    expect(styles).toContain(".pf-focused");
    expect(styles).toContain("[p-tooltip]::before");
    expect(styles).toContain("attr(p-tooltip)");
  });
});

describe("focus 핸들러", () => {
  it("onTap은 값(id)의 요소로 카메라를 이동하고 활성화한다", () => {
    const el = document.createElement("div");
    const ctx = mockContext({
      shadow: {
        getElementById: vi.fn(() => el),
      } as unknown as ShadowRoot,
    });
    handler("focus").onTap?.(document.createElement("button"), "main-2", ctx);
    expect(ctx.focusOnElement).toHaveBeenCalledWith(el);
    expect(ctx.setActive).toHaveBeenCalledWith(el, "pf-focused", true);
  });

  it("대상 id가 없으면 아무것도 하지 않는다", () => {
    const ctx = mockContext();
    handler("focus").onTap?.(document.createElement("button"), "nope", ctx);
    expect(ctx.focusOnElement).not.toHaveBeenCalled();
  });

  it("onOutsideTap은 target을 포함하지 않는 focus를 해제한다", () => {
    const ctx = mockContext();
    const target = document.createElement("div");
    handler("focus").onOutsideTap?.(ctx, target);
    expect(ctx.clearActiveOutside).toHaveBeenCalledWith("pf-focused", target);
  });
});

describe("tooltip 핸들러", () => {
  it("onTap은 활성 클래스를 토글한다", () => {
    const ctx = mockContext();
    const el = document.createElement("div");
    handler("tooltip").onTap?.(el, "설명", ctx);
    expect(ctx.toggleActive).toHaveBeenCalledWith(el, "pf-tooltip-open");
  });

  it("onOutsideTap은 바깥 탭 시 말풍선을 닫는다", () => {
    const ctx = mockContext();
    handler("tooltip").onOutsideTap?.(ctx, null);
    expect(ctx.clearActiveOutside).toHaveBeenCalledWith("pf-tooltip-open", null);
  });
});
