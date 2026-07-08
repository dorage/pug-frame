# pug-frame 문법

pug-frame은 [Pug](https://pugjs.org/) 문법 위에 와이어프레임용 의미를 얹은 DSL이다. 렌더 파이프라인은 소스를 표준 Pug로 변환(`preprocess`)한 뒤 컴파일하므로, **기본 문법은 Pug와 동일**하다.

## 기본 문법 (Pug)

들여쓰기 중첩, 태그, ID/클래스, attribute 등은 Pug 문법을 그대로 따른다. 자세한 내용은 Pug 공식 문서를 참고한다.

- 태그·중첩: https://pugjs.org/language/tags.html
- attribute: https://pugjs.org/language/attributes.html

예:

```pug-frame
mobile#main-1
    body
        button(focus='main-2') "Next"
```

- `mobile#main-1` — 태그에 `#id`를 붙이는 Pug 셀렉터 문법. 프레임에 `id="main-1"`을 부여한다.
- `button(focus='main-2')` — Pug attribute 문법. 버튼에 `focus="main-2"` attribute를 부여한다.

## Additional Syntax

Pug 위에 pug-frame이 추가로 부여하는 의미다.

### focus

`focus` attribute를 가진 요소는 `@pug-frame/canvas`에서 **카메라 포커스 트리거**가 된다.

- 표기: `요소(focus='<대상 id>')`. 예: `button(focus='main-2')`.
- 동작: 이 요소를 클릭하면 값(`main-2`)과 같은 `id`를 가진 요소로 카메라가 이동한다(줌을 1로 되돌리고 대상을 화면 중앙에 정렬).
- 표시: 포커스된 요소는 붉은 outline과 id 라벨(좌상단 바깥)로 강조된다.
- 해제: 포커스된 요소 바깥을 클릭하면 포커스가 취소된다.
- attribute 값 자체는 표준 Pug 문법이며, 위 인터랙션은 canvas 뷰어에서만 동작한다(정적 HTML에는 attribute만 남는다). 자세한 내용은 [canvas 문서](./canvas.md#focus)를 참고한다.

### 프레임 키워드

들여쓰기 0의 프레임 키워드가 **새 화면 하나**를 시작한다. 한 문서에 여러 개를 둘 수 있다.

- 키워드: `mobile`, `tablet`, `desktop`.
- 각 키워드는 정해진 프레임 크기(너비·높이)를 가진 박스로 렌더된다.
- `<div class="frame frame--{키워드}">`로 매핑된다.

### 구조 키워드

프레임 내부의 시맨틱 영역을 나타낸다.

- 키워드: `header`, `body`, `footer`.
- 실제 `<header>`/`<body>`/`<footer>` 대신 클래스 div(`frame-header` 등)로 매핑된다. 중첩 `<body>`가 브라우저에서 무효 처리되는 것을 피하기 위함이다.

### 따옴표 텍스트

요소의 텍스트를 따옴표로 감싸 지정한다.

- 표기: `div "Rescene"` 또는 `div 'Rescene'`.
- 앞뒤를 감싼 따옴표 한 쌍은 제거되고 내부 텍스트만 요소 내용으로 렌더된다. (표준 Pug의 `div Rescene`와 다른 지점)

### 프레임 ID 표시

`id`를 가진 프레임은 canvas 렌더링 시 프레임 **바깥쪽 위**에 그 id를 라벨로 표시한다.

- 표기: `mobile#main-1` 처럼 프레임 키워드에 `#id`를 붙인다.
- 이 `id`는 위 [focus](#focus)의 대상 id로도 쓰인다.

## 전체 예시

```pug-frame
mobile#main-1
    header
        div "Rescene"
    body
        div "Ilsan!"
        button(focus='main-2') "Next"
    footer
        div "2026.07.07"

mobile#main-2
    header
        div "Rescene"
    body
        div "Yaho!"
        button(focus='main-1') "Prev"
    footer
        div "2026.07.07"
```
