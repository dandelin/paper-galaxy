"use strict";
function filterApplier(d) {
    return controller.isFiltered(d) ? 0.15 : 1;
}

function highlightApplier(d) {
    return controller.isFiltered(d) ? null : "#ff7f0e";
}

var PlotView = (function() {
    var makeLasso = function(scope) {
        var lasso_start = function() {
            lasso.items()
                //.style('opacity', 0.15)
                .style('stroke', null);
        };
        
        var lasso_draw = function() {
            lasso.items().filter(function(d) {return d.possible===true})
                .style('stroke-width', 1)
                .style('stroke', highlightApplier);
        };
        
        var lasso_end = function() {
            
            lasso.items().style('opacity', null);
            
            var selected = lasso.items().filter(function(d) {return d.selected===true && !controller.isFiltered(d)})
                .style('stroke-width', 1)
                .style('stroke', highlightApplier);
            
            SelectedView.updateSelectedPapers(selected);
        };
        
        // 라소 브러쉬를 위한 영역
        var lasso_area = scope.svg.append("rect")
            .attr('id', 'lasso_area')
            .attr("width", 0)
            .attr("height", 0)
            .style("opacity", 0);
        
        // 라소의 정의
        var lasso = scope.d3.lasso()
            .closePathDistance(1000)
            .area(lasso_area) // 영역의 정의
            .on('start', lasso_start)
            .on('draw', lasso_draw)
            .on('end', lasso_end);
        
        return lasso;
    };
    var makeGraph = function(){
        
        var children = [];
        var root_node = controller.currentPaper;
        var json = controller.paperObj;

        d3.selectAll('.paper')
            .filter(function(d){
                return json[root_node.id].cited_by.includes(d.id);
            })
            .each(function(d){
                var o = {
                    'id': d.id,
                    'parent': root_node.id,
                    'cited_by': true
                };
                children.push(o);
            });

        d3.selectAll('.paper')
            .filter(function(d){
                return json[root_node.id].references.includes(d.id);
            })
            .each(function(d){
                var o = {
                    'id': d.id,
                    'parent': root_node.id,
                    'cited_by': false
                };
                children.push(o);
            });

        children.forEach(function(node){
            var circle = d3.select('#p' + node.id);
            var pcircle = d3.select('#p' + node.parent);
            node.x = circle.attr('cx');
            node.y = circle.attr('cy');
            node.px = pcircle.attr('cx');
            node.py = pcircle.attr('cy');
        });


        var link = d3.select('#links').selectAll('line')
            .data(children, function(d){
                return d.id + d.parent;
            });
        
        link.enter()
            .append('line')
            .attr('x1', function(d) { return d.px})
            .attr('y1', function(d) { return d.py})
            .attr('x2', function(d) { return d.x})
            .attr('y2', function(d) { return d.y})
            .attr('stroke', function(d){
                if(d.cited_by === true) return 'steelblue';
                else return 'orange';
            })
            .attr('stroke-opacity', function(d){
                var ret = d3.select('#p' + d.id).attr('opacity');
                if(ret == null) return 1;
                else return ret;
            });

        link
            .attr('stroke-opacity', function(d){
                var ret = d3.select('#p' + d.id).attr('opacity');
                if(ret == null) return 1;
                else return ret;
            });

        link.exit()
            .remove();
    };
    function zoomed() {
        d3.select('.papergroup').attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
        d3.select('#links').attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
        d3.select('#lasso_area').attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    }
    return {
        init: function(data, tagList) {
            var margin = {top: 0, right: 0, bottom: 0, left: 0};
            var width = document.getElementById('plot-view').offsetWidth - margin.left - margin.right;
            var height = document.getElementById('plot-view').offsetHeight - margin.top - margin.bottom;
            var x = d3.scale.linear().domain(d3.extent(data, function(d) { return d.vec2[0]; })).range([0, width]);
            var y = d3.scale.linear().domain(d3.extent(data, function(d) { return d.vec2[1]; })).range([0, height]);
            var r = d3.scale.linear().domain(d3.extent(data, function(d) { return d.citation_count; })).range([2, 7]);

            var zoom = d3.behavior.zoom()
                .scaleExtent([1, 10])
                .on('zoom', function(){
                    if(!d3.event.sourceEvent.ctrlKey){
                        zoomed();
                    }
                });

            var svg = d3.select("#plot-view")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .style("display", "block")
                .style("margin", "auto")
                .call(zoom);

            d3.selectAll('svg').append('g').attr('id', 'links');
            var paperGroup = svg.append("g").attr('class', 'papergroup');

            //var topTags = tagList.map(function(d) {return d.tag; }).slice(6,25);
            
            var papers = paperGroup.selectAll(".paper")
            papers.data(data)
                .enter()
                .append("circle")
                .attr("class", "paper")
                .attr('id', function(d) { return 'p' + d.id; })
                .attr("cx", function(d) { return x(d.vec2[0]); })
                .attr("cy", function(d) { return y(d.vec2[1]); })
                .attr("r", function(d) { return r(d.citation_count); })
                .attr("fill", "black")
                //.attr("fill", function(d) {
                  //var color = d3.scale.category20().domain(topTags);
                  //var ret;
                  //d.author_tags.forEach(function(tag) {
                    //if(topTags.includes(tag)) {
                      //ret = color(tag);
                    //}
                  //});
                  //if(!ret) return "#eeeeee";
                  //else return ret;
                //})
                .on("click", function(d) {
                  controller.updateCurrentPaper(d);
                });
            

            var lasso = makeLasso({
                'd3': d3,
                'svg': svg,
                'width': width,
                'height': height
            });

            svg.on('mousemove', function(){
                if(d3.event.ctrlKey){
                    d3.select('#lasso_area').attr('width', width).attr('height', height);
                }
                else{
                    d3.select('#lasso_area').attr('width', 0).attr('height', 0);
                }
            });

            lasso.items(d3.selectAll(".paper"));
            paperGroup.call(lasso);
        },
        refresh: function() {
            var papers = d3.selectAll(".paper")
                // .transition()
                // .duration(200)
                // .ease("quad")
                .attr("opacity", filterApplier);
        },
        drawGraph: function() {
            makeGraph();
        }
    };
})();
