# pug-frame 기본 요소

pug-frame이 **기본으로 제공하는 요소·키워드·attribute·유틸리티**의 목록이다. 각 항목이 어떤 HTML/스타일로 매핑되는지 한눈에 볼 수 있게 정리했다. 문법의 배경과 상세는 [syntax](./syntax.md)를, 렌더 매핑은 [render](./render.md)를, canvas 동작은 [canvas](./canvas.md)를 참고한다.

표기 규칙: 아래 키워드는 각 줄의 **선행 태그 토큰**일 때만 매핑된다. `#id`/`.class`/`(attrs)` 등 Pug 잔여부는 그대로 보존된다(예: `circle(p-icon='user')`, `main.flex.gap-4`).

## 프레임 키워드

들여쓰기 0에서 **새 화면 하나**를 시작한다. `<div class="frame frame--{타입}">`로 매핑되고 정해진 크기를 가진다.

- `mobile`
  - 매핑: `div.frame.frame--mobile`
  - 크기: 375 × 812
- `tablet`
  - 매핑: `div.frame.frame--tablet`
  - 크기: 768 × 1024
- `desktop`
  - 매핑: `div.frame.frame--desktop`
  - 크기: 1440 × 900

`#id`를 붙이면(`mobile#main-1`) 프레임 바깥 위에 id 라벨이 표시되고, `p-focus`의 대상 id로도 쓰인다.

## 구조 키워드

프레임 내부의 시맨틱 영역. 중첩 `<body>` 무효화를 피하려고 실제 태그 대신 클래스 div로 매핑된다. 공통 스타일: 1px 검은 border + 흰 배경 + 12px 패딩 + 컨텐츠 클리핑.

- `header` → `div.frame-header`
- `nav` → `div.frame-nav`
- `main` → `div.frame-main` (남는 세로 공간을 채움, `flex: 1`)
- `body` → `div.frame-body` (남는 세로 공간을 채움, `flex: 1`)
- `footer` → `div.frame-footer`

## 요소 키워드

자주 쓰는 와이어프레임 자리표시자. `.pf-*` 클래스 div로 매핑된다.

- `circle` → `div.pf-circle`
  - 원형 아바타 자리표시자. 48 × 48, 정원 테두리, 내부 아이콘을 가운데 정렬.
  - `p-icon`과 함께 아이콘 아바타로 자주 쓴다: `circle(p-icon='user')`.
- `image` → `div.pf-image`
  - 이미지 박스 자리표시자. 회색 배경 + 대각선 표시, 최소 64 × 64.

`section`은 유효한 HTML 태그라 매핑 없이 그대로 통과한다(중립 그룹). `section.flex`, `section(p-scrollbar-x)`처럼 쓴다.

## 기본 유틸리티 클래스

Tailwind 없이도 항상 동작하는 최소 유틸리티(정적 출력·canvas 공통).

- `.flex` → `display: flex`
- `.text-small` → `font-size: 12px`

그 외 임의의 **Tailwind 유틸리티 클래스**는 canvas 뷰어에서 런타임에 생성·주입된다(예: `flex-col`, `gap-4`, `items-center`, `bg-blue-500`). 정적 HTML 출력에는 포함되지 않는다. 자세한 내용은 [canvas 문서](./canvas.md#tailwind-런타임-유틸리티) 참고.

## p- attribute

`p-`로 시작하는 pug-frame 전용 기능. 표기는 `요소(p-<기능>='<값>')`.

### 컨텐츠 (정적 출력에도 남음)

- `p-icon='<이름>'`
  - 요소 안에 [lucide](https://lucide.dev/icons/) 아이콘을 인라인 SVG로 넣는다. 이름은 kebab-case(예: `user`, `chevron-right`). 알 수 없는 이름은 점선 사각형 자리표시자.
  - 렌더 단계에서 치환되므로 정적/canvas 양쪽에서 보인다.

### 인터랙션 (canvas 전용, 정적 출력에서 제거됨)

- `p-focus='<대상 id>'`
  - 클릭하면 값과 같은 id를 가진 요소로 카메라가 이동한다.
- `p-tooltip='<내용>'`
  - 마커(`*`)와 말풍선을 표시한다(호버/탭).
- `p-scrollbar-x` / `p-scrollbar-y`
  - 스크롤바를 UI 요소로 그린다(트랙 border + 도트무늬 + 검은 thumb). 실제 제스처 스크롤은 지원하지 않는 모양 전용이며, 한 요소는 한 축만 쓴다.

## 최소 예시

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

## 확장 지점

- 프레임 타입: `packages/render/src/frames.ts`의 `FRAME_SIZES`
- 구조 키워드: 같은 파일의 `SECTION_CLASSES`
- 요소 키워드: 같은 파일의 `ELEMENT_CLASSES`
- p- 인터랙션: `packages/canvas/src/pAttributes.ts`의 `pAttrHandlers`
