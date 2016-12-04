var PlotView = (function() {
  return {
    init: function(data) {
      var margin = {top: 20, right: 20, bottom: 20, left: 20};
      var width = document.getElementById('plot-view').offsetWidth - margin.left - margin.right;
      var height = document.getElementById('plot-view').offsetHeight - margin.top - margin.bottom;
      var x = d3.scale.linear().domain(d3.extent(data, function(d) { return d.vec2[0]; })).range([0, width]);
      var y = d3.scale.linear().domain(d3.extent(data, function(d) { return d.vec2[1]; })).range([0, height]);
      var r = d3.scale.linear().domain(d3.extent(data, function(d) { return d.citation_count; })).range([2, 6]);

      var svg = d3.select("#plot-view")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("display", "block")
        .style("margin", "auto");

      var paperG = svg.append("g");

      var papers = paperG.selectAll(".paper")
        .data(data);

      papers.enter()
        .append("circle")
        .attr("class", "paper")
        .attr("cx", function(d) { return x(d.vec2[0]); })
        .attr("cy", function(d) { return y(d.vec2[1]); })
        .attr("r", function(d) { return r(d.citation_count); });
        
      var lasso = makeLasso({
        'd3': d3,
        'svg': svg,
        'width': width,
        'height': height
      });
      
      svg.call(lasso);
    }
  };
})();
