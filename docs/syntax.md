# pug-frame 문법

pug-frame은 [Pug](https://pugjs.org/) 문법 위에 와이어프레임용 의미를 얹은 DSL이다. 렌더 파이프라인은 소스를 표준 Pug로 변환(`preprocess`)한 뒤 컴파일하므로, **기본 문법은 Pug와 동일**하다.

## 기본 문법 (Pug)

들여쓰기 중첩, 태그, ID/클래스, attribute, **텍스트** 등은 Pug 문법을 그대로 따른다. 요소의 텍스트는 표준 Pug처럼 태그 뒤에 그대로 쓴다(`div Rescene`). 자세한 내용은 Pug 공식 문서를 참고한다.

- 태그·중첩·텍스트: https://pugjs.org/language/tags.html
- attribute: https://pugjs.org/language/attributes.html

예:

```pug-frame
mobile#main-1
    body
        button(p-focus='main-2') Next
```

- `mobile#main-1` — 태그에 `#id`를 붙이는 Pug 셀렉터 문법. 프레임에 `id="main-1"`을 부여한다.
- `button(p-focus='main-2')` — Pug attribute 문법. 버튼에 `p-focus="main-2"` attribute를 부여한다.

## Additional Syntax

Pug 위에 pug-frame이 추가로 부여하는 의미다.

### `p-` 인터랙션 attribute

`p-`로 시작하는 attribute는 pug-frame **전용 기능**의 네임스페이스다.

- 표기: `요소(p-<기능>='<값>')`. 예: `button(p-focus='main-2')`, `div(p-tooltip='설명')`.
- 값 자체는 표준 Pug attribute 문법이다.
- **인터랙션** attribute(`p-focus`, `p-tooltip`, `p-scrollbar-x`, `p-scrollbar-y`)는 `@pug-frame/canvas` 뷰어에서만 해석되며, 정적 HTML 출력(예: CLI `render`)에서는 **제거**되어 표준 마크업만 남는다.
- **컨텐츠** attribute(`p-icon`, 그리고 위젯 값 `p-date`/`p-month`/`p-year`/`p-star`/`p-progress`/`p-on`)는 렌더 단계에서 실제 내용/상태로 반영되므로 정적 출력에도 결과가 남는다(attribute 자체는 제거).
- 현재 지원: `p-focus`, `p-tooltip`, `p-icon`, `p-scrollbar-x`, `p-scrollbar-y`, 그리고 값 기반 위젯용 `p-date`/`p-month`/`p-year`/`p-star`/`p-progress`/`p-on`. 위젯 요소 목록은 [elements 문서](./elements.md) 참고.

### p-focus

`p-focus` attribute를 가진 요소는 `@pug-frame/canvas`에서 **카메라 포커스 트리거**가 된다.

- 표기: `요소(p-focus='<대상 id>')`. 예: `button(p-focus='main-2')`.
- 동작: 이 요소를 클릭하면 값(`main-2`)과 같은 `id`를 가진 요소로 카메라가 이동한다(줌을 1로 되돌리고 대상을 화면 중앙에 정렬).
- 표시: 포커스된 요소는 붉은 outline과 id 라벨(좌상단 바깥)로 강조된다.
- 해제: 포커스된 요소 바깥을 클릭하면 포커스가 취소된다.
- 자세한 내용은 [canvas 문서](./canvas.md#p-focus)를 참고한다.

### p-tooltip

`p-tooltip` attribute를 가진 요소는 canvas에서 **마커와 말풍선**을 표시한다.

- 표기: `요소(p-tooltip='<내용>')`. 예: `div(p-tooltip='이 버튼을 누르면 다음 화면으로 이동합니다')`.
- 마커: 요소의 **바깥쪽 오른쪽 상단**에 `*` 표시가 항상 붙는다.
- 동작: 요소에 마우스를 올리거나(호버) 터치(탭)하면 attribute 값을 말풍선 오버레이로 보여준다. 터치는 탭으로 토글되며, 바깥을 탭하면 닫힌다.
- 자세한 내용은 [canvas 문서](./canvas.md#p-tooltip)를 참고한다.

### p-icon

`p-icon` attribute를 가진 요소 안에 [lucide](https://lucide.dev/icons/) 아이콘을 인라인 SVG로 넣는다.

- 표기: `요소(p-icon='<아이콘 이름>')`. 예: `circle(p-icon='user')`, `div(p-icon='chevron-right')`.
- 이름: lucide의 kebab-case 이름을 그대로 쓴다. 알 수 없는 이름은 점선 사각형 자리표시자로 표시된다.
- 치환은 **렌더 단계**에서 일어나므로 정적 HTML 출력과 canvas 양쪽에서 아이콘이 보인다(다른 인터랙션 `p-*`와 달리 제거되지 않는다).
- SVG는 `stroke="currentColor"`이므로 텍스트 색(`color`)을 따른다. 크기는 기본 24×24다.

### p-scrollbar-x / p-scrollbar-y

`p-scrollbar-x` / `p-scrollbar-y` attribute를 가진 요소에 스크롤바를 **UI 요소로 그린다**(실제 제스처 스크롤은 지원하지 않는 모양 전용).

- 표기: `section.flex(p-scrollbar-x)`처럼 값 없이 붙인다.
- 트랙에 border와 도트무늬 배경이 들어가 스크롤바임을 알아볼 수 있고, 그 위에 검은 thumb가 채워진다. 세로는 오른쪽, 가로는 아래쪽에 표시된다.
- 축마다 트랙+thumb를 그리므로 한 요소는 한 축(x 또는 y)만 쓴다. 컨텐츠는 요소 안에서 잘린다(`overflow: hidden`).
- canvas 전용이며 정적 출력에서는 제거된다. 자세한 내용은 [canvas 문서](./canvas.md#p-scrollbar-x--p-scrollbar-y)를 참고한다.

### 기본 와이어프레임 요소

자주 쓰는 자리표시자·위젯을 짧은 키워드로 제공한다. 대부분 `.pf-*` 클래스가 붙은 div로 매핑된다. 전체 목록과 각 매핑은 [elements 문서](./elements.md)를 참고한다.

- 자리표시자: `circle`(원형 아바타), `image`(이미지 박스), `video`(비디오 박스), `search`(검색 바), `navigation`(하단 탭 바), `spinner`(로딩).
- 드롭다운: `dropdown` + `item`.
- 제목·링크: `h1`~`h6`(표준 태그), `link`(→ `<a>`, 실제 `a`와 동일 스타일).
- 값 기반 위젯(아래 `p-*` 값으로 내부가 그려짐): `calendar`(p-date), `monthpick`(p-month), `yearpick`(p-year), `rating`(p-star), `progressbar`(p-progress), `toggle`(p-on), `checkbox`(p-on).

### 구조 키워드 (nav / main)

프레임 내부 시맨틱 영역에 `nav`, `main`이 추가됐다. `header`/`body`/`footer`와 동일하게 클래스 div로 매핑된다.

- `nav` → `div.frame-nav`.
- `main` → `div.frame-main`(남는 세로 공간을 채움).

### 기본 유틸리티 클래스 · Tailwind

- pug-frame은 Tailwind 없이도 항상 동작하는 최소 유틸리티를 제공한다: `.flex`(display:flex), `.text-small`(작은 글자).
- 그 외 클래스는 **Tailwind 유틸리티**로 canvas에서 런타임에 생성된다. 예: `main.flex.flex-col.gap-4`, `section.items-center.gap-3`, `div.bg-blue-500` 등 임의의 Tailwind 클래스를 쓸 수 있다.
- Tailwind는 canvas 뷰어에서만 적용된다(Shadow DOM 안에서 생성·주입). 정적 HTML 출력에는 Tailwind 유틸리티가 포함되지 않는다.
- `#id`/`.class`/`(attrs)` 순서는 표준 Pug를 따른다. 클래스는 attribute보다 **앞**에 온다: `section.flex.gap-2(p-scrollbar-x)`.

### 프레임 키워드

들여쓰기 0의 프레임 키워드가 **새 화면 하나**를 시작한다. 한 문서에 여러 개를 둘 수 있다.

- 키워드: `mobile`, `tablet`, `desktop`.
- 각 키워드는 정해진 프레임 크기(너비·높이)를 가진 박스로 렌더된다.
- `<div class="frame frame--{키워드}">`로 매핑된다.

### 구조 키워드

프레임 내부의 시맨틱 영역을 나타낸다.

- 키워드: `header`, `nav`, `main`, `body`, `footer`.
- 실제 `<header>`/`<body>`/`<footer>` 대신 클래스 div(`frame-header` 등)로 매핑된다. 중첩 `<body>`가 브라우저에서 무효 처리되는 것을 피하기 위함이다.

### 프레임 ID 표시

`id`를 가진 프레임은 canvas 렌더링 시 프레임 **바깥쪽 위**에 그 id를 라벨로 표시한다.

- 표기: `mobile#main-1` 처럼 프레임 키워드에 `#id`를 붙인다.
- 이 `id`는 위 [p-focus](#p-focus)의 대상 id로도 쓰인다.

## 전체 예시

```pug-frame
mobile#main-1
    header
        div Rescene
    body
        div Ilsan!
        button(p-focus='main-2') Next
        div(p-tooltip='다음 화면으로 이동합니다') ?
    footer
        div 2026.07.07

mobile#main-2
    header
        div Rescene
    body
        div Yaho!
        button(p-focus='main-1') Prev
    footer
        div 2026.07.07
```

기본 요소·`p-icon`·`p-scrollbar`·유틸리티/Tailwind를 함께 쓴 예시:

```pug-frame
mobile#profile
    nav.flex.items-center.justify-between
        div 뒤로
        div 프로필
        circle(p-icon='settings')
    main.flex.flex-col.gap-4
        section.flex.items-center.gap-3
            circle(p-icon='user')
            .flex.flex-col
                div 이강현
                div.text-small 클로드코드 조련사
        section.flex.gap-2(p-scrollbar-x)
            section.flex.flex-col.gap-2(p-scrollbar-y)
                image
                image
                image
            div.text-small 2026.06.05 호수공원 사진들
    footer.flex.justify-end
        div.text-small 2026-07-18
```
