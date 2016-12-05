"use strict";
function filterApplier(d) {
  return controller.isFiltered(d) ? 0.15 : 1;
}

function highlightApplier(d) {
  return controller.isFiltered(d) ? null : "yellow";
}

var PlotView = (function() {
  var makeLasso = function(scope) {

      var lasso_start = function() {
          lasso.items()
              .style('opacity', 0.15)
              .style('stroke', null);
      };

      var lasso_draw = function() {
          lasso.items().filter(function(d) {return d.possible===true})
              .style('opacity', filterApplier);

          lasso.items().filter(function(d) {return d.possible===false})
              .style('opacity', 0.15);
      };

      var lasso_end = function() {
          lasso.items().style('opacity', null);

          var selected = lasso.items().filter(function(d) {return d.selected===true})
              .style('stroke-width', 1)
              .style('stroke', highlightApplier);
          SelectedView.updateSelectedPapers(selected);
      };

      // 라소 브러쉬를 위한 영역
      var lasso_area = scope.svg.append("rect")
          .attr("width", scope.width)
          .attr("height", scope.height)
          .style("opacity", 0);
      
      // 라소의 정의
      var lasso = scope.d3.lasso()
          .area(lasso_area) // 영역의 정의
          .items(scope.d3.selectAll(".paper"))
          .on('start', lasso_start)
          .on('draw', lasso_draw)
          .on('end', lasso_end);

      return lasso;
  };

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
    },

    refresh: function() {
      var papers = d3.selectAll(".paper").transition()
        .duration(500)
        .ease("quad")
        .attr("opacity", filterApplier);
    }

  };
})();
