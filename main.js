(function(global) {
  // paperList: list of paper objects
  // tagList: list of frequencies of each author tag
  // rangeList: list of filter ranges (year, citCount, refCount)
  Model.init(function(paperObj, paperList, tagList, rangeList, authorHash, occurrences) {
    PlotView.init(paperList, tagList);
    controller.init(paperList, tagList, authorHash, paperObj);
    filterView.init(rangeList, occurrences);
    //CitationView.init(paperObj);
  });
})(this);
