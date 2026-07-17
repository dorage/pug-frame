# pug-frame for Obsidian

Obsidian 노트의 `pug-frame` 코드블록을 팬/줌 가능한 캔버스 와이어프레임으로 렌더링하는 3rd-party 플러그인. 코어 렌더링은 [`@pug-frame/canvas`](./canvas.md)를 그대로 소비하며 별도 렌더 로직을 두지 않는다.

패키지 위치는 `plugins/obsidian`이다. 모노레포 규칙상 `packages/*`는 코어 라이브러리, `plugins/*`는 외부 도구 연결용 패키지다.

## 도메인

- Obsidian 마크다운 렌더러에 `pug-frame` 코드블록 프로세서를 등록한다(`registerMarkdownCodeBlockProcessor`).
- 코드블록은 자체 높이가 없으므로, 설정된 높이의 뷰포트 `div`를 만들어 그 안에서 `pugFrameCanvas`로 렌더링한다.
- 코드블록 소스 문자열을 `options.pugframe`으로 넘긴다. 렌더 실패·소스 부재는 canvas가 뷰포트에 fallback 메시지로 처리한다.
- 각 코드블록은 `MarkdownRenderChild`로 감싸 Obsidian 생명주기(뷰 언로드/재렌더)에 맞춰 `canvas.destroy()`로 리스너·DOM을 정리한다.

## 사용법

노트에 `pug-frame` 언어의 코드블록을 작성하면 읽기 모드에서 캔버스로 렌더링된다.

````markdown
```pug-frame
mobile#main-1
    header
        div "Rescene"
    body
        div "Ilsan!"
        button(p-focus='main-2') "Next"
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
