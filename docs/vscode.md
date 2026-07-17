# pug-frame for VS Code

VS Code **기본 마크다운 프리뷰**에서 `pug-frame` 코드블록을 팬/줌 가능한 캔버스 와이어프레임으로 렌더링하는 3rd-party 확장. 코어 렌더링은 [`@pug-frame/canvas`](./canvas.md)를 그대로 소비하며 별도 렌더 로직을 두지 않는다.

패키지 위치는 `plugins/vscode`이다. 모노레포 규칙상 `packages/*`는 코어 라이브러리, `plugins/*`는 외부 도구 연결용 패키지다.

## 도메인

VS Code 마크다운 프리뷰는 확장 호스트(Node)와 프리뷰 웹뷰(브라우저)로 분리되어 있어, 확장도 두 부분으로 나뉜다.

- 확장 호스트: `extendMarkdownIt`으로 markdown-it의 `fence` 규칙을 가로챈다. `pug-frame` 코드블록을 만나면 소스를 `data-pugframe` 속성에 실은 placeholder `div.pug-frame-canvas`로 바꾼다. `@pug-frame/canvas`는 DOM이 필요하므로 이 단계에서는 렌더하지 않는다(`markdown.markdownItPlugins` 기여점).
- 프리뷰 웹뷰: 주입된 프리뷰 스크립트가 placeholder를 찾아 `pugFrameCanvas`로 렌더링한다(`markdown.previewScripts` 기여점). 소스 문자열은 `data-pugframe`에서 `decodeURIComponent`로 복원해 `options.pugframe`으로 넘긴다.
- 소스 전달은 `encodeURIComponent`로 인코딩해 웹뷰 DOM 속성으로 안전하게 넘긴다. 렌더 실패·소스 부재는 canvas가 뷰포트에 fallback 메시지로 처리한다.
- 설정(`pugFrame.canvasHeight`, `pugFrame.showControls`)은 확장 호스트에서 읽어 placeholder의 `data-height`/`data-controls` 속성으로 실어 보낸다. 웹뷰는 workspace 설정에 직접 접근하지 않는다.
- 프리뷰는 편집마다 DOM을 다시 그리므로, 웹뷰 스크립트는 `MutationObserver`로 새로 나타난 placeholder를 감시해 렌더한다. 소스가 바뀐 요소는 기존 캔버스를 `destroy()` 후 다시 렌더해 리스너 누수를 막는다.

## 사용법

마크다운 파일에 `pug-frame` 언어의 코드블록을 작성하고 프리뷰(`Markdown: Open Preview`, `Cmd/Ctrl+Shift+V`)를 열면 캔버스로 렌더링된다.

````markdown
```pug-frame
mobile#main-1
    header
        div Rescene
    body
        div Ilsan!
        button(focus='main-2') Next
```
````

- 팬(드래그)·줌(휠/버튼)으로 탐색한다.
- `focus` 지정 요소를 클릭하면 해당 id 프레임으로 카메라가 이동한다.
- 문법 전체는 [syntax 문서](./syntax.md)를 참고한다.

## 설정

VS Code 설정(`settings.json` 또는 설정 UI의 `pug-frame`)에서 조정한다.

- `pugFrame.canvasHeight` — 코드블록 캔버스 높이(px). 기본 480. 양의 정수만 반영된다.
- `pugFrame.showControls` — 이동/줌 버튼 표시 여부. 기본 켜짐. `pugFrameCanvas`의 `controls` 옵션으로 전달된다.

설정 변경은 프리뷰를 다시 열거나 새로고침하면 반영된다.

## 빌드

플러그인은 워크스페이스(`plugins/*`)에 포함되어 `@pug-frame/canvas`를 심볼릭 링크로 참조하고, esbuild가 두 번들을 만든다.

- `npm install` — 리포 루트에서 워크스페이스 링크 생성.
- `npx nx run canvas:build` — canvas(및 render) dist 생성. 프리뷰 번들의 입력이므로 선행되어야 한다.
- `npm run build --workspace pug-frame-vscode` — 타입체크(tsc) 후 esbuild 번들.

산출물은 두 개다.

- `out/extension.js` — 확장 호스트용 markdown-it 플러그인. `vscode`만 external인 CommonJS 번들.
- `media/pug-frame-preview.js` — 프리뷰 웹뷰용 캔버스 렌더러. canvas·render·pug 하위 패키지를 하나로 번들한 IIFE.

두 산출물 모두 릴리스 자산이라 저장소에 커밋하지 않는다(`.gitignore`). 개발 중에는 `npm run dev --workspace pug-frame-vscode`로 watch 모드를 쓴다.
