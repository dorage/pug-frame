# pug-frame for Obsidian

Obsidian 노트의 `pug-frame` 코드블록을 팬/줌 가능한 캔버스 와이어프레임으로 렌더링하는 3rd-party 플러그인. 코어 렌더링은 [`@pug-frame/canvas`](./canvas.md)를 그대로 소비하며 별도 렌더 로직을 두지 않는다.

패키지 위치는 `plugins/obsidian`이다. 모노레포 규칙상 `packages/*`는 코어 라이브러리, `plugins/*`는 외부 도구 연결용 패키지다.

## 도메인

- Obsidian 마크다운 렌더러에 `pug-frame` 코드블록 프로세서를 등록한다(`registerMarkdownCodeBlockProcessor`).
- 코드블록은 자체 높이가 없으므로, 설정된 높이의 뷰포트 `div`를 만들어 그 안에서 `pugFrameCanvas`로 렌더링한다.
- 코드블록 소스 문자열을 `options.pugframe`으로 넘긴다. 렌더 실패·소스 부재는 canvas가 뷰포트에 fallback 메시지로 처리한다.
- 각 코드블록은 `MarkdownRenderChild`로 감싸 Obsidian 생명주기(뷰 언로드/재렌더)에 맞춰 `canvas.destroy()`로 리스너·DOM을 정리한다.
- Live Preview(편집 모드)에서는 CodeMirror 문법 트리 파싱 범위를 앞당기는 에디터 확장을 함께 등록한다(`registerEditorExtension`). 아래 "Live Preview 사전 파싱" 참고.

## Live Preview 사전 파싱

읽기 모드와 달리 Live Preview는 CodeMirror 데코레이션으로 코드블록 위젯을 만든다. Obsidian 내부 구현상 다음 두 조건이 겹치면 긴 코드블록이 렌더링되지 않고 원본 소스가 그대로 보인다.

- Obsidian은 데코레이션을 만들기 전에 문법 트리를 뷰포트 끝 +2000자까지만 파싱한다(`ensureSyntaxTree(state, viewport.to + 2000, 20)`).
- 코드블록 위젯은 닫는 펜스 라인(`HyperMD-codeblock-end`)을 만났을 때 비로소 생성된다.

즉 코드블록이 뷰포트보다 충분히 길면, 스크롤이 닫는 ```` ``` ```` 근처에 도달하기 전까지 위젯이 만들어지지 않는다. Obsidian 코어의 동작이라 코드블록 프로세서 쪽에서는 손댈 수 없다.

플러그인은 `livePreviewParseAhead` CM6 확장으로 이를 보정한다.

- 뷰포트나 문서가 바뀌면 문서를 훑어 뷰포트 끝 지점에 걸쳐 있는 `pug-frame` 코드블록을 찾는다.
- 그 블록의 닫는 펜스까지 아직 파싱되지 않았으면(`syntaxTreeAvailable`) `forceParsing`으로 파싱을 앞당긴다.
- `forceParsing`은 내부에서 `dispatch`를 호출하므로 업데이트 주기 밖(다음 틱)에서 실행한다.
- 시간 예산(50ms) 안에 끝나지 않으면 진행된 만큼을 유지한 채 다음 틱에 이어서 파싱한다(최대 20회).
- 대상은 `pug-frame` 블록으로 한정하고, 스캔은 뷰포트 끝을 지나면 중단해 큰 노트에서도 비용이 문서 크기에 비례하지 않게 한다.

이 확장은 `@codemirror/language`·`@codemirror/view`·`@codemirror/state`를 사용한다. 세 모듈 모두 Obsidian이 런타임에 제공하므로 esbuild `external`로 두고 번들에 포함하지 않는다.

## 사용법

노트에 `pug-frame` 언어의 코드블록을 작성하면 읽기 모드와 Live Preview 모두에서 캔버스로 렌더링된다.

````markdown
```pug-frame
mobile#main-1
    header
        div Rescene
    body
        div Ilsan!
        button(p-focus='main-2') Next
```
````

- 팬(드래그)·줌(휠/버튼)으로 탐색한다.
- `p-focus` 지정 요소를 클릭하면 해당 id 프레임으로 카메라가 이동한다.
- `p-tooltip` 지정 요소는 오른쪽 상단에 `*` 마커가 붙고, 호버·터치 시 말풍선으로 내용을 보여준다.
- 문법 전체는 [syntax 문서](./syntax.md)를 참고한다.

## 설정

플러그인 설정 탭에서 조정한다.

- `Canvas height` — 코드블록 캔버스 높이(px). 기본 480. 양의 정수만 반영된다.
- `Show controls` — 이동/줌 버튼 표시 여부. 기본 켜짐. `pugFrameCanvas`의 `controls` 옵션으로 전달된다.

## 빌드

플러그인은 워크스페이스(`plugins/*`)에 포함되어 `@pug-frame/canvas`를 심볼릭 링크로 참조하고, esbuild가 canvas·render·pug 하위 패키지를 `main.js` 하나로 번들한다(`obsidian`/`electron`만 external).

- `npm install` — 리포 루트에서 워크스페이스 링크 생성.
- `npx nx run canvas:build` — canvas(및 render) dist 생성. 플러그인 번들의 입력이므로 선행되어야 한다.
- `npm run build --workspace pug-frame-obsidian` — 타입체크(tsc) 후 esbuild 번들.

산출물 `main.js`는 릴리스 자산이라 저장소에 커밋하지 않는다(`.gitignore`). Obsidian 설치 시 `manifest.json`, `main.js`, `styles.css`를 vault의 `.obsidian/plugins/pug-frame/`에 둔다.
