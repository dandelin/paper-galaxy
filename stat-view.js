var StatView = (function() {
    var view = d3.select("#stat-view-body");
    var margin = {top: 10, bottom: 10, left: 10, right: 10};
    var width = document.getElementById("stat-view-body").offsetWidth - margin.left - margin.right;
    var height = document.getElementById("stat-view-body").offsetHeight - margin.top - margin.bottom;

    // cooccurSvg, wordleSvg, refSvg, yearSvg
    var wordleSvg = view.append("svg")
        .attr("width", width)
        .attr("height", height)
    .append("g")
        .attr("transfrom", "translate("+margin.left+","+margin.top+")");

    return {
        update: function(selected) {
            // wordle
            var tagObj = {}, tagList = [];
            selected.forEach(function(d) {
                d.author_tags.forEach(function(tag) {
                    if(tagObj["tag"]) {
                        tagObj["tag"] = {tag: tag, freq: 1};
                    } else {
                        tagObj["tag"]["freq"]++;
                    }
                });
            });
            Object.keys(tags).forEach(function(key) {
                tagList.push(tags[key]);
            });
            console.log(tagList);
        }
    };
})();
