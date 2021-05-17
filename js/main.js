/*
 * Demonstrate the use of the timeline library.
 *
 * MIT licensed.
 *
 */
import { Timeline } from "./src/timeline.js";
import * as TL from "./src/timeline.js";
export const tllib = TL;
import "./jquery.js";
console.log("motd");
// read a file the "wrong" way
function loadData(filename) {
    return (function () {
        let json = null;
        $.ajax({
            async: false,
            global: false,
            url: filename,
            dataType: "json",
            success: function (data) {
                json = data;
            }
        });
        return json;
    })();
}
export function saveSVG(elm) {
    const filename = "some.svg";
    const svgdata = new XMLSerializer().serializeToString(elm);
    const blob = new Blob([svgdata], { type: "image/svg+xml" });
    saveAs(blob, filename);
}
export function savePNG(elm, transparent = false) {
    const filename = "some.png";
    const svgdata = new XMLSerializer().serializeToString(elm);
    {
        // See https://github.com/Linkviii/js-animelist-timeline/issues/3
        const img = document.createElement("img");
        img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgdata))));
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const svgSize = elm.getBoundingClientRect();
        // With 8pt font, at 1x scale the text is blurry 
        const scale = 2;
        canvas.width = svgSize.width * scale;
        canvas.height = svgSize.height * scale;
        if (!transparent) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        img.onload = function () {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(function (blob) {
                saveAs(blob, filename);
            });
        };
    }
}
// test svg library
let draw = SVG().addTo('#drawing'); //.size(300, 300);
let rect = draw.rect(100, 100).attr({ fill: 'green', stroke: 'blue' });
//
//
const startColor1 = "#C0C0FF"; //blueish
const startColor2 = "#0026FF";
const endColor = "#CD3F85";
const bingeColor = "#000000"; // just black
const dates = [
    "2020-01-01",
    "2020-01-04",
    "2020-01-09",
];
const logoData = {
    apiVersion: 2,
    width: 300,
    fontSize: 15,
    // Don't show dates
    tickFormat: " ",
    callouts: [
        { description: "Javascript", date: dates[0], color: startColor2, backgroundColor: startColor1 },
        { description: "Typescript", date: dates[0], color: startColor1, backgroundColor: "black" },
        { description: "SVG", date: dates[1], color: bingeColor, backgroundColor: "transparent" },
        { description: "Timeline", date: dates[2], color: endColor },
    ],
    eras: [
        { startDate: dates[0], endDate: dates[dates.length - 1], name: "For All Time" }
    ],
    startDate: dates[0],
    endDate: dates[2],
};
const logoTimeline = new Timeline(logoData, "logo");
logoTimeline.build();
// test timelines
// const sample = "res/simple_timeline.json";
const sample = "res/biftest.json";
// const sample = "res/no_callout.json";
// const anime = "res/animev2.json";
const anime = "res/cutOff.json";
// const anime = "res/test.json";
const foo = loadData(sample);
const bar = loadData(anime);
export const tl = new Timeline(foo, "sampleTimeline");
tl.build();
// throw 1;
export const sample_500 = new Timeline(TL.makeTestPattern1(500), "sampleTimeline");
export const sample_1000 = new Timeline(TL.makeTestPattern1(1000), "sampleTimeline");
export const sample_1500 = new Timeline(TL.makeTestPattern1(1500), "sampleTimeline");
sample_500.build();
sample_1000.build();
sample_1500.build();
export const test_2 = new Timeline(TL.makeTestPattern2(), "sampleTimeline");
test_2.build();
export const test_3 = new Timeline(TL.makeTestPattern3(), "sampleTimeline");
test_3.build();
export const t2 = new Timeline(bar, "animeTimeline");
t2.build();
//# sourceMappingURL=main.js.map