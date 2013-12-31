var dataRequest = new XMLHttpRequest();

dataRequest.onload = function() {
  onDataLoad(this.responseText);
};

dataRequest.open("get", "data/2012_nfl_pbp_data.csv", true);
dataRequest.send();

function onDataLoad(data) {
  var lines = data.split("\n");
  var i = 0;
  var events = CSV.getObjects(lines);

  var passYards = [];
  var runYards = [];

  for(var i = 0; i < events.length - 1; i++) {
    var evt = events[i];
    var nextEvt = events[i+1];
    //if(evt.gameid !== "20120905_DAL@NYG") continue;
    // discard turnovers
    //if(evt.off !== "NYG")
    //  continue;
    if(evt.def !== nextEvt.def)
      continue;

    // discard penalties
    if(evt.description.indexOf("PENALTY") >= 0)
      continue;
    if(evt.description.indexOf("kneel") >= 0)
      continue;
    if(evt.description.indexOf("extra") >= 0)
      continue;

    var diff = parseInt(evt.ydline) - parseInt(nextEvt.ydline);
    if(evt.description.indexOf("pass") >= 0) {
      passYards.push(diff);
    } else {
      runYards.push(diff);
    }
  }
  // var passAvg = passYards.reduce(function(acc,val) { return acc + val/passYards.length; }, 0);
  // var runAvg = runYards.reduce(function(acc,val) { return acc + val/runYards.length; }, 0);
  // console.log("passes get "+passAvg+" yards on average");
  // console.log("runs get "+runAvg+" yards on average");

  graphYards(passYards, runYards);
}

// derived from mbostock's d3 examples
function graphYards(passYards, runYards) {
  var margin = {top: 10, right: 30, bottom: 30, left: 30},
      width = 1920 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  var yardsMax = Math.max(d3.max(passYards), d3.max(runYards));
  var x = d3.scale.linear()
    .domain([0,yardsMax])
    .range([0,width]);

  var passData = d3.layout.histogram()
    .bins(d3.range(yardsMax))
    (passYards);

  var runData = d3.layout.histogram()
    .bins(d3.range(yardsMax))
    (runYards);

  var formatCount = d3.format(",.0f");

  function getY(d) {
    return d.y;
  }

  var dataMax = Math.max(d3.max(passData, getY), d3.max(runData, getY));

  var y = d3.scale.linear()
    .domain([0, dataMax])
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var svg = d3.select("#container").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate("+margin.left+","+margin.top+")");

  function createBar(data, dataClass) {
    xoff = dataClass === "pass" ? x(data[0].dx)*2/4 : 0;
    var bar = svg.selectAll(".bar."+dataClass)
        .data(data)
      .enter().append("g")
        .attr("class", "bar "+dataClass)
        .attr("transform", function(d) { return "translate("+x(d.x)+","+y(d.y)+")"; });

    bar.append("rect")
        .attr("x", 1 + xoff)
        .attr("width", (x(data[0].dx) - 1)/2)
        .attr("height", function(d) { return height - y(d.y); });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", x(data[0].dx)/4 + xoff)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatCount(d.y); });
  }

  createBar(passData, "pass");
  createBar(runData, "run");
  console.log("y: "+y(passData[1].y));

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0,"+height+")")
    .call(xAxis);
}
