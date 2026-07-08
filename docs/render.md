# @pug-frame/render

pug-frame 문법을 HTML로 렌더링하는 코어 라이브러리. CLI와 canvas가 모두 이 패키지를 재사용한다.

## 도메인: pug-frame 문법

pug-frame은 Pug 유사 문법으로 와이어프레임을 기술한다. 표준 Pug와의 핵심 차이는 **하나의 문서에 여러 화면(screen)을 담을 수 있다**는 점이다.

- 들여쓰기 기반 중첩: Pug와 동일하게 들여쓰기로 부모-자식 관계를 표현한다.
- 최상위 블록 = 화면 하나: 들여쓰기 0의 프레임 키워드가 새 화면을 시작하며, 한 문서에 여러 개를 둘 수 있다.
- 따옴표 텍스트: `div "Rescene"`처럼 요소의 텍스트를 따옴표로 지정한다. (표준 Pug의 `div Rescene`와 다른 지점)

### 키워드

- 프레임 키워드: `mobile`, `tablet`, `desktop`. 화면의 프레임 크기를 정한다.
- 구조 키워드: `header`, `body`, `footer`. 프레임 내부의 시맨틱 영역이다.
- 리프 태그: `div`, `button` 등. 표준 태그로 그대로 렌더된다.

### HTML 매핑

구조 키워드를 실제 `<header>`/`<body>`/`<footer>` 태그로 렌더하면 중첩 `<body>`가 브라우저에서 무효 처리되므로, **클래스가 붙은 div로 매핑**한다.

- `mobile` → `<div class="frame frame--mobile">` (tablet/desktop 동일 패턴)
- `header` → `<div class="frame-header">`
- `body` → `<div class="frame-body">`
- `footer` → `<div class="frame-footer">`
- `div`, `button` → 그대로

### 스타일

- 프레임과 구조 영역: 검은색 border + 흰색 배경.
- `button`: 검은색 배경 + 흰색 텍스트.
- 여러 화면은 `.canvas` 컨테이너 위에 flex-wrap으로 나열된다.

### 렌더링 파이프라인

1. `preprocess`: 각 줄의 따옴표 제거 + 키워드→클래스 매핑(들여쓰기 보존).
2. 컴파일: pug 하위 패키지(`pug-lexer`→`pug-parser`→`pug-linker`→`pug-code-gen`→`pug-runtime`)를 직접 조합해 HTML 생성. pug 메인 패키지의 `pug-load`(fs, is-core-module)를 우회하므로 Node·브라우저 양쪽에서 동작한다.
3. `.canvas`로 감싸고, 전체 문서(`render`) 또는 fragment+CSS(`renderParts`)로 반환한다.

## API

### `render(source, options?)`

pug-frame 소스를 자기완결적 단일 HTML 문서 문자열로 렌더한다. CLI가 사용한다.

- 매개변수 `source` (string): pug-frame 소스.
- 매개변수 `options.title` (string, 선택): `<title>` 값. 기본값 `"pug-frame"`.
- 반환 (string): `<!DOCTYPE html>`로 시작하고 `<style>`에 인라인 CSS를 포함한 완전한 문서.

### `renderParts(source, options?)`

전체 문서가 아닌, fragment HTML과 CSS를 **분리**해 반환한다. 작은 영역에 임베드하는 canvas가 사용한다.

- 매개변수 `source` (string): pug-frame 소스.
- 매개변수 `options.embedded` (boolean, 선택): 임베드용 스타일 여부. 기본 `false`. `true`면 전역 `body` 리셋과 `min-height: 100vh`를 생략한다.
- 반환 `html` (string): `.canvas` 래퍼를 포함한 fragment HTML.
- 반환 `css` (string): fragment에 적용할 CSS.

### `renderFragment(source)`

`preprocess` → 컴파일 → `.canvas` 래핑까지 수행한 fragment HTML을 만든다.

- 매개변수 `source` (string): pug-frame 소스.
- 반환 (string): `<div class="canvas">…</div>` fragment.

### `generateStyles(options?)`

캔버스/프레임/구조/버튼 스타일 문자열을 생성한다. 프레임별 크기 규칙은 `FRAME_SIZES`에서 자동 생성된다.

- 매개변수 `options.embedded` (boolean, 선택): 기본 `false`. `true`면 전역 리셋/`100vh`를 생략한다.
- 반환 (string): CSS 문자열.

### `preprocess(source)`

pug-frame 문법을 표준 pug 소스로 변환한다. 들여쓰기는 보존하고 태그 토큰/텍스트만 바꾼다.

- 매개변수 `source` (string): pug-frame 소스.
- 반환 (string): 표준 pug 소스.

### `mapTag(tag)`

태그 토큰 하나를 pug 태그 표현으로 변환한다.

- 매개변수 `tag` (string): 태그 토큰(예: `mobile`, `header`, `div`).
- 반환 (string): 프레임/구조 키워드면 `div.클래스`, 그 외는 원본 그대로.

### 값과 타입

- `FRAME_SIZES` (object): 프레임 타입 → `{ width, height }` 맵. 새 프레임 타입을 추가하는 **확장 지점**이다.
- `FRAME_TYPES` (FrameType[]): 프레임 키워드 배열.
- `FrameType` (type): `"mobile" | "tablet" | "desktop"`.
- `FrameSize` (type): `{ width: number; height: number }`.
- `RenderOptions`, `RenderPartsOptions`, `RenderParts`, `StyleOptions` (type): 각 함수의 옵션/반환 형태.

## 사용 예시

```ts
import { render, renderParts } from "@pug-frame/render";

const source = `mobile
    header
        div "Rescene"
    body
        div "Ilsan!"
        button "Next"`;

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
