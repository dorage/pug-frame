import { describe, expect, it } from "vitest";
import { preprocess } from "./preprocess.js";

describe("preprocess", () => {
  it("따옴표로 감싼 텍스트에서 따옴표를 제거한다", () => {
    expect(preprocess('div "Rescene"')).toBe("div Rescene");
  });

  it("작은따옴표도 제거한다", () => {
    expect(preprocess("div 'Ilsan!'")).toBe("div Ilsan!");
  });

  it("프레임 키워드를 클래스 div로 매핑한다", () => {
    expect(preprocess("mobile")).toBe("div.frame.frame--mobile");
  });

  it("구조 키워드를 클래스 div로 매핑한다", () => {
    expect(preprocess("header")).toBe("div.frame-header");
    expect(preprocess("body")).toBe("div.frame-body");
    expect(preprocess("footer")).toBe("div.frame-footer");
  });

  it("일반 태그는 그대로 둔다", () => {
    expect(preprocess('button "Next"')).toBe("button Next");
  });

  it("들여쓰기를 보존한다", () => {
    const input = ["mobile", "    header", '        div "Rescene"'].join("\n");
    const expected = [
      "div.frame.frame--mobile",
      "    div.frame-header",
      "        div Rescene",
    ].join("\n");
    expect(preprocess(input)).toBe(expected);
  });

  it("빈 줄을 보존한다", () => {
    expect(preprocess("mobile\n\nmobile")).toBe(
      "div.frame.frame--mobile\n\ndiv.frame.frame--mobile",
    );
  });
});
