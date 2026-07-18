# @pug-frame/render

pug-frame 문법을 HTML로 렌더링하는 코어 라이브러리. CLI와 canvas가 모두 이 패키지를 재사용한다.

## 도메인: pug-frame 문법

pug-frame은 Pug 위에 와이어프레임용 의미를 얹은 DSL이다. 표준 Pug와의 핵심 차이는 **하나의 문서에 여러 화면(screen)을 담을 수 있다**는 점이다.

문법 전체(기본 Pug + `p-focus`/`p-tooltip` 등 추가 문법)는 [syntax 문서](./syntax.md)에 정리되어 있다. 여기서는 렌더가 문법을 **어떤 HTML로 매핑**하는지에 집중한다.

- 프레임 키워드(`mobile`/`tablet`/`desktop`), 구조 키워드(`header`/`nav`/`main`/`body`/`footer`)는 클래스 div로 매핑된다.
- 와이어프레임 요소 키워드(`circle`/`image`/`video`/`search`/`navigation`/`spinner`/`dropdown`/`item`/`rating`/`progressbar`/`toggle`/`checkbox`/`calendar`/`monthpick`/`yearpick`)는 `.pf-*` 클래스 div로 매핑된다. `link`는 `<a>`로 매핑된다.
- 그 외 리프 태그(`div`, `section`, `button`, `h1`~`h6`, `a` 등)와 `#id`·attribute는 Pug가 처리하는 대로 보존된다.
- `p-`로 시작하는 pug-frame 전용 **인터랙션** attribute(`p-focus`, `p-tooltip`, `p-scrollbar-x/y`)는 **정적 출력에서 제거**된다. canvas처럼 이를 해석하는 임베드 소비자(`renderParts`의 `embedded: true`)에서만 보존된다.
- **컨텐츠** attribute는 렌더 단계에서 실제 내용/상태로 반영된다: `p-icon`(lucide 인라인 SVG), 값 기반 위젯의 `p-date`/`p-month`/`p-year`/`p-star`/`p-progress`/`p-on`. 생성된 마크업은 정적/임베드 양쪽에 남고 attribute 자체는 정적 출력에서 제거된다.

### HTML 매핑

구조 키워드를 실제 `<header>`/`<body>`/`<footer>` 태그로 렌더하면 중첩 `<body>`가 브라우저에서 무효 처리되므로, **클래스가 붙은 div로 매핑**한다.

- `mobile` → `<div class="frame frame--mobile">` (tablet/desktop 동일 패턴)
- `header` → `<div class="frame-header">`
- `nav` → `<div class="frame-nav">`
- `main` → `<div class="frame-main">`
- `body` → `<div class="frame-body">`
- `footer` → `<div class="frame-footer">`
- `circle` → `<div class="pf-circle">` (원형 아바타 자리표시자)
- `image` → `<div class="pf-image">` (이미지 박스 자리표시자)
- `div`, `section`, `button` → 그대로

### 스타일

- 프레임과 구조 영역: 검은색 border + 흰색 배경.
- `button`: 검은색 배경 + 흰색 텍스트. `.active`를 붙이면 반전(흰 배경 + 검은 테두리)되어 선택된 탭/버튼을 표시한다.
- 여러 화면은 `.canvas` 컨테이너 위에 flex-wrap으로 나열된다.
- 프레임 ID 라벨: `id`를 가진 프레임은 `::before`로 프레임 **바깥쪽 위**에 id 텍스트를 표시한다. 라벨이 잘리지 않도록 콘텐츠 클리핑(`overflow: hidden`)은 프레임이 아니라 내부 구조 영역에 둔다.
- 기본 유틸리티 클래스: `.flex`, `.text-small`. Tailwind 없이도 항상 동작한다.
- 요소 자리표시자·위젯: `.pf-circle`/`.pf-image`/`.pf-video`/`.pf-search`/`.pf-navigation`/`.pf-spinner`/`.pf-dropdown`/`.pf-rating`/`.pf-progress`/`.pf-toggle`/`.pf-checkbox`/`.pf-calendar`/`.pf-monthpick`/`.pf-yearpick` 및 제목(`h1`~`h6`)·링크(`a`).
- 임의의 Tailwind 유틸리티는 `@pug-frame/canvas`가 런타임에 생성해 Shadow DOM에 주입한다(정적 출력에는 포함되지 않는다). [canvas 문서](./canvas.md#tailwind-런타임-유틸리티) 참고.

lucide 아이콘(`p-icon`)은 `lucide-static` 패키지의 SVG를 인라인으로 사용한다.

### 렌더링 파이프라인

1. `preprocess`: 각 줄의 선행 키워드→클래스 매핑(들여쓰기·텍스트 보존).
2. 컴파일: pug 하위 패키지(`pug-lexer`→`pug-parser`→`pug-linker`→`pug-code-gen`→`pug-runtime`)를 직접 조합해 HTML 생성. pug 메인 패키지의 `pug-load`(fs, is-core-module)를 우회하므로 Node·브라우저 양쪽에서 동작한다.
3. `resolveIcons` → `resolveWidgets`: `p-icon`에 lucide SVG를 삽입하고, 값 기반 위젯(calendar/rating/progress/toggle 등)의 내부 마크업을 `p-*` 값으로 생성한다(attribute 제거 전에 수행하므로 정적/임베드 양쪽에 남는다).
4. `.canvas`로 감싸고, 정적 출력이면 `p-*` 인터랙션 attribute를 제거한 뒤 전체 문서(`render`) 또는 fragment+CSS(`renderParts`)로 반환한다.

## API

### `render(source, options?)`

pug-frame 소스를 자기완결적 단일 HTML 문서 문자열로 렌더한다. CLI가 사용한다.

- 매개변수 `source` (string): pug-frame 소스.
- 매개변수 `options.title` (string, 선택): `<title>` 값. 기본값 `"pug-frame"`.
- 반환 (string): `<!DOCTYPE html>`로 시작하고 `<style>`에 인라인 CSS를 포함한 완전한 문서.

### `renderParts(source, options?)`

전체 문서가 아닌, fragment HTML과 CSS를 **분리**해 반환한다. 작은 영역에 임베드하는 canvas가 사용한다.

- 매개변수 `source` (string): pug-frame 소스.
- 매개변수 `options.embedded` (boolean, 선택): 임베드용 스타일 여부. 기본 `false`. `true`면 전역 `body` 리셋과 `min-height: 100vh`를 생략하고, `p-*` 인터랙션 attribute를 fragment에 **보존**한다(기본 `false`면 제거).
- 반환 `html` (string): `.canvas` 래퍼를 포함한 fragment HTML.
- 반환 `css` (string): fragment에 적용할 CSS.

### `renderFragment(source, options?)`

`preprocess` → 컴파일 → `.canvas` 래핑까지 수행한 fragment HTML을 만든다.

- 매개변수 `source` (string): pug-frame 소스.
- 매개변수 `options.keepInteractive` (boolean, 선택): `p-*` 인터랙션 attribute 보존 여부. 기본 `false` — 정적 출력용으로 제거한다. canvas 등 이를 해석하는 소비자만 `true`로 준다.
- 반환 (string): `<div class="canvas">…</div>` fragment.

### `generateStyles(options?)`

캔버스/프레임/구조/버튼 스타일 문자열을 생성한다. 프레임별 크기 규칙은 `FRAME_SIZES`에서 자동 생성된다.

- 매개변수 `options.embedded` (boolean, 선택): 기본 `false`. `true`면 전역 리셋/`100vh`를 생략한다.
- 반환 (string): CSS 문자열.

### `preprocess(source)`

pug-frame 문법을 표준 pug 소스로 변환한다. 들여쓰기와 텍스트는 보존하고 선행 태그 토큰만 바꾼다.

- 매개변수 `source` (string): pug-frame 소스.
- 반환 (string): 표준 pug 소스.

### `mapTag(tag)`

태그 토큰 하나를 pug 태그 표현으로 변환한다.

- 매개변수 `tag` (string): 태그 토큰(예: `mobile`, `header`, `circle`, `div`).
- 반환 (string): 프레임/구조/요소 키워드면 `div.클래스`, 그 외는 원본 그대로.

### `iconToSvg(name)`

lucide 아이콘 이름을 인라인 SVG 문자열로 변환한다.

- 매개변수 `name` (string): lucide kebab-case 이름(예: `user`).
- 반환 (string): SVG 문자열. 알 수 없는 이름은 점선 사각형 자리표시자를 반환한다.

### `resolveIcons(html)`

컴파일된 HTML에서 `p-icon`을 가진 요소 안에 lucide SVG를 삽입한다.

- 매개변수 `html` (string): 컴파일된 HTML.
- 반환 (string): 아이콘이 삽입된 HTML. `renderFragment`가 attribute 제거 전에 호출한다.

### `resolveWidgets(html)`

컴파일된 HTML에서 값 기반 위젯의 내부 마크업을 생성/치환한다.

- 매개변수 `html` (string): 컴파일된 HTML.
- 반환 (string): 위젯 내부가 채워진 HTML. `resolveIcons` 다음, attribute 제거 전에 호출한다.
- 개별 생성기 `calendarHtml`/`monthpickHtml`/`yearpickHtml`/`ratingHtml`/`progressHtml`도 export된다.

### 값과 타입

- `FRAME_SIZES` (object): 프레임 타입 → `{ width, height }` 맵. 새 프레임 타입을 추가하는 **확장 지점**이다.
- `FRAME_TYPES` (FrameType[]): 프레임 키워드 배열.
- `SECTION_CLASSES` (object): 구조 키워드(`header`/`nav`/`main`/`body`/`footer`) → 클래스 맵. 확장 지점.
- `ELEMENT_CLASSES` (object): 요소 키워드(`circle`/`image`/`video`/`rating`/`calendar` 등) → `.pf-*` 클래스 맵. 확장 지점.
- `ELEMENT_TAGS` (object): 다른 HTML 태그로 매핑되는 요소 키워드(`link` → `a`) 맵. 확장 지점.
- `FrameType` (type): `"mobile" | "tablet" | "desktop"`.
- `FrameSize` (type): `{ width: number; height: number }`.
- `RenderOptions`, `RenderPartsOptions`, `RenderFragmentOptions`, `RenderParts`, `StyleOptions` (type): 각 함수의 옵션/반환 형태.

## 사용 예시

```ts
import { render, renderParts } from "@pug-frame/render";

const source = `mobile
    header
        div Rescene
    body
        div Ilsan!
        button Next`;

// 전체 문서
const html = render(source, { title: "wireframe" });

// 임베드용 조각
const { html: fragment, css } = renderParts(source, { embedded: true });
```

## 프레임 타입 추가

`src/frames.ts`의 `FRAME_SIZES`에 항목을 추가하면 `preprocess`와 `generateStyles` 양쪽에 자동 반영된다.

```ts
export const FRAME_SIZES = {
  mobile: { width: 375, height: 812 },
  watch: { width: 198, height: 242 }, // 추가
} as const;
```
