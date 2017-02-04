# js-timeline
Generate svg timelines with javascript. Demo: http://linkviii.github.io/js-timeline/

Based on https://github.com/jasonreisman/Timeline written in python. (formated and slightly documented fork: https://github.com/Linkviii/Timeline). Almost compatible with original python implementation.

```TypeScript
// typescript import. Compiles to
// define(["require", "exports", "./src/timeline", "./lib/svgjs"], function (require, exports, timeline_1, SVG) {
import {Timeline, TimelineData} from "./src/timeline"; 
const data:TimelineData = ...;
new Timeline(data, "timelineID").build();
```
Where
```TypeScript
type TimelineData = TimelineDataV1 | TimelineDataV2;
```

## Interface
 There are 2 interface versions. v1 comes from the original python project. v2 has camelCase names (json style) and objects instead of tuples.
### Interface v1
Original project interface:

```TypeScript
type TimelineCalloutV1 = [string, string]|[string, string, string];
type TimelineEraV1 = [string, string, string]|[string, string, string, string];
interface TimelineDataV1 {
    width: number;
    start: string;
    end: string;
    num_ticks?: number;
    tick_format?: string;
    //[[description, date, ?color],...]
    callouts?: TimelineCalloutV1[];
    //[[name, startDate, endDate, ?color],...]
    eras?: TimelineEraV1[];
}
```
See [res/simple_timeline.json](res/simple_timeline.json) for an example.

### Interface v2
New interface:

```TypeScript
interface TimelineCalloutV2 {
    description: string;
    date: string;
    color?: string;
}

interface TimelineEraV2 {
    name: string;
    startDate: string;
    endDate: string;
    color?: string;
}

interface TimelineDataV2 {
    apiVersion: 2; 
    width: number;
    startDate: string;
    endDate: string;
    numTicks?: number;
    tickFormat?: string;
    callouts?: TimelineCalloutV2[];
    eras?: TimelineEraV2[];
}
````

**Required**: `apiVersion: 2`

See [res/animev2.json](res/animev2.json) for an example.

### Interface notes
* `colors` are hex strings.
* `width` describes the width, in pixels, of the output SVG document.  The height will be determined automatically.
* Date strings need to be in YYYY-MM-DD format. (currently parsed as `new Date(str);`)
* `start`~ is the date/time of the leftmost date/time on the axis.
* `end`~ is the date/time of the rightmost date/time on the axis.
* `num_ticks`~ controls the number of tickmarks along the axis between the `start` and `end` date/times (inclusive).  If this field is not present, no tickmarks will be generated except for those at the `start` and `end` dates.
* `tick_format`~ is unimplemented
* `callouts` are events on the timeline.
* `eras` are (?shaded) areas on the timeline.

## Version
* **`apiVersion`** changes in response to changes in the json's interface.
* **Library** version can be found at the top of [src/timeline.ts](src/timeline.ts). The version is (not strictly) the date that the last feature change was made. Code pushed on the `gh-pages` (master) branch should never be broken.

## Dependencies 
* jquery
* [svg.js](http://svgjs.com/): © 2012 - 2016 Wout Fierens - svg.js is released under the terms of the MIT license.  

## License

MIT licensed
