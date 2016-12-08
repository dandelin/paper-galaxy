var StatView = (function() {
    var view = d3.select("#stat-view-body");
    var margin = {top: 10, bottom: 10, left: 10, right: 10};
    var width = document.getElementById("stat-view-body").offsetWidth - margin.left - margin.right;
    var height = document.getElementById("stat-view-body").offsetHeight - margin.top - margin.bottom;

    // cooccurSvg, wordleSvg, refSvg, yearSvg
    var wordleSvg = view.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate("+margin.left+","+margin.top+")");

    return {
        update: function(selected) {
            // wordle
            // calculate tag frequency list using wordles
            var tagObj = {}, tagList = [];
            selected.forEach(function(d) {
                d.author_tags.forEach(function(tag) {
                    if(!tagObj[tag]) {
                        tagObj[tag] = {tag: tag, papers: [d]};
                    } else {
                        tagObj[tag]["papers"].push(d);
                    }
                });
            });
            Object.keys(tagObj).forEach(function(key) {
                tagList.push(tagObj[key]);
            });
            tagList.sort(function(a, b) { return b.papers.length - a.papers.length; });
            tagList = tagList.slice(5, 35);

            // create wordle layout
            var fill = d3.scale.category10();
            var size = d3.scale.linear().domain(d3.extent(tagList, function(d) { return d.papers.length; })).range([6, 36]);
            var layout = d3.layout.cloud()
                .size([width, height])
                .words(tagList)
                .padding(4)
                .rotate(function(d) { return 0; })
                .text(function(d) { return d.tag; })
                .font("Sans-serif")
                .fontWeight("bold")
                .fontSize(function(d) { return size(d.papers.length); })
                .on("end", function(data) {
                    fill.domain(Array.apply(null, {length: data.length}).map(Number.call, Number));
                    var text = wordleSvg.attr("transform", "translate(" + [width/2, height/2] + ")")
                        .selectAll("text")
                        .data(data, function(d) { return d.tag; });

                    text
                        .transition("wordle-update")
                        .duration(200)
                        .style("font-size", function(d) { return d.size+"px"; })
                        .attr("fill", function(d, i) { return fill(i); })
                        .attr("transform", function(d) { return "translate("+[d.x, d.y]+")"; });

                    text.enter()
                    .append("text")
                        .attr("fill", function(d, i) { return fill(i); })
                        .attr("transform", function(d) { return "translate("+[d.x, d.y]+")"; })
                        .transition("wordle-enter")
                        .duration(200)
                        .style("font-size", function(d) { return d.size+"px"; })
                        .style("font-weight", "bold")
                        .style("font-family", "Sans-serif")
                        .style("user-select", "none")
                        .attr("text-anchor", "middle")
                        .text(function(d) { return d.tag; });

                    text.exit()
                        .transition("wordle-exit")
                        .duration(200)
                        .style("font-size", "0px")
                        .style("fill-opacity", 1e-6)
                        .remove();
                })
                .start();
        }
    };
})();
