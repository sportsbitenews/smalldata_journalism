var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.ordinal()
    .range(["#b00","#00b"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .tickFormat(d3.format("04d"))
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .tickFormat(d3.format(".1f"))
    .orient("left");

var line = d3.svg.line()
/*    .interpolate("basis")*/
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.unemployment_rate); });

var svg = d3.select("#chart-holder").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("unemployment-data.tsv", function(error, data) {
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Year"; }));

  data.forEach(function(d) {
    d.date = d['Year'];
  });

  var countries = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, unemployment_rate: +d[name]};
      })
    };
  });


  x.domain(d3.extent(data, function(d) { return d.date; }));

  y.domain([
    d3.min(countries, function(c) { return d3.min(c.values, function(v) { return v.unemployment_rate; }); }),
    d3.max(countries, function(c) { return d3.max(c.values, function(v) { return v.unemployment_rate; }); })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("x", 380)
      .attr("y", -10)
      .text("April, year-over-year");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Unemployment rate");

  var country = svg.selectAll(".country")
      .data(countries)
    .enter().append("g")
      .attr("class", "country");

  country.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });

  country.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.unemployment_rate) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });
});