import { pugFrameCanvas } from "../src/index";

const sample = `mobile#main-1
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

const canvas = pugFrameCanvas("#pug-frame-canvas", { pugframe: sample });
void canvas.render();
