# js-timeline
Generate svg timelines with javascript. Demo: http://linkviii.github.io/js-timeline/

Based on https://github.com/jasonreisman/Timeline written in python. (Forked: formated and slightly documented https://github.com/Linkviii/Timeline). Almost compatible with original.

```
new Timeline(data, "timelineID").build();
```
Data object is basically the same as the original project's json. See `res/simple_timeline.json` for an example.

```TypeScript
/**
 * Interface of controlling json
 * start/end YYYY-MM-DD (currently `new Date(str);`)
 */
interface TimelineData {
    width:number;
    start:string;
    end:string;
    num_ticks?:number;
    tick_format?:string;
    //[[description, date, ?color],...]
    callouts?:Array<[string, string]|[string, string, string]>;
    //[[name, start, end, ?color],...]
    eras?:Array<[string, string, string]|[string, string, string, string]>;
}
```

#### Required Fields

* `width` describes the width, in pixels, of the output SVG document.  The height will be determined automatically.
* `start` is the date/time of the leftmost date/time on the axis.
* `end` is the date/time of the rightmost date/time on the axis.


#### Optional Fields

* `num_ticks` controls the number of tickmarks along the axis between the `start` and `end` date/times (inclusive).  If this field is not present, no tickmarks will be generated except for those at the `start` and `end` dates.
* `tick_format` is unimplemented
* `callouts` list of events: [[description, date, ?color],...]
* `eras` [[name, start, end, ?color],...]

MIT licensed
