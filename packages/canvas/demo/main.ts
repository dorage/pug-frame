import { pugFrameCanvas } from "../src/index";

const sample = `mobile
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
`;

const canvas = pugFrameCanvas("#pug-frame-canvas", { pugframe: sample });
void canvas.render();
