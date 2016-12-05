"use strict";
var DetailView = (function() {
  var view = d3.select("#detail-view");
  var attributes = ["title", "authors", "author_tags", "citation_count", "abstract"];
  var currPaper = {};

  var selectors = [];

  var addAttribute = function(attrName) {
    var title = attrName.replace("_", " ");
    title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
    var group = view.append("div").attr("class", "group");
    group.append("div").attr("class", "head").html(title);
    selectors[attrName] = group.append("div").attr("class", "content");
  };
    
  return {
    init: function() {
      attributes.forEach(function(attribute) {
        addAttribute(attribute);
      });
    },
    update: function(newPaper) {
      // update currPaper object
      attributes.forEach(function(attribute) {
        currPaper[attribute] = newPaper[attribute];
      });

      // update view contents
      selectors.title.html(currPaper.title);
      selectors.authors.html("").selectAll("span")
        .data(currPaper.authors)
        .enter()
        .append("span")
        .attr("class", "author label label-info")
        .html(function(d) { return d.name; });
      selectors.author_tags.html("").selectAll("span")
        .data(currPaper.author_tags)
        .enter()
        .append("span")
        .attr("class", "author-tag label label-info")
        .html(function(d) { return d; });
      selectors.citation_count.html(currPaper.citation_count);
      selectors.abstract.html(currPaper.abstract);
    }
  };
})();
