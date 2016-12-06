"use strict";
var Model = (function() {
  return {
    init: function(callback) {
      var JSON_FILENAME = "./chi_simple_new_abstract2.json";
      var paperList = [];
      var tags = {};
      var tagList = [];
      var rangeList = [];
      var authorList = [];
      d3.json(JSON_FILENAME, function(error, json) {
        // convert json object to paperList
        var paperIds = Object.keys(json);
        paperIds.forEach(function(paperId) {
          json[paperId]["id"] = paperId;
          json[paperId].vec2[0] = parseFloat(json[paperId].vec2[0]);
          json[paperId].vec2[1] = parseFloat(json[paperId].vec2[1]);
          json[paperId].citation_count = parseInt(json[paperId].citation_count);
          json[paperId].year = parseInt(json[paperId].publication_date.split("-")[0]);
          json[paperId].reference_count = json[paperId].references.length;
          json[paperId].cited_by = json[paperId].cited_by.filter(function(d) { return paperIds.includes(d); });
          json[paperId].references = json[paperId].references.filter(function(d) { return paperIds.includes(d); });
          paperList.push(json[paperId]);
        });

        // pre-process papers
        paperList.forEach(function(d) {
          // calculate author tags frequencies
          d.author_tags.forEach(function(tag) {
            if(tag in tags) { tags[tag]++; }
            else { tags[tag] = 1; }
          });

          // get all unique author list
          d.authors.forEach(function(author) {
            authorList.pushIfNotExist(author, function(a) {
              return a.id === author.id;
            });
          });
        });
        
        Object.keys(tags).forEach(function(key) {
          tagList.push({"tag": key, "freq": tags[key]});
        });
        tagList.sort(function(a,b) { return b.freq - a.freq; });


        // init filterView
        rangeList = [getMinMax(json, "year"), 
          getMinMax(json, "citation_count"),
          getMinMax(json, "reference_count")];

        // execute callback function
        callback(json, paperList, tagList, rangeList, authorList);
      });
    }
  };
})();
