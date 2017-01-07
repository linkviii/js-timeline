/*
 * Generate a svg timeline with javascript.
 * Based on https://github.com/jasonreisman/Timeline written in python.
 * Slightly documented: https://github.com/linkviii/Timeline
 *
 * Usage: `new Timeline(tlData, "timelineID").build();`
 *
 * v 2017-1-7
 *   (Try to change with new features. Not strict.)
 * 
 * MIT licenced
 */


/**
 *color constant
 */
let Colors: {black: string, gray: string} = {black: '#000000', gray: '#C0C0C0'};


function p(o: any): void {
    console.log(o);
}

/**
 * Interface of controlling json
 * start/end YYYY-MM-DD (currently `new Date(str);`)
 */
interface TimelineData {
    width: number;
    start: string;
    end: string;
    num_ticks?: number;
    tick_format?: string;
    callouts?;
    eras?;
}

interface TimelineDataV1 extends TimelineData {
    width: number;
    start: string;
    end: string;
    num_ticks?: number;
    tick_format?: string;
    //[[description, date, ?color],...]
    callouts?: Array<[string, string]|[string, string, string]>;
    //[[name, start, end, ?color],...]
    eras?: Array<[string, string, string]|[string, string, string, string]>;
}

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

interface TimelineDataV2 extends TimelineData {
    apiVersion: number;
    width: number;
    start: string;
    end: string;
    numTicks?: number;
    tickFormat?: string;
    callouts?: TimelineCalloutV2[];
    eras?: TimelineEraV2[];
}

/**
 * addAxisLabel kw
 */
interface LabelKW {
    tick?: boolean;
    stroke?: string;
    fill?: string;
}

class Timeline {

    public data: TimelineData;

    public startDate: Date;
    public endDate: Date;

    public date0: number;
    public date1: number;
    public totalSeconds: number;

    //public callout_size: [number, number, number];
    public calloutProperties: {width: number, height: number, increment: number};


    public textFudge: [number, number];
    public tickFormat: string;
    public markers;

    //public fonts;

    public maxLabelHeight: number;

    public width: number;

    public drawing;
    public axisGroup;

    // initializes data for timeline
    constructor(data: TimelineData, id: string) {

        this.data = data;
        this.width = this.data.width;

        this.drawing = SVG(id);
        this.axisGroup = this.drawing.group();

        this.startDate = new Date(this.data.start);
        this.endDate = new Date(this.data.end);

        const delta: number = (this.endDate.valueOf() - this.startDate.valueOf());
        const padding: number = (new Date(delta * 0.1)).valueOf();

        this.date0 = this.startDate.valueOf() - padding;
        this.date1 = this.endDate.valueOf() + padding;
        this.totalSeconds = (this.date1 - this.date0) / 1000;

        // # set up some params
        //TODO Cleanup / factor
        //this.callout_size = [10, 15, 10]; // width, height, increment


        this.calloutProperties = {width: 10, height: 15, increment: 10};

        this.textFudge = [3, 1.5];
        // TODO use
        this.tickFormat = this.data.tick_format;

        this.markers = {};


        //# maxLabelHeight stores the max height of all axis labels
        //# and is used in the final height computation in build(self)
        this.maxLabelHeight = 0;
    }

    // Generates svg document
    build(): void {
        //# MAGIC NUMBER: y_era
        //# draw era label and markers at this height
        const yEra: number = 10;

        //# create main axis and callouts,
        //# keeping track of how high the callouts are
        this.createMainAxis();
        const yCallouts = this.createCallouts();

        //# determine axis position so that axis + callouts don't overlap with eras
        const yAxis: number = yEra + this.calloutProperties.height - yCallouts;

        //# determine height so that eras, callouts, axis, and labels just fit
        const height: number = yAxis + this.maxLabelHeight + 4 * this.textFudge[1];

        //# create eras and labels using axis height and overall height
        this.createEras(yEra, yAxis, height);
        this.createEraAxisLabels();

        //# translate the axis group and add it to the drawing
        this.axisGroup.translate(0, yAxis);
        this.drawing.add(this.axisGroup);

        this.drawing.size(this.width, height);

    }


    createEras(yEra: number, yAxis: number, height: number): void {
        if (!('eras' in this.data)) {
            return;
        }

        //# create eras
        let erasData: Array<Array<string>> = this.data.eras;
        //let markers = {};

        for (let era of erasData) {
            //# extract era data

            const name: string = era[0];

            const t0: number = (new Date(era[1])).valueOf();
            const t1: number = (new Date(era[2])).valueOf();

            const fill: string = (era.length > 3) ? era[3] : Colors.gray;


            const [startMarker, endMarker] = this.getMarkers(fill);


            //# create boundary lines
            const percentWidth0: number = (t0 - this.date0) / 1000 / this.totalSeconds;
            const percentWidth1: number = (t1 - this.date0) / 1000 / this.totalSeconds;

            const x0: number = Math.trunc(percentWidth0 * this.width + 0.5);
            const x1: number = Math.trunc(percentWidth1 * this.width + 0.5);


            const rect = this.drawing.rect(x1 - x0, height);
            rect.x(x0);
            rect.fill({color: fill, opacity: 0.15});

            this.drawing.add(rect);

            const line0 = this.drawing.add(
                this.drawing.line(x0, 0, x0, yAxis)
                    .stroke({color: fill, width: 0.5})
            );

            //TODO line0 line1 dash
            //http://svgwrite.readthedocs.io/en/latest/classes/mixins.html#svgwrite.mixins.Presentation.dasharray
            //line0.dasharray([5, 5])
            //what the svgjs equiv?

            const line1 = this.drawing.add(
                this.drawing.line(x1, 0, x1, yAxis)
                    .stroke({color: fill, width: 0.5})
            );
            //line1.dasharray([5, 5])


            //# create horizontal arrows and text
            const horz = this.drawing.add(
                this.drawing.line(x0, yEra, x1, yEra)
                    .stroke({color: fill, width: 0.75})
            );

            //TODO markers?
            /*
             horz['marker-start'] = start_marker.get_funciri()
             horz['marker-end'] = end_marker.get_funciri()
             self.drawing.add(self.drawing.text(name, insert=(0.5*(x0 + x1), y_era - self.textFudge[1]), stroke='none', fill=fill, font_family="Helevetica", font_size="6pt", text_anchor="middle"))
             */
            const txt = this.drawing.text(name);
            txt.font({family: 'Helevetica', size: '6pt', anchor: 'middle'});
            txt.dx(0.5 * (x0 + x1)).dy(yEra - this.textFudge[1]);
            txt.fill(fill);

            this.drawing.add(txt);
        }//end era loop
    }

    /**
     * @param {String} color
     * @return {Array<marker, marker>}
     */
    getMarkers(color: string): [any, any] {

        let startMarker;
        let endMarker;

        if (color in this.markers) {
            [startMarker, endMarker] = this.markers[color];
        } else {
            startMarker = this.drawing.marker(10, 10, function (add) {
                add.path("M6,0 L6,7 L0,3 L6,0").fill(color)
            }).ref(0, 3);

            endMarker = this.drawing.marker(10, 10, function (add) {
                add.path("M0,0 L0,7 L6,3 L0,0").fill(color)
            }).ref(6, 3);

            this.markers[color] = [startMarker, endMarker]
        }

        return [startMarker, endMarker]
    };


    createMainAxis() {
        //# draw main line
        this.axisGroup.add(this.drawing.line(0, 0, this.width, 0)
            .stroke({color: Colors.black, width: 3}));

        //# add tickmarks
        //self.addAxisLabel(self.startDate, str(self.startDate[0]), tick=True)
        this.addAxisLabel(this.startDate, this.startDate.toDateString(), {tick: true});
        this.addAxisLabel(this.endDate, this.endDate.toDateString(), {tick: true});

        if ('num_ticks' in this.data) {
            const delta = this.endDate.valueOf() - this.startDate.valueOf();
            //let secs = delta / 1000
            const numTicks = this.data.num_ticks;
            //needs more?
            for (let j = 1; j < numTicks; j++) {
                const tickDelta = /*new Date*/(j * delta / numTicks);
                const tickmarkDate = new Date(this.startDate.valueOf() + tickDelta);
                this.addAxisLabel(tickmarkDate, tickmarkDate.toDateString())
            }
        }
    }


    createEraAxisLabels(): void {
        if (!('eras' in this.data)) {
            return;
        }

        const erasData: Array<Array<string>> = this.data.eras;

        for (let era of erasData) {
            let t0 = new Date(era[1]);
            let t1 = new Date(era[2]);
            this.addAxisLabel(t0, t0.toDateString());
            this.addAxisLabel(t1, t1.toDateString());
        }
    }


    //def addAxisLabel(self, dt, label, **kwargs):
    addAxisLabel(dt: Date, label: string, kw?: LabelKW) {
        //date, string?
        kw = kw || {};

        if (this.tickFormat) {
            //##label = dt[0].strftime(self.tickFormat)
            // label = dt
            //TODO tick format
        }
        const percentWidth: number = (dt.valueOf() - this.date0) / 1000 / this.totalSeconds;
        if (percentWidth < 0 || percentWidth > 1) {
            //error? Log?
            console.log(dt);
            return;
        }

        const x: number = Math.trunc(percentWidth * this.width + 0.5);
        const dy: number = 5;

        // # add tick on line
        const addTick: boolean = kw.tick || true;
        if (addTick) {
            const stroke: string = kw.stroke || Colors.black;
            const line = this.drawing.line(x, -dy, x, dy)
                .stroke({color: stroke, width: 2});

            this.axisGroup.add(line);
        }

        // # add label
        const fill: string = kw.fill || Colors.gray;


        /*
         #self.drawing.text(label, insert=(x, -2 * dy), stroke='none', fill=fill, font_family='Helevetica',
         ##font_size='6pt', text_anchor='end', writing_mode='tb', transform=transform))
         */
        //writing mode?

        const txt = this.drawing.text(label);
        txt.font({family: 'Helevetica', size: '6pt', anchor: 'end'});
        txt.transform({rotation: 270, cx: x, cy: 0});
        txt.dx(x - 7).dy((-2 * dy) + 5);

        txt.fill(fill);

        this.axisGroup.add(txt);

        const h = Timeline.getTextMetrics('Helevetica', 6, label)[0] + 2 * dy;
        this.maxLabelHeight = Math.max(this.maxLabelHeight, h);

    }

    /**
     *
     * @returns {number} min_y ?
     */
    createCallouts(): number {

        type Info = [string, string];

        let minY = Infinity;
        if (!('callouts' in this.data)) {
            return;//undefined
        }
        const calloutsData: Array<Array<string>> = this.data.callouts;

        //# sort callouts
        const sortedDates: Array<number> = [];
        const invCallouts: Map<number, Array<Info>> = new Map();

        for (let callout of calloutsData) {

            const tmp: string = callout[1];
            const eventDate: number = (new Date(tmp)).valueOf();

            const event: string = callout[0];
            const eventColor: string = callout[2] || Colors.black;

            sortedDates.push(eventDate);
            if (!( invCallouts.has(eventDate))) {
                invCallouts.set(eventDate, []);// [event_date] = []
            }
            const newInfo: Info = [event, eventColor];
            const events: Array<Info> = invCallouts.get(eventDate);
            events.push(newInfo);

        }
        sortedDates.sort();


        //# add callouts, one by one, making sure they don't overlap
        let prevX = [-Infinity];
        let prevLevel = [-1];
        for (let eventDate of sortedDates) {
            const [event, eventColor]:Info = invCallouts.get(eventDate).pop();


            const numSeconds: number = (eventDate - this.date0) / 1000;
            const percentWidth: number = numSeconds / this.totalSeconds;
            if (percentWidth < 0 || percentWidth > 1) {
                continue;
            }

            const x: number = Math.trunc(percentWidth * this.width + 0.5);

            //# figure out what 'level" to make the callout on
            let k: number = 0;
            let i: number = prevX.length - 1;

            const left: number = x - (Timeline.getTextMetrics('Helevetica', 6, event)[0]
                + this.calloutProperties.width + this.textFudge[0]);

            while (left < prevX[i] && i >= 0) {
                k = Math.max(k, prevLevel[i] + 1);
                i -= 1;
            }

            const y: number = 0 - this.calloutProperties.height -
                k * this.calloutProperties.increment;
            minY = Math.min(minY, y);

            //path_data = 'M%i,%i L%i,%i L%i,%i'
            // % (x, 0, x, y, x - self.callout_size[0], y)
            const pathData: string = 'M' + x + ',' + 0 + ' L' + x + ',' + y + ' L'
                + (x - this.calloutProperties.width) + ',' + y;

            const pth = this.drawing.path(pathData).stroke({color: eventColor, width: 1});//fill none?
            pth.fill("white", 0);//nothing
            this.axisGroup.add(pth);

            const txt = this.drawing.text(event);
            txt.dx(x - this.calloutProperties.width - this.textFudge[0]);
            txt.dy(y - 4 * this.textFudge[1]);
            txt.font({family: 'Helevetica', size: '6pt', anchor: 'end'});
            txt.fill(eventColor);

            this.axisGroup.add(txt);

            const eDate: Date = new Date(eventDate);
            this.addAxisLabel(eDate, eDate.toLocaleString(),
                {tick: false, fill: Colors.black});

            //XXX white is transparent?
            const circ = this.drawing.circle(8).attr({fill: 'white', cx: x, cy: 0, stroke: eventColor});//this.drawing.circle(8);
            //circ.cx(x).cy(0);
            //circ.fill('#e2e', 0.5);
            //circ.stroke({color: event_color});


            this.axisGroup.add(circ);

            prevX.push(x);
            prevLevel.push(k);


        }

        return minY;

    }

    static getTextMetrics(family: string, size: number, text: string): [number, number] {

        const c: any = document.getElementById("dummyCanvas");
        const ctx = c.getContext("2d");
        ctx.font = size + " " + family;
        const w = ctx.measureText(text).width;
        const h = size; //TODO ?? #font.metrics("linespace")
        return [w, h];
    }

}





