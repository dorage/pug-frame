import { describe, expect, it } from "vitest";
import { render, renderParts } from "./render.js";

const TWO_SCREENS = `mobile
    header
        div "Rescene"
    body
        div "Ilsan!"
        button "Next"
    footer
        div "2026.07.07"

mobile
    header
        div "Rescene"
    body
        div "Yaho!"
        button "Prev"
    footer
        div "2026.07.07"
`;

describe("render", () => {
  it("완전한 HTML 문서를 생성한다", () => {
    const html = render(TWO_SCREENS);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<style>");
  });

  it("캔버스 하나에 프레임 2개를 렌더한다", () => {
    const html = render(TWO_SCREENS);
    expect(html.match(/class="canvas"/g)).toHaveLength(1);
    expect(html.match(/class="frame frame--mobile"/g)).toHaveLength(2);
  });

  it("따옴표 텍스트를 요소 내용으로 렌더한다", () => {
    const html = render(TWO_SCREENS);
    expect(html).toContain("Rescene");
    expect(html).toContain("Ilsan!");
    expect(html).not.toContain('"Rescene"');
  });

  it("버튼을 button 요소로 렌더한다", () => {
    const html = render(TWO_SCREENS);
    expect(html).toContain("<button>Next</button>");
    expect(html).toContain("<button>Prev</button>");
  });

  it("body는 nested <body> 대신 클래스 div로 렌더한다", () => {
    const html = render(TWO_SCREENS);
    expect(html).toContain('class="frame-body"');
  });

  it("프레임 #id를 id 속성으로 렌더한다", () => {
    const html = render("mobile#main-1\n    body\n        div Ilsan!");
    expect(html).toContain('class="frame frame--mobile"');
    expect(html).toContain('id="main-1"');
  });

  it("focus attribute를 요소에 렌더한다", () => {
    const html = render("mobile\n    body\n        button(focus='main-2') Next");
    expect(html).toContain('focus="main-2"');
    expect(html).toContain(">Next</button>");
  });
});

describe("renderParts", () => {
  it("fragment HTML과 CSS를 분리해 반환한다", () => {
    const { html, css } = renderParts(TWO_SCREENS);
    expect(html).toContain('class="canvas"');
    expect(html).not.toContain("<!DOCTYPE html>");
    expect(css).toContain(".frame--mobile");
  });

  it("embedded 옵션은 min-height:100vh를 생략한다", () => {
    expect(renderParts(TWO_SCREENS, { embedded: true }).css).not.toContain(
      "100vh",
    );
    expect(renderParts(TWO_SCREENS, { embedded: false }).css).toContain(
      "100vh",
    );
  });
});
