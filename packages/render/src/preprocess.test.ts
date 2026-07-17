import { describe, expect, it } from "vitest";
import { preprocess } from "./preprocess.js";

describe("preprocess", () => {
  it("태그 뒤 텍스트를 표준 Pug처럼 그대로 통과시킨다", () => {
    expect(preprocess("div Rescene")).toBe("div Rescene");
  });

  it("따옴표는 특별하게 다루지 않고 리터럴로 통과시킨다", () => {
    expect(preprocess('div "Rescene"')).toBe('div "Rescene"');
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
    expect(preprocess("button Next")).toBe("button Next");
  });

  it("들여쓰기를 보존한다", () => {
    const input = ["mobile", "    header", "        div Rescene"].join("\n");
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

  it("프레임 키워드의 #id를 보존한다", () => {
    expect(preprocess("mobile#main-1")).toBe("div.frame.frame--mobile#main-1");
  });

  it("일반 태그의 #id를 보존한다", () => {
    expect(preprocess("div#foo")).toBe("div#foo");
  });

  it("한 줄 attribute와 텍스트를 함께 처리한다", () => {
    expect(preprocess("button(p-focus='main-2') Next")).toBe(
      "button(p-focus='main-2') Next",
    );
  });

  it("여러 줄 attribute 블록은 변환 없이 통과시킨다", () => {
    const input = [
      "        button(",
      "            p-focus='main-2'",
      "        ) Next",
    ].join("\n");
    expect(preprocess(input)).toBe(input);
  });
});
