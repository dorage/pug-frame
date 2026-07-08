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
- 클릭(탭): 움직임이 `CLICK_MOVE_THRESHOLD = 5`px 미만인 단일 포인터를 클릭으로 보고 focus를 처리한다(드래그와 구분).

## focus

`focus` attribute를 가진 요소를 클릭하면 그 값(id)을 가진 요소로 카메라를 이동한다.

- 트리거: `button(focus='main-2')`처럼 `focus="<id>"`를 가진 요소(또는 그 조상)를 클릭.
- 카메라: 줌을 기본값 1로 되돌리고, 대상 요소를 뷰포트 중앙에 정렬한다(`Camera.focusOn`).
- 표시: focus된 요소에 붉은 outline과 id 라벨(좌상단 바깥)을 붙인다. 이 스타일은 Shadow 내부에 주입되므로 줌에 따라 스케일되어 항상 요소 크기와 일치한다. 프레임이 focus되면 기본 검은 id 라벨은 감추고 붉은 라벨만 남긴다.
- 해제: focus된 요소 바깥(다른 프레임·회색 배경 등)을 클릭하면 focus가 취소된다.
- 대상 id는 렌더 시점의 Shadow 안에서 찾는다. 새로 `render()`하면 focus 상태는 초기화된다.

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
