// playground 첫 진입 시 보여줄 기본 pug-frame 소스.
// README / canvas 데모의 2-화면 예시(p-focus, p-tooltip 포함)를 재사용한다.
export const DEFAULT_SAMPLE = `mobile#main-1
    header
        div "Rescene"
    body
        div "Ilsan!"
        div(p-tooltip='다음 화면으로 이동합니다')
            button(p-focus='main-2') "Next"
    footer
        div "2026.07.07"

mobile#main-2
    header
        div "Rescene"
    body
        div "Yaho!"
        div(p-tooltip='이전 화면으로 돌아갑니다')
            button(p-focus='main-1') "Prev"
    footer
        div "2026.07.07"
`;
