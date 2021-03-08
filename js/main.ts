/*
 * Demonstrate the use of the timeline library.
 *
 * MIT licensed.
 *
 */


import { Timeline, TimelineData } from "./src/timeline.js";

import * as TL from "./src/timeline.js";
export const tllib = TL;


import "./jquery.js";

declare function SVG();

console.log("motd")

// read a file the "wrong" way
function loadData(filename: string): any {
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

// test svg library
let draw = SVG().addTo('#drawing');//.size(300, 300);
let rect = draw.rect(100, 100).attr({ fill: 'green', stroke: 'blue' });

// test timelines

// const sample = "res/simple_timeline.json";
const sample = "res/biftest.json";
// const sample = "res/no_callout.json";
// const anime = "res/animev2.json";
const anime = "res/cutOff.json";
// const anime = "res/test.json";

const foo: TimelineData = loadData(sample);
const bar: TimelineData = loadData(anime);

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
