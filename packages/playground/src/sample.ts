// playground 첫 진입 시 보여줄 기본 pug-frame 소스.
// 기본으로 제공하는 요소를 최대한 담은 쇼케이스(4개 화면).
// 구조(header/nav/main/body/footer), 요소(circle/image/video/search/navigation/
// spinner/dropdown/item), 제목(h1~h6)·링크(link), 값 기반 위젯(calendar/monthpick/
// yearpick/toggle/checkbox/rating/progressbar), p-icon/p-tooltip/p-focus/p-scrollbar,
// 기본 유틸리티·Tailwind 클래스를 함께 보여준다. 하단 버튼(p-focus)으로 화면 이동.
export const DEFAULT_SAMPLE = `mobile#el-basic
    header.flex.items-center.justify-between
        h1 Elements
        link 더보기
    main.flex.flex-col.gap-3
        section.flex.items-center.gap-3
            circle(p-icon='user')
            .flex.flex-col
                div 이강현
                div.text-small 클로드코드 조련사
            circle(p-icon='settings' p-tooltip='설정')
        image.w-full.h-28
        video.w-full.h-28
        section.flex.flex-col
            h1 H1 제목
            h2 H2 제목
            h3 H3 제목
            h4 H4 제목
            h5 H5 제목
            h6 H6 제목
    footer.flex.gap-2
        button(p-focus='el-controls') 컨트롤
        button(p-focus='el-date') 날짜
        button(p-focus='el-scroll') 스크롤

mobile#el-controls
    header
        h2 컨트롤
    body.flex.flex-col.gap-3
        search
        dropdown 정렬선택
            item 추천순
            item 인기순
            item 최신순
        section.flex.items-center.justify-between
            div 알림
            toggle(p-on)
        section.flex.items-center.justify-between
            div 동의
            checkbox(p-on)
        section.flex.items-center.gap-2
            div.text-small 별점
            rating(p-star=4)
        progressbar(p-progress=70)
        section.flex.items-center.gap-2
            spinner
            div.text-small 불러오는 중…
    footer.flex.gap-2
        button(p-focus='el-basic') 기본
        button(p-focus='el-date') 날짜

mobile#el-date
    header
        h2 날짜
    main.flex.flex-col.gap-3.items-center
        calendar(p-date='2026-07-16')
        monthpick(p-month='2026-07')
        yearpick(p-year='2026')
    footer.flex.gap-2
        button(p-focus='el-basic') 기본
        button(p-focus='el-scroll') 스크롤

mobile#el-scroll
    header
        h2 스크롤 · 내비
    main.flex.flex-col.gap-2
        div.text-small 가로 스크롤
        section.flex.gap-2(p-scrollbar-x)
            image.w-28.h-20
            image.w-28.h-20
            image.w-28.h-20
            image.w-28.h-20
        div.text-small 세로 스크롤
        section.flex.flex-col.gap-2.h-40(p-scrollbar-y)
            image.h-24
            image.h-24
            image.h-24
    nav.flex.justify-around
        circle(p-icon='house')
        circle(p-icon='search')
        circle(p-icon='bell')
        circle(p-icon='user')
    footer
        navigation
`;
