# playground

`@pug-frame/playground` 는 브라우저에서 pug-frame 문법을 직접 편집하며 결과를 즉시 확인하는 데모 웹사이트다.

왼쪽 코드 에디터에 입력한 pug-frame 을 오른쪽 canvas 뷰어로 실시간 변환해 보여주며, **작성한 코드는 URL 쿼리에 인코딩되어 URL만으로 상태를 재현·공유**할 수 있다.

## 구성

- **왼쪽 (에디터)** — CodeMirror 6 기반 코드 편집기. Pug 레거시 모드로 근사 문법 하이라이팅을 제공한다.
- **오른쪽 (미리보기)** — `@pug-frame/canvas` 의 `pugFrameCanvas` 뷰어를 그대로 임베드한다. 드래그로 팬, 휠/핀치로 줌, 우하단 버튼으로 조작하며 `p-focus`·`p-tooltip` 등 인터랙션 attribute 도 동작한다.
- **상단 헤더** — `리셋`(기본 샘플로 되돌리기), `URL 복사`(현재 코드가 담긴 공유 URL 을 클립보드로 복사).

## 실행

- 개발 서버: `npx nx run playground:dev` 후 브라우저에서 확인.
- 정적 빌드: `npx nx run playground:build` → `packages/playground/dist` 산출.

`@pug-frame/canvas` 의 빌드 산출물(dist)에 의존하므로, dev/build 타깃은 `^build` 를 선행 실행해 canvas 를 먼저 빌드한다.

## URL 공유 방식

- 편집 내용은 디바운스(약 300ms) 후 쿼리 파라미터 `c` 에 반영된다. 예: `/?c=<encoded>`.
- 인코딩은 UTF-8 → base64url 이다. 한글 등 비-ASCII 문자를 안전하게 담기 위함이며, `+`/`/`/`=` 를 URL-safe 문자로 치환한다.
- 페이지 로드 시 `c` 파라미터가 있으면 그 값을 디코딩해 에디터를 채우고, 없으면 기본 샘플을 표시한다.
- 히스토리를 오염시키지 않도록 편집 중 URL 갱신은 `history.replaceState` 로 처리한다.

관련 문법은 [syntax 문서](./syntax.md), 뷰어 동작은 [canvas 문서](./canvas.md)를 참고한다.
