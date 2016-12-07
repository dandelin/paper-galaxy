"use strict";
var DetailView = (function() {
    var view = d3.select("#detail-view");
    var attributes = ["title", "authors", "author_tags", "citation_count", "abstract"];
    var currentPaper = {};

    var selectors = [];

    var addAttribute = function(attrName) {
        var title = attrName.replace("_", " ");
        title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
        var group = view.append("div").attr("class", "group");
        group.append("div").attr("class", "head").html(title);
        selectors[attrName] = group.append("div").attr("class", "content");
    };

    attributes.forEach(function(attribute) {
        addAttribute(attribute);
    });
        
    return {
        update: function(newPaper) {
            // update currentPaper object
            attributes.forEach(function(attribute) {
                currentPaper[attribute] = newPaper[attribute];
            });

            // update view contents
            selectors.title.html(currentPaper.title);
            selectors.authors.html("").selectAll("span")
                .data(currentPaper.authors)
                .enter()
                .append("span")
                .attr("class", "author label label-info")
                .html(function(d) { return d.name; });
            selectors.author_tags.html("").selectAll("span")
                .data(currentPaper.author_tags)
                .enter()
                .append("span")
                .attr("class", "author-tag label label-info")
                .html(function(d) { return d; });
            selectors.citation_count.html(currentPaper.citation_count);
            selectors.abstract.html(currentPaper.abstract);
        },
    };
})();
