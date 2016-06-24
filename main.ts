let draw = SVG('drawing')//.size(300, 300);
let rect = draw.rect(100, 100).attr({fill: 'green', stroke: 'blue'});

let sample = "simple_timeline.json";
let anime = "no.json";
let tl = new Timeline(sample, "sampleTimeline");
let t2 = new Timeline(anime, "animeTimeline");
//console.log( tl.data);
tl.build();
t2.build();
