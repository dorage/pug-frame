# @pug-frame/canvas

웹페이지 내 작은 영역에서 pug-frame을 렌더링하고, 드래그·휠·터치·버튼으로 카메라(팬/줌)를 조작하는 뷰어 컴포넌트. 프레임워크에 종속되지 않는 vanilla TS이며 `@pug-frame/render`를 재사용한다.

## 도메인

- 고정 크기가 아니라 **카메라 이동/확대**로 넓은 캔버스를 좁은 영역에서 탐색한다.
- 렌더는 `@pug-frame/render`의 `renderParts(source, { embedded: true })` 결과를 **Shadow DOM**에 주입해 호스트 페이지 스타일과 격리한다.
- 카메라는 `stage` 요소에 `transform: translate(x, y) scale(zoom)`을 적용해 구현한다(transform-origin `0 0`).

## 설치 / 브라우저 사용 주의

- `@pug-frame/canvas`의 lib 빌드는 `@pug-frame/render`(및 pug 하위 패키지)를 번들에 포함하고 `assert`/`util`/`process`를 폴리필하므로, 소비자는 추가 설정 없이 브라우저에서 사용할 수 있다.
- 개발 데모는 `npx nx run canvas:dev`로 실행한다(소스를 직접 로드하므로 `demo/vite.config.ts`에서 Node 폴리필을 적용한다).

## API

### `pugFrameCanvas(target, options?)`

대상 DOM 요소(또는 selector)를 pug-frame 렌더링 캔버스로 만든다.

- 매개변수 `target` (HTMLElement | string): DOM 요소 직접 전달, 또는 selector 문자열. selector면 항상 **첫 번째 매치**를 캔버스로 사용한다.
- 매개변수 `options.pugframe` (string, 선택): pug-frame 소스. URL 링크(`http`/`https`) 또는 pug-frame 컨텐츠.
- 매개변수 `options.controls` (boolean, 선택): 이동/줌 물리 버튼 표시 여부. 기본 `true`.
- 반환 (PugFrameCanvas): 캔버스 인스턴스.
- 예외: selector로 요소를 찾지 못하면 오류를 던진다.

### `PugFrameCanvas` 인스턴스

- `element` (HTMLElement, readonly): 대상 요소(뷰포트).
- `render(pugframe?)` (=> Promise<void>): pug-frame을 렌더링한다.
- `destroy()` (=> void): 이벤트 리스너와 추가한 DOM을 정리한다.

### `render(pugframe?)`

- 매개변수 `pugframe` (string, 선택): 렌더할 소스.
- 소스 우선순위: `render` 인자 > 생성자 `options.pugframe`.
- URL 판별: 공백 없이 `http`/`https`로 시작하면 URL로 보고 `fetch` 후 body text를 사용한다. 그 외에는 컨텐츠로 취급한다.
- 실패 처리: 소스가 없거나(둘 다 미제공), fetch 실패, 렌더 예외 시 뷰포트에 fallback 메시지를 표시한다.
- 반환: Promise (URL fetch 때문에 비동기).

## 인터랙션

Pointer Events로 마우스와 터치를 통합 처리한다.

- 드래그 팬: 포인터 하나를 누른 채 이동하면 이동량만큼 카메라를 옮긴다.
- 핀치 줌: 두 포인터의 거리 변화로 두 포인터 중점을 기준으로 줌한다.
- 휠 줌: 커서 아래 지점을 고정한 채 줌한다(`WHEEL_ZOOM_INTENSITY = 0.0015`).
- 물리 버튼: 줌 인 / 줌 아웃 / 리셋. 버튼 줌 배율은 `BUTTON_ZOOM_STEP = 1.2`이며 캔버스 중심을 기준으로 한다.
- 클릭(탭): 움직임이 `CLICK_MOVE_THRESHOLD = 5`px 미만인 단일 포인터를 클릭으로 보고 `p-*` 인터랙션 attribute(`p-focus` 등)를 처리한다(드래그와 구분).

## p-attribute 처리

`p-`로 시작하는 pug-frame 전용 인터랙션 attribute는 canvas 내부의 **레지스트리**(`src/pAttributes.ts`)로 처리한다. 각 핸들러(`p-focus`, `p-tooltip`, `p-scrollbar-x`, `p-scrollbar-y`)는 Shadow에 주입할 CSS와(있다면) 탭/바깥탭 동작을 제공하며, canvas는 접두 `p-`만 알고 이름별 분기는 레지스트리에 위임한다. `p-scrollbar-*`처럼 `onTap`이 없는 CSS 전용 핸들러도 둘 수 있다. 핸들러가 주입하는 스타일은 모두 Shadow 내부에 들어가 stage transform과 함께 줌에 비례해 스케일된다.

새 인터랙션 attribute를 추가하려면 `pAttributes.ts`에 `PAttrHandler`를 만들어 `pAttrHandlers` 목록에 넣으면 된다.

## p-focus

`p-focus` attribute를 가진 요소를 클릭하면 그 값(id)을 가진 요소로 카메라를 이동한다.

- 트리거: `button(p-focus='main-2')`처럼 `p-focus="<id>"`를 가진 요소(또는 그 조상)를 클릭.
- 카메라: 줌을 기본값 1로 되돌리고, 대상 요소를 뷰포트 중앙에 정렬한다(`Camera.focusOn`).
- 표시: focus된 요소에 붉은 outline과 id 라벨(좌상단 바깥)을 붙인다. 이 스타일은 Shadow 내부에 주입되므로 줌에 따라 스케일되어 항상 요소 크기와 일치한다. 프레임이 focus되면 기본 검은 id 라벨은 감추고 붉은 라벨만 남긴다.
- 해제: focus된 요소 바깥(다른 프레임·회색 배경 등)을 클릭하면 focus가 취소된다.
- 대상 id는 렌더 시점의 Shadow 안에서 찾는다. 새로 `render()`하면 focus 상태는 초기화된다.

## p-tooltip

`p-tooltip` attribute를 가진 요소에 마커와 말풍선을 붙인다.

- 마커: 요소의 **바깥쪽 오른쪽 상단**에 `*`를 항상 표시한다(`::before`).
- 표시: 요소에 마우스를 올리면(`:hover`) 또는 터치로 탭하면 attribute 값을 요소 위쪽 말풍선(`::after`, `content: attr(p-tooltip)`)으로 보여준다.
- 터치: 탭하면 말풍선이 토글되고(`.pf-tooltip-open`), 바깥을 탭하면 닫힌다.
- 마커·말풍선 스타일도 Shadow 내부에 주입되어 줌에 따라 스케일된다.
- 참고: 마커/말풍선이 `::before`/`::after`를 사용하므로, 같은 요소가 프레임 id 라벨이나 focus 라벨과 겹치면 표시가 충돌할 수 있다(드문 조합).

## p-scrollbar-x / p-scrollbar-y

`p-scrollbar-x` / `p-scrollbar-y` attribute를 가진 요소에 스크롤바를 **UI 요소로 그린다**(CSS 전용 핸들러).

- 스타일: 요소를 `position: relative; overflow: hidden`으로 만들고, thumb를 pseudo-element로 그린다. 세로는 `[p-scrollbar-y]::after`(오른쪽 세로 트랙 아래쪽 50%), 가로는 `[p-scrollbar-x]::before`(아래쪽 가로 트랙 왼쪽 50%). 트랙/thumb 두께는 16px, thumb는 검은색이다. x/y가 서로 다른 pseudo-element를 쓰므로 한 요소에 둘 다 붙어도 겹치지 않는다.
- 용도: 스크롤 가능 영역임을 와이어프레임 UI로 표현한다(컨텐츠는 잘림).
- **제약(설계상 확정)**: 실제 **제스처 스크롤은 지원하지 않는다**. canvas가 wheel(줌)·pointer(팬)을 가로채기도 하고, 목적 자체가 "스크롤바 모양"만 보여주는 것이다. thumb는 `pointer-events: none`으로 팬/클릭을 통과시킨다.

## Tailwind 런타임 유틸리티

렌더된 소스에 쓰인 임의의 Tailwind 유틸리티 클래스를 런타임에 생성해 Shadow DOM에 주입한다.

- 동작: `render()`가 렌더된 HTML에서 `class` 토큰을 수집하고, Tailwind v4 컴파일러(`src/tailwind.ts`)로 해당 유틸리티 CSS만 생성한 뒤 `generateStyles()`·`pAttrStyles()` **뒤에** 주입한다. 동일 specificity에서 소스 순서로 유틸리티가 기본 스타일을 이긴다.
- Shadow 격리: 전역 Tailwind는 Shadow에 침투하지 못하므로 반드시 Shadow 내부에 주입한다. Tailwind가 방출하는 `:root, :host { --색상/간격 변수 }` 덕분에 Shadow 안에서도 테마 변수가 정의된다.
- preflight(전역 리셋)는 제외해 프레임/요소 기본 스타일을 건드리지 않는다.
- 기본 테마(`theme.css`)는 `vite.config`의 `tailwindThemePlugin`이 `virtual:tailwind-theme` 가상 모듈로 제공한다(`?raw`가 CSS 특수 처리로 빈 문자열이 되는 문제를 우회).
- 정적 HTML 출력(CLI `render`)에는 Tailwind 유틸리티가 포함되지 않는다(canvas 전용).

## `Camera`

팬(translate)과 줌(scale) 상태를 관리하는 2D 카메라. 직접 사용할 일은 드물지만 export되어 있다.

### `new Camera(options?)`

- 매개변수 `options.minZoom` (number, 선택): 최소 줌. 기본 `0.1`.
- 매개변수 `options.maxZoom` (number, 선택): 최대 줌. 기본 `8`.

### 상태와 메서드

- `x`, `y`, `zoom` (number): 현재 카메라 상태.
- `applyTo(stage)`: 카메라 상태를 요소의 CSS transform으로 반영한다.
- `panBy(dx, dy)`: 화면 좌표 기준으로 이동한다.
- `zoomAt(px, py, factor)`: 뷰포트 좌표 `(px, py)`를 중심으로 줌하며, 해당 지점 아래 컨텐츠를 화면상 고정한다. `minZoom`/`maxZoom`으로 clamp된다.
- `reset()`: `x=0, y=0, zoom=1`로 되돌린다.
- `focusOn(rect, viewportW, viewportH)`: 줌을 1로 되돌리고 `rect`(stage 자연 좌표계의 요소 사각형) 중심을 뷰포트 중앙에 맞춘다. focus 기능이 사용한다.

## 사용 예시

```ts
import { pugFrameCanvas } from "@pug-frame/canvas";

// id가 pug-frame-canvas인 div를 캔버스로 지정
const canvas = pugFrameCanvas("#pug-frame-canvas", {
  pugframe: sourceString, // 또는 "https://example.com/frame.pf"
  controls: true,
});
await canvas.render();

// 생성자에 소스를 주지 않고 render에 직접 전달할 수도 있다
const canvas2 = pugFrameCanvas("#other");
await canvas2.render(sourceString);
```
