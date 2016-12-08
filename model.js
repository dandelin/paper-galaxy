"use strict";
var Model = (function() {
  return {
    init: function(callback) {
      var JSON_FILENAME = "./chi_simple_new_abstract2.json";
      var paperList = [];
      var tags = {};
      var tagList = [];
      var rangeList = [];
      var authorHash = {};
      var yearList = [];
      var citList = [];
      var refList = [];
      var occurrences = {};
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

        // init rangeList
        rangeList = [getMinMax(json, "year"), 
          getMinMax(json, "citation_count"),
          getMinMax(json, "reference_count")];

        // init occurrence lists
        yearList = initOccurrencArray(rangeList[0]);
        citList = initOccurrencArray(rangeList[1]);
        refList = initOccurrencArray(rangeList[2]);

        // pre-process papers
        paperList.forEach(function(d) {
          // calculate author tags frequencies
          d.author_tags.forEach(function(tag) {
            if(tag in tags) { tags[tag]++; }
            else { tags[tag] = 1; }
          });

          // calculate year occurrences
          var i = yearList.getItemIndex(function(e) { return e.key === d.year; });
          if (i >= 0) { yearList[i].value += 1; }
          else { yearList.push({key: d.year, value: 1}); }
          
          // calculate citation_count occurrences
          citList[d.citation_count].value += 1;

          // calculate reference_count occurrences
          refList[d.reference_count].value += 1;
          
          // get all unique author hash
          d.authors.forEach(function(author) {
            if (!authorHash[author.id]) {
              authorHash[author.id] = author.name;
            }
          });
        });
        
        Object.keys(tags).forEach(function(key) {
          tagList.push({"tag": key, "freq": tags[key]});
        });
        tagList.sort(function(a,b) { return b.freq - a.freq; });

        // generate occurrences
        occurrences.year = yearList;
        occurrences.cit = citList;
        occurrences.ref = refList;

        // execute callback function
        callback(json, paperList, tagList, rangeList, authorHash, occurrences);
      });
    }
  };
})();
