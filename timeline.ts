let draw = SVG('drawing').size(300, 300);
let rect = draw.rect(100, 100).attr({fill: '#f06'});


//Translate the python

let Colors = {black: '#000000', gray: '#C0C0C0'};

class Timeline {

    public data;

    public start_date:Date;
    public end_date:Date;

    public date0:number;
    public date1:number;
    public total_secs:number;

    public callout_size:[number,number,number];
    public text_fudge:[number,number];
    public tick_format:string;
    public markers;

    public fonts;

    public max_label_height:number;

    public width:number;

    public drawing;
    public g_axis;

    private loadData(filename){
        let data = (function () {
            let json = null;
            $.ajax({
                'async': false,
                'global': false,
                'url': filename,
                'dataType': "json",
                'success': function (data) {
                    json = data;
                }
            });
            return json;
        })();
        return data;
    }

    ///
    //__init__
    ///
    constructor(filename) {

        this.data = this.loadData(filename);

        /*
         assert 'width' in self.data, 'width property must be set'
         assert 'start' in self.data, 'start property must be set'
         assert 'end' in self.data, 'end property must be set'
         */

        //# create drawing
        this.width = this.data['width'];

        this.drawing = SVG('timeline')//.size(this.width, this.width);//svgwrite.Drawing()

        //self.drawing['width'] = self.width
        this.g_axis = this.drawing.group(); //g()

        /*
         # figure out timeline boundaries
         self.cal = parsedatetime.Calendar()
         self.start_date = self.datetime_from_string(self.data['start'])
         self.end_date = self.datetime_from_string(self.data['end'])
         delta = self.end_date[0] - self.start_date[0]
         padding = datetime.timedelta(seconds=0.1*delta.total_seconds())
         self.date0 = self.start_date[0] - padding
         self.date1 = self.end_date[0] + padding
         self.total_secs = (self.date1 - self.date0).total_seconds()
         */
        this.start_date = new Date(this.data['start']);
        this.end_date = new Date(this.data['end']);

        const delta:number = (this.end_date.valueOf() - this.start_date.valueOf());// / 1000;
        const padding:number = (new Date(delta * 0.1)).valueOf();

        this.date0 = this.start_date.valueOf() - padding;
        this.date1 = this.end_date.valueOf() + padding;
        this.total_secs = (this.date1 - this.date0) / 1000;

        /*
         # set up some params
         self.callout_size = (10, 15, 10) # width, height, increment
         self.text_fudge = (3, 1.5)
         self.tick_format = self.data.get('tick_format', None)
         self.markers = {}
         */
        this.callout_size = [10, 15, 10]; // width, height, increment
        this.text_fudge = [3, 1.5];
        this.tick_format = this.data.tick_format;
        this.markers = {};

        /*
         //no need?
         # initialize Tk so that font metrics will work
         self.tk_root = Tkinter.Tk()
         self.fonts = {}
         */
        this.fonts = {};

        //# max_label_height stores the max height of all axis labels
        //# and is used in the final height computation in build(self)
        this.max_label_height = 0;
    }

    ///
    //END __init__
    ///

    build() {
        //# MAGIC NUMBER: y_era
        //# draw era label and markers at this height
        const y_era:number = 10;

        //# create main axis and callouts,
        //# keeping track of how high the callouts are
        this.create_main_axis();
        let y_callouts = this.create_callouts();

        //# determine axis position so that axis + callouts don't overlap with eras
        let y_axis:number = y_era + this.callout_size[1] - y_callouts;

        //# determine height so that eras, callouts, axis, and labels just fit
        let height:number = y_axis + this.max_label_height + 4 * this.text_fudge[1];

        //# create eras and labels using axis height and overall height
        this.create_eras(y_era, y_axis, height);
        this.create_era_axis_labels();

        //# translate the axis group and add it to the drawing
        this.g_axis.translate(0, y_axis);
        this.drawing.add(this.g_axis);

        //# finally set the height on the drawing
        this.drawing['height'] = height

    };

    //TODO
    save(filename) {
    }

    to_string() {
    }

    //this.datetime_from_string = function(s){}

    create_eras(y_era, y_axis, height) {
        if (!('eras' in this.data)) {
            return;
        }
        //# create eras
        let eras_data = this.data['eras'];
        let markers = {};

        for (let era of eras_data) {
            //# extract era data
            /*
             t0 = self.datetime_from_string(era[1])
             t1 = self.datetime_from_string(era[2])
             */

            let name = era[0];

            const t0:number = (new Date(era[1])).valueOf();
            const t1:number = (new Date(era[2])).valueOf();

            //fill = era[3] if len(era) > 3 else Colors.gray
            const fill:string = (era.length > 3) ? era[3] : Colors.gray;

            //# get marker objects
            //XXX
            let [start_marker, end_marker] = this.get_markers(fill);
            //assert start_marker is not None
            //assert end_marker is not None

            //# create boundary lines
            //XXX js date
            const percent_width0:number = (t0 - this.date0) / 1000 / this.total_secs;
            const percent_width1:number = (t1 - this.date0) / 1000 / this.total_secs;

            let x0:number = Math.trunc(percent_width0 * this.width + 0.5);
            let x1:number = Math.trunc(percent_width1 * this.width + 0.5);


            let rect = this.drawing.add(this.drawing.rect((x0, 0), (x1 - x0, height)));
            //rect.fill(fill, None, 0.15)
            rect.fill({color: fill, opacity: 0.15});

            let line0 = this.drawing.add(
                this.drawing.line(x0, 0, x0, y_axis)
                    .stroke({color: fill, width: 0.5})
            );
            //TODO
            //http://svgwrite.readthedocs.io/en/latest/classes/mixins.html#svgwrite.mixins.Presentation.dasharray
            //line0.dasharray([5, 5])

            let line1 = this.drawing.add(
                this.drawing.line(x1, 0, x1, y_axis)
                    .stroke({color: fill, width: 0.5})
            );
            //line1.dasharray([5, 5])


            //# create horizontal arrows and text
            let horz = this.drawing.add(
                this.drawing.line(x0, y_era, x1, y_era)
                    .stroke({color: fill, width: 0.75})
            );

            //TODO
            /*
             horz['marker-start'] = start_marker.get_funciri()
             horz['marker-end'] = end_marker.get_funciri()
             self.drawing.add(self.drawing.text(name, insert=(0.5*(x0 + x1), y_era - self.text_fudge[1]), stroke='none', fill=fill, font_family="Helevetica", font_size="6pt", text_anchor="middle"))
             */
        }
    };

    /**
     * @param {String} color
     * @return {Array<marker, marker>}
     */
    get_markers(color:string) {

        let start_marker;
        let end_marker;

        if (color in this.markers) {
            [start_marker, end_marker] = this.markers[color];
        } else {
            start_marker = this.drawing.marker(10, 10, function (add) {
                add.path("M6,0 L6,7 L0,3 L6,0").fill(color)
            }).ref(0, 3);

            end_marker = this.drawing.marker(10, 10, function (add) {
                add.path("M0,0 L0,7 L6,3 L0,0").fill(color)
            }).ref(6, 3);

            this.markers[color] = [start_marker, end_marker]
        }

        return [start_marker, end_marker]
    };


    create_main_axis() {
        console.log("good");
        //# draw main line
        this.g_axis.add(this.drawing.line(0, 0, this.width, 0)
            .stroke({color: Colors.black, width: 3}));

        //# add tickmarks
        //self.add_axis_label(self.start_date, str(self.start_date[0]), tick=True)
        this.add_axis_label(this.start_date, this.start_date.toDateString());
        this.add_axis_label(this.end_date, this.end_date.toDateString());

        if ('num_ticks' in this.data) {
            let delta = this.end_date.valueOf() - this.start_date.valueOf();
            //let secs = delta / 1000
            let num_ticks = this.data['num_tics'];
            for (let j = 1; j < num_ticks; j++) {
                let tick_delta = /*new Date*/(j * delta / num_ticks);
                let tickmark_date = new Date(this.start_date.valueOf() + tick_delta);
                this.add_axis_label(tickmark_date, tickmark_date.toDateString())
            }
        }
    }

    create_era_axis_labels():void {
        if (!('eras' in this.data)) {
            return;
        }

        const eras_data = this.data['eras'];

        //error? yess error. fucj javascript
        //console.log(eras_data)
        for (let era of eras_data) {
            let t0 = new Date(era[1]);
            //console.log("called? "+era[1]);
            //console.log(t0);
            let t1 = new Date(era[2]);
            this.add_axis_label(t0, t0.toDateString());
            this.add_axis_label(t1, t1.toDateString());
        }
    }

    //def add_axis_label(self, dt, label, **kwargs):
    add_axis_label(dt:Date, label:string, kw?) {
        //date, string?
        kw = kw || {};
        if (this.tick_format) {
            //##label = dt[0].strftime(self.tick_format)
            // label = dt
            //TODO
        }
        const percent_width:number = (dt.valueOf() - this.date0) / 1000 / this.total_secs;
        if (percent_width < 0 || percent_width > 1) {
            //error? Log?
            return;
        }

        const x:number = Math.trunc(percent_width * this.width + 0.5);
        const dy:number = 5;

        // # add tick on line
        const add_tick:boolean = kw['tick'] || true;
        if (add_tick) {
            let stroke:string = kw['stroke'] || Colors.black;
            const line = this.drawing.line(x, -dy, x, dy)
                .stroke({color: stroke, width: 2});

            this.g_axis.add(line);
        }

        // # add label
        const fill = kw['fill'] || Colors.gray;
        let transfrom = "rotate(180, " + x + ", 0)";

        /*
         #self.drawing.text(label, insert=(x, -2 * dy), stroke='none', fill=fill, font_family='Helevetica',
         ##font_size='6pt', text_anchor='end', writing_mode='tb', transform=transform))
         */
        //writing mode? stroke? fill?

        let txt = this.drawing.text(label);
        txt.font({family: 'Helevetica', size: '6pt', anchor: 'end'});
        txt.dx(x).dy(-2 * dy);//txt.ref(x, -2 * dy)? marker?
        txt.transform({rotation: 180, cx: x, cy: 0});
        txt.fill(fill);
        this.g_axis.add(txt);

        let h = this.get_text_metrics('Helevetica', 6, label)[0] + 2 * dy;
        this.max_label_height = Math.max(this.max_label_height, h);

    }


    create_callouts():number {
        let min_y = Infinity;
        if (!('callouts' in this.data)) {
            return;
        }
        let callouts_data = this.data['callouts'];

        //# sort callouts
        let sorted_dates = [];
        let inv_callouts = {};

        for (let callout of callouts_data) {

            let event = callout[0];
            let event_date = callout[1]; //new Date(callout[1]);
            let event_color = callout[2] || Colors.black;
            sorted_dates.push(event_date);
            if (!(event_date in inv_callouts)) {
                inv_callouts[event_date] = []
            }
            inv_callouts[event_date].push([event, event_color])
        }
        sorted_dates.sort();

        //# add callouts, one by one, making sure they don't overlap
        let prev_x = [-Infinity];
        let prev_level = [-1];
        for (let event_date of sorted_dates) {
            let [event, event_color] = inv_callouts[event_date].pop();
            let num_sec = (event_date - this.date0) / 1000;
            let percent_width = num_sec / this.total_secs;
            if (percent_width < 0 || percent_width > 1) {
                continue;
            }
            let x = Math.trunc(percent_width * this.width + 0.5);
            //# figure out what 'level" to make the callout on
            let k = 0;
            let i = prev_x.length - 1;
            let left = x - (this.get_text_metrics('Helevetica', 6, event)[0]
                + this.callout_size[0] + this.text_fudge[0]);
            while (left < prev_x[i] && i >= 0) {
                k = Math.max(k, prev_level[i] + 1);
                i -= 1;
            }
            let y = 0 - this.callout_size[1] - k * this.callout_size[2];
            min_y = Math.min(min_y, y);

            //path_data = 'M%i,%i L%i,%i L%i,%i'
            // % (x, 0, x, y, x - self.callout_size[0], y)
            let path_data = 'M' + x + ',' + 0 + ' L' + x + ',' + y + ' L'
                + (x - this.callout_size[0]) + ',' + y;

            let pth = this.drawing.path(path_data).stroke({color: event_color, width: 1});//fill none?
            this.g_axis.add(pth);
            let txt = this.drawing.text(event);
            txt.dx(x - this.callout_size[0] - this.text_fudge[0]);
            txt.dy(y + this.text_fudge[1]);
            txt.font({family: 'Helevetica', size: '6pt', anchor: 'end'});
            txt.fill(event_color);
            this.g_axis.add(txt);

            this.add_axis_label(event_date, event_date.toLocaleString(),
                {tick: false, fill: Colors.black});
            let circ = this.drawing.circle(8);
            circ.cx(x).cy(0).stroke({color: event_color}).fill('white');
            prev_x.push(x);
            prev_level.push(k);


        }

        //console.log("no fali?")
        return min_y;

    }

    get_text_metrics(family:string, size:number, text:string):[number,number] {
        /*
         let font;
         let key = [family, size];
         if (key in this.fonts) {
         font = this.fonts[key];
         } else {

         }
         */

        let c:any = document.getElementById("dummyCanvas");
        let ctx = c.getContext("2d");
        ctx.font = size + " " + family;
        let w = ctx.measureText(text).width;
        let h = size; //font.metrics("linespace")
        return [w, h];
    }

}

// /**
//  * Math.trunc is es6
//  * @param n
//  * @returns {number}
//  */
// function truncate(n:number):number {
//     return Math[n > 0 ? "floor" : "ceil"](n);
// }

let fname = "simple_timeline.json";
let tl = new Timeline(fname);
console.log("log: " + tl.data);
tl.build();