"use strict";
var Model = (function() {
  return {
    init: function(callback) {
      var JSON_FILENAME = "./chi_new.json";
      var paperList = [];
      var tags = {};
      var tagList = [];
      d3.json(JSON_FILENAME, function(error, json) {
        // convert json objects to paperList
        Object.keys(json).forEach(function(key) {
          json[key]["id"] = key;
          json[key].vec2[0] = parseFloat(json[key].vec2[0]);
          json[key].vec2[1] = parseFloat(json[key].vec2[1]);
          json[key].citation_count = parseInt(json[key].citation_count);
          paperList.push(json[key]);
        });

        // calculate author tags frequencies
        paperList.forEach(function(d) {
          d.author_tags.forEach(function(tag) {
            if(tag in tags) { tags[tag]++; }
            else { tags[tag] = 1; }
          });
        });
        Object.keys(tags).forEach(function(key) {
          tagList.push({"tag": key, "freq": tags[key]});
        });
        tagList.sort(function(a,b) { return b.freq - a.freq; });

        // execute callback function
        callback(paperList, tagList);
      });
    }
  };
})();
