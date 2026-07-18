import { describe, expect, it } from "vitest";
import { iconToSvg, resolveIcons } from "./icons.js";

describe("iconToSvg", () => {
  it("알려진 아이콘 이름을 인라인 SVG로 변환한다", () => {
    const svg = iconToSvg("user");
    expect(svg).toContain("<svg");
    expect(svg).toContain("lucide-user");
    expect(svg).toContain('stroke="currentColor"');
  });

  it("kebab-case 이름을 PascalCase export로 조회한다", () => {
    expect(iconToSvg("chevron-right")).toContain("lucide-chevron-right");
  });

  it("알 수 없는 이름은 자리표시자 SVG를 반환한다", () => {
    const svg = iconToSvg("definitely-not-an-icon");
    expect(svg).toContain("pf-icon-missing");
  });
});

describe("resolveIcons", () => {
  it("p-icon 요소 여는 태그 뒤에 SVG를 삽입한다", () => {
    const html = '<div class="pf-circle" p-icon="user"></div>';
    const out = resolveIcons(html);
    expect(out).toContain('<div class="pf-circle" p-icon="user"><svg');
  });

  it("작은따옴표 p-icon도 처리한다", () => {
    const out = resolveIcons("<div p-icon='camera'></div>");
    expect(out).toContain("lucide-camera");
  });

  it("p-icon이 없는 요소는 그대로 둔다", () => {
    const html = '<div class="pf-circle"></div>';
    expect(resolveIcons(html)).toBe(html);
  });
});
