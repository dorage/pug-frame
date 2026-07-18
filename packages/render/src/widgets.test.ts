import { describe, expect, it } from "vitest";
import {
  calendarHtml,
  monthpickHtml,
  yearpickHtml,
  ratingHtml,
  progressHtml,
  resolveWidgets,
} from "./widgets.js";

describe("calendarHtml", () => {
  it("p-date의 연·월 헤더와 선택일을 표시한다", () => {
    const html = calendarHtml("2026-07-16");
    expect(html).toContain("2026.07");
    expect(html).toContain('pf-cal-day--sel">16<');
  });
  it("요일 헤더 7개를 포함한다", () => {
    expect((calendarHtml("2026-07-16").match(/pf-cal-dow/g) ?? []).length).toBe(7);
  });
  it("p-date가 없으면 오늘 기준으로 선택일을 표시한다", () => {
    const now = new Date();
    const html = calendarHtml(null);
    expect(html).toContain(`pf-cal-day--sel">${now.getDate()}<`);
  });
});

describe("monthpickHtml / yearpickHtml", () => {
  it("선택 월을 강조한다", () => {
    expect(monthpickHtml("2026-03")).toContain('pf-pick-cell--sel">3월<');
    expect(monthpickHtml("2026-03")).toContain("2026");
  });
  it("선택 연을 강조하고 12년을 그린다", () => {
    const html = yearpickHtml("2026");
    expect(html).toContain('pf-pick-cell--sel">2026<');
    expect((html.match(/class="pf-pick-cell/g) ?? []).length).toBe(12);
  });
});

describe("ratingHtml", () => {
  it("p-star 개수만큼 별을 채운다", () => {
    expect((ratingHtml("3").match(/pf-star--on/g) ?? []).length).toBe(3);
    expect((ratingHtml("3").match(/pf-star/g) ?? []).length).toBe(5 + 3); // 5 span + 3 --on 매치
  });
  it("범위를 벗어나면 clamp한다", () => {
    expect((ratingHtml("9").match(/pf-star--on/g) ?? []).length).toBe(5);
    expect((ratingHtml("-2").match(/pf-star--on/g) ?? []).length).toBe(0);
  });
  it("값이 없으면 0개다", () => {
    expect((ratingHtml(null).match(/pf-star--on/g) ?? []).length).toBe(0);
  });
});

describe("progressHtml", () => {
  it("p-progress를 폭으로 반영하고 clamp한다", () => {
    expect(progressHtml("50")).toContain("width:50%");
    expect(progressHtml("150")).toContain("width:100%");
    expect(progressHtml("-10")).toContain("width:0%");
    expect(progressHtml(null)).toContain("width:0%");
  });
});

describe("resolveWidgets", () => {
  it("toggle p-on이면 modifier와 knob를 넣는다", () => {
    const out = resolveWidgets('<div class="pf-toggle" p-on></div>');
    expect(out).toContain("pf-toggle--on");
    expect(out).toContain("pf-toggle-knob");
  });
  it("toggle p-on이 없으면 modifier 없이 knob만 넣는다", () => {
    const out = resolveWidgets('<div class="pf-toggle"></div>');
    expect(out).not.toContain("pf-toggle--on");
    expect(out).toContain("pf-toggle-knob");
  });
  it("checkbox p-on이면 modifier를 넣는다", () => {
    expect(resolveWidgets('<div class="pf-checkbox" p-on></div>')).toContain(
      "pf-checkbox--on",
    );
    expect(resolveWidgets('<div class="pf-checkbox"></div>')).not.toContain(
      "pf-checkbox--on",
    );
  });
});
