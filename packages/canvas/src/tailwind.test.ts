import { describe, expect, it } from "vitest";
import { extractClasses, generateTailwind } from "./tailwind";

describe("extractClasses", () => {
  it("class attribute 토큰을 중복 없이 모은다", () => {
    const html = '<div class="flex gap-4"><span class="flex text-small"></span></div>';
    expect(extractClasses(html).sort()).toEqual(["flex", "gap-4", "text-small"]);
  });

  it("class가 없으면 빈 배열을 반환한다", () => {
    expect(extractClasses("<div></div>")).toEqual([]);
  });
});

describe("generateTailwind", () => {
  it("사용된 유틸리티에 대한 CSS를 생성한다", async () => {
    const css = await generateTailwind(
      '<div class="flex gap-4 bg-blue-500"></div>',
    );
    expect(css).toContain("display: flex");
    expect(css).toContain("gap");
    // bg-blue-500은 theme의 --color-blue-500 변수를 참조한다.
    expect(css).toContain("background-color");
  });

  it("클래스가 없으면 빈 문자열을 반환한다", async () => {
    expect(await generateTailwind("<div></div>")).toBe("");
  });

  it("정의되지 않은 임의 클래스는 유틸리티를 만들지 않는다", async () => {
    const css = await generateTailwind('<div class="frame-body"></div>');
    // 우리 자체 클래스는 Tailwind 유틸리티가 아니므로 규칙이 생성되지 않는다.
    expect(css).not.toContain(".frame-body");
  });
});
