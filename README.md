# pug-frame

Pug 유사 문법으로 작성한 와이어프레임을 하나의 캔버스로 렌더링하는 도구 모음.

표준 Pug와 달리 **하나의 문서에 여러 화면**을 담을 수 있고, 각 화면은 프레임(예: mobile) 크기의 박스로 캔버스 위에 나열된다.

## 패키지

NX 모노레포로 구성되며, 모든 패키지는 `packages/*`에 있고 `@pug-frame/*` 스코프를 쓴다.

- `@pug-frame/render` — pug-frame 문법을 HTML로 렌더링하는 코어 라이브러리.
- `@pug-frame/cli` — pug-frame 파일을 HTML로 렌더링하는 커맨드라인 도구.
- `@pug-frame/canvas` — 웹페이지 내 작은 영역에서 pug-frame을 렌더링하고 팬/줌하는 뷰어 컴포넌트.

## 문서

각 패키지의 API와 도메인 정보는 `docs/`에 있다.

- [render](./docs/render.md) — pug-frame 문법(도메인)과 렌더 API. 다른 패키지의 기반이다.
- [cli](./docs/cli.md) — `pug-frame` CLI 사용법과 옵션.
- [canvas](./docs/canvas.md) — `pugFrameCanvas` API, 카메라/인터랙션.

## 시작하기

```bash
npm install
npx nx run-many -t build   # 전체 빌드
npx nx run-many -t test    # 전체 테스트
```

- CLI 실행: `npx nx run cli:dev -- examples/first.pf` (자세한 사용법은 [cli 문서](./docs/cli.md)).
- canvas 데모: `npx nx run canvas:dev` 후 브라우저에서 확인.

## 문법 예시

```pug-frame
mobile
    header
        div "Rescene"
    body
        div "Ilsan!"
        button "Next"
    footer
        div "2026.07.07"
```

- 들여쓰기 기반 중첩(Pug와 동일).
- 최상위 블록 하나가 화면 하나. 문서에 여러 개를 둘 수 있다.
- `div "텍스트"`처럼 따옴표로 요소 텍스트를 지정한다.

문법에 대한 자세한 설명은 [render 문서](./docs/render.md)를 참고한다.
