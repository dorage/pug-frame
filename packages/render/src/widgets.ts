/**
 * 값 기반 와이어프레임 위젯의 내부 마크업 생성.
 *
 * `p-icon`과 마찬가지로 **컨텐츠 지시자**다. render 단계에서 `p-*` 값을 읽어
 * 내부 구조(달력 그리드, 별점, 진행바 등)를 생성하므로 정적/canvas 양쪽에서
 * 동일하게 보인다. 스타일은 styles.ts의 `.pf-*` 규칙이 담당한다.
 *
 * 지원 위젯:
 * - `.pf-calendar`  (p-date="YYYY-MM-DD") — 없으면 오늘
 * - `.pf-monthpick` (p-month="YYYY-MM")   — 없으면 이번 달
 * - `.pf-yearpick`  (p-year="YYYY")       — 없으면 올해
 * - `.pf-rating`    (p-star=0~5)          — 없으면 0, 범위 밖은 clamp
 * - `.pf-progress`  (p-progress=0~100)    — 없으면 0, 범위 밖은 clamp
 * - `.pf-toggle`    (p-on)                — 없으면 off
 * - `.pf-checkbox`  (p-on)                — 없으면 off
 */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** 달력 그리드(헤더 + 요일 + 날짜 셀). 선택일 강조. */
export function calendarHtml(dateStr: string | null): string {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-based
  let selected = now.getDate();
  if (dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (Number.isFinite(y)) year = y;
    if (Number.isFinite(m)) month = m - 1;
    if (Number.isFinite(d)) selected = d;
  }

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dow = WEEKDAYS.map((w) => `<div class="pf-cal-dow">${w}</div>`).join("");
  let cells = "";
  for (let i = 0; i < firstDow; i++) {
    cells += `<div class="pf-cal-day pf-cal-day--empty"></div>`;
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const sel = day === selected ? " pf-cal-day--sel" : "";
    cells += `<div class="pf-cal-day${sel}">${day}</div>`;
  }

  const header = `${year}.${String(month + 1).padStart(2, "0")}`;
  return `<div class="pf-cal-head">${header}</div><div class="pf-cal-grid">${dow}${cells}</div>`;
}

/** 12개월 선택 그리드. 선택 월 강조. */
export function monthpickHtml(monthStr: string | null): string {
  const now = new Date();
  let year = now.getFullYear();
  let selected = now.getMonth() + 1;
  if (monthStr) {
    const [y, m] = monthStr.split("-").map(Number);
    if (Number.isFinite(y)) year = y;
    if (Number.isFinite(m)) selected = m;
  }
  const cells = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const sel = m === selected ? " pf-pick-cell--sel" : "";
    return `<div class="pf-pick-cell${sel}">${m}월</div>`;
  }).join("");
  return `<div class="pf-cal-head">${year}</div><div class="pf-pick-grid">${cells}</div>`;
}

/** 선택 연도 주변 12년 그리드. 선택 연도 강조. */
export function yearpickHtml(yearStr: string | null): string {
  const selected = yearStr && Number.isFinite(Number(yearStr))
    ? Number(yearStr)
    : new Date().getFullYear();
  const start = selected - 5;
  const cells = Array.from({ length: 12 }, (_, i) => {
    const y = start + i;
    const sel = y === selected ? " pf-pick-cell--sel" : "";
    return `<div class="pf-pick-cell${sel}">${y}</div>`;
  }).join("");
  return `<div class="pf-pick-grid">${cells}</div>`;
}

/** 별 5개. 채운 개수 = clamp(p-star, 0, 5). */
export function ratingHtml(starStr: string | null): string {
  const n = clamp(Math.round(Number(starStr ?? 0)) || 0, 0, 5);
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    const on = i <= n ? " pf-star--on" : "";
    stars += `<span class="pf-star${on}">★</span>`;
  }
  return stars;
}

/** 진행바 채움. 폭 = clamp(p-progress, 0, 100)%. */
export function progressHtml(pctStr: string | null): string {
  const pct = clamp(Number(pctStr ?? 0) || 0, 0, 100);
  return `<div class="pf-progress-fill" style="width:${pct}%"></div>`;
}

/** 여는 태그 문자열에서 attribute 값을 읽는다. 없으면 null. */
function readAttr(openTag: string, name: string): string | null {
  const m = new RegExp(`\\b${name}="([^"]*)"`).exec(openTag);
  return m ? m[1] : null;
}

/** 여는 태그에 boolean attribute가 있는지. */
function hasAttr(openTag: string, name: string): boolean {
  return new RegExp(`\\b${name}(?=[\\s=>])`).test(openTag);
}

/** 여는 태그의 class="..."에 modifier 클래스를 추가한다. */
function addClass(openTag: string, className: string): string {
  return openTag.replace(
    /class="([^"]*)"/,
    (_m, classes) => `class="${classes} ${className}"`,
  );
}

/** 특정 pf 클래스를 가진 요소의 여는 태그 뒤에 gen(openTag) 결과를 삽입한다. */
function fillInner(
  html: string,
  className: string,
  gen: (openTag: string) => string,
): string {
  const re = new RegExp(
    `<[a-zA-Z][\\w-]*\\b[^>]*\\bclass="[^"]*\\b${className}\\b[^"]*"[^>]*>`,
    "g",
  );
  return html.replace(re, (openTag) => `${openTag}${gen(openTag)}`);
}

/**
 * 컴파일된 HTML에서 값 기반 위젯의 내부 마크업을 생성/치환한다.
 * `resolveIcons` 다음, `p-*` 제거 이전에 호출한다.
 */
export function resolveWidgets(html: string): string {
  let out = html;
  out = fillInner(out, "pf-calendar", (t) => calendarHtml(readAttr(t, "p-date")));
  out = fillInner(out, "pf-monthpick", (t) => monthpickHtml(readAttr(t, "p-month")));
  out = fillInner(out, "pf-yearpick", (t) => yearpickHtml(readAttr(t, "p-year")));
  out = fillInner(out, "pf-rating", (t) => ratingHtml(readAttr(t, "p-star")));
  out = fillInner(out, "pf-progress", (t) => progressHtml(readAttr(t, "p-progress")));

  // toggle: on이면 modifier 추가 + knob 삽입.
  out = out.replace(
    /<[a-zA-Z][\w-]*\b[^>]*\bclass="[^"]*\bpf-toggle\b[^"]*"[^>]*>/g,
    (openTag) => {
      const on = hasAttr(openTag, "p-on");
      const tag = on ? addClass(openTag, "pf-toggle--on") : openTag;
      return `${tag}<span class="pf-toggle-knob"></span>`;
    },
  );

  // checkbox: on이면 modifier만 추가(체크 표시는 CSS).
  out = out.replace(
    /<[a-zA-Z][\w-]*\b[^>]*\bclass="[^"]*\bpf-checkbox\b[^"]*"[^>]*>/g,
    (openTag) =>
      hasAttr(openTag, "p-on") ? addClass(openTag, "pf-checkbox--on") : openTag,
  );

  return out;
}
