# pug-frame

Pug 유사 문법으로 작성한 와이어프레임을 하나의 HTML 캔버스로 렌더링하는 CLI 도구.

표준 Pug와 달리 **하나의 문서에 여러 화면**을 담을 수 있고, 각 화면은 프레임(예: mobile) 크기의 박스로 캔버스 위에 나열된다.

## 설치 / 빌드

```bash
npm install
npm run build
```

## 사용법

```bash
# 개발 중 실행 (빌드 없이)
npm run dev -- examples/first.pf

# 빌드 후 실행
pug-frame examples/first.pf            # → examples/first.html 생성
pug-frame examples/first.pf -o out.html
```

출력 경로를 생략하면 입력 파일명의 확장자를 `.html`로 바꿔 같은 위치에 저장한다.

## 문법

```pug-frame
mobile
    header
        div "Rescene"
    body
        div "Ilsan!"
        button "Next"
    footer
        div "2026.07.07"

mobile
    header
        div "Rescene"
    body
        div "Yaho!"
        button "Prev"
    footer
        div "2026.07.07"
```

- 들여쓰기 기반 중첩(Pug와 동일).
- 최상위 블록 하나가 화면 하나. 문서에 여러 개를 둘 수 있다.
- `div "텍스트"`처럼 따옴표로 요소 텍스트를 지정한다.
- 구조 키워드: 프레임 타입(`mobile`/`tablet`/`desktop`), `header`, `body`, `footer`.
- 스타일: 프레임·구조 영역은 검은 border + 흰 배경, `button`은 검은 배경 + 흰 텍스트.

### 프레임 타입 추가

`src/frames.ts`의 `FRAME_SIZES`에 항목을 추가하면 전처리와 CSS 양쪽에 자동 반영된다.

## 테스트

```bash
npm test
```
