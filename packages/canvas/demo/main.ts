import { pugFrameCanvas } from "../src/index";

const sample = `mobile#main-1
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
`;

const canvas = pugFrameCanvas("#pug-frame-canvas", { pugframe: sample });
void canvas.render();
