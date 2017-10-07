/*
 * Demonstrate the use of the timeline library.
 *
 * MIT licenced.
 *
 */


import {Timeline, TimelineData} from "./src/timeline";

/// <reference path="lib/svgjs.d.ts"/>
import * as SVG from "./lib/svgjs";

import * as $ from "jquery";

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
let draw = SVG('drawing');//.size(300, 300);
let rect = draw.rect(100, 100).attr({fill: 'green', stroke: 'blue'});

// test timelines

const sample = "res/simple_timeline.json";
// const sample = "res/no_callout.json";
// const anime = "res/animev2.json";
const anime = "res/cutOff.json";
// const anime = "res/test.json";

const foo: TimelineData = loadData(sample);
const bar: TimelineData = loadData(anime);

const tl = new Timeline(foo, "sampleTimeline");
const t2 = new Timeline(bar, "animeTimeline");
//console.log( tl.data);
tl.build();
t2.build();
