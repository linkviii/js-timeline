/*
 * Demonstrate the use of the timeline library.
 *
 * MIT licenced.
 *
 */
define(["require", "exports", "./src/timeline", "./lib/svgjs", "jquery"], function (require, exports, timeline_1, SVG, $) {
    "use strict";
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
    // test svg library
    let draw = SVG('drawing'); //.size(300, 300);
    let rect = draw.rect(100, 100).attr({ fill: 'green', stroke: 'blue' });
    // test timelines
    const sample = "res/simple_timeline.json";
    const anime = "res/animev2.json";
    const foo = loadData(sample);
    const bar = loadData(anime);
    const tl = new timeline_1.Timeline(foo, "sampleTimeline");
    const t2 = new timeline_1.Timeline(bar, "animeTimeline");
    //console.log( tl.data);
    tl.build();
    t2.build();
});
//# sourceMappingURL=main.js.map