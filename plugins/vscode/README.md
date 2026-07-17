# pug-frame for VS Code

VS Code **기본 마크다운 프리뷰**에서 `pug-frame` 코드블록을 팬/줌 가능한 캔버스 와이어프레임으로 렌더링하는 확장. 코어 렌더링은 [`@pug-frame/canvas`](../../docs/canvas.md)를 그대로 소비한다.

자세한 설명은 [docs/vscode.md](../../docs/vscode.md)를 참고한다.

## 사용법

마크다운 노트에 `pug-frame` 언어의 코드블록을 작성하고 프리뷰(`Markdown: Open Preview`)를 열면 캔버스로 렌더링된다.

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

## 설정

- `pugFrame.canvasHeight` — 코드블록 캔버스 높이(px). 기본 480.
- `pugFrame.showControls` — 이동/줌 버튼 표시 여부. 기본 켜짐.

## 빌드

```bash
npx nx run canvas:build                 # canvas·render dist 생성 (선행 필요)
npm run build --workspace pug-frame-vscode
```

- `out/extension.js` — 확장 호스트에서 도는 markdown-it 플러그인.
- `media/pug-frame-preview.js` — 프리뷰 웹뷰에서 도는 캔버스 렌더러(@pug-frame/canvas 번들 포함).

두 산출물 모두 릴리스 자산이라 저장소에 커밋하지 않는다(`.gitignore`). 개발 중에는 `npm run dev --workspace pug-frame-vscode`로 watch 모드를 쓴다.
