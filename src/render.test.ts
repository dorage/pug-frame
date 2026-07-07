import { describe, expect, it } from "vitest";
import { render } from "./render.js";

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
});
