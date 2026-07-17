# pug-frame for Obsidian

Obsidian 노트 안의 `pug-frame` 코드블록을 팬/줌 가능한 캔버스 와이어프레임으로 렌더링하는 플러그인.

코어 렌더링은 모노레포의 [`@pug-frame/canvas`](../../packages/canvas)를 그대로 사용한다.

## 사용법

노트에 아래처럼 `pug-frame` 언어로 코드블록을 작성하면 읽기 모드에서 캔버스로 렌더링된다.

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

- 팬(드래그)·줌(휠/버튼)으로 캔버스를 탐색한다.
- `button(p-focus='main-2')`처럼 `p-focus`를 지정하면 클릭 시 해당 id로 카메라가 이동한다.
- `div(p-tooltip='설명')`처럼 `p-tooltip`을 지정하면 오른쪽 상단 `*` 마커와 호버/터치 말풍선을 표시한다.
- 문법 전체는 [syntax 문서](../../docs/syntax.md) 참고.

## 설정

- `Canvas height` — 코드블록 캔버스 높이(px). 기본 480.
- `Show controls` — 이동/줌 버튼 표시 여부. 기본 켜짐.

## 개발 / 빌드

이 플러그인은 모노레포 워크스페이스(`plugins/*`)에 포함되어 `@pug-frame/canvas`를 심볼릭 링크로 참조한다.

```bash
# 리포 루트에서: 의존성 설치
npm install

# canvas(및 render) 빌드가 선행되어야 한다
npx nx run canvas:build

# 플러그인 빌드 (tsc 타입체크 + esbuild 번들 → main.js)
npm run build --workspace pug-frame-obsidian
```

- `main.js`는 릴리스 산출물이라 저장소에 커밋하지 않는다(`.gitignore`).
- Obsidian에 설치할 때는 `manifest.json`, `main.js`, `styles.css`를 vault의 `.obsidian/plugins/pug-frame/`에 둔다.
