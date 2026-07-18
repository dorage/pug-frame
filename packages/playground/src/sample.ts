// playground 첫 진입 시 보여줄 기본 pug-frame 소스.
// 기본 와이어프레임 요소(nav/main/circle/image), p-icon(lucide), p-scrollbar,
// 기본 유틸리티 클래스(flex/text-small), Tailwind 유틸리티를 함께 보여준다.
export const DEFAULT_SAMPLE = `mobile#profile
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
`;
