"use strict";
var DetailView = (function() {
    var view = d3.select("#detail-view");
    var linkFormat = "http://dl.acm.org/citation.cfm?id=";
    var attributes = ["title", "link", "publication_date", "authors", "author_tags", "citation_count", "abstract"];

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
            // update view contents
            selectors.title.html(newPaper.title);
            selectors.link.html("").append("a")
                .attr("href", linkFormat+newPaper.id)
                .attr("target", "_blank")
                .style("font-size", "8px")
                .html(linkFormat+newPaper.id);
            selectors.publication_date.html(newPaper.publication_date);
            selectors.authors.html("").selectAll("span")
                .data(newPaper.authors)
                .enter()
                .append("span")
                .attr("class", "author label label-info")
                .html(function(d) { return d.name; })
                .style("cursor", "pointer")
                .on('mouseenter', function(d){
                    controller.mouseOnAuthor(d.name);
                })
                .on('mouseout', function(d){
                    controller.mouseOutAuthor(d.name);
                })
                .on('click', function(d){
                    controller.clickAuthor(d.name);
                });
            selectors.author_tags.html("").selectAll("span")
                .data(newPaper.author_tags)
                .enter()
                .append("span")
                .attr("class", "author-tag label label-info")
                .html(function(d) { return d; });
            selectors.citation_count.html(newPaper.citation_count);
            selectors.abstract.html(newPaper.abstract);
        },
    };
})();
