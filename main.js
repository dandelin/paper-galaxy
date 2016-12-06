(function(global) {
  // paperList: list of paper objects
  // tagList: list of frequencies of each author tag
  // ranList: list of filter ranges (year, citCount, refCount)
  Model.init(function(paperObj, paperList, tagList, rangeList) {
    PlotView.init(paperList, tagList);
    filterView.init(rangeList)
    CitationView.init(paperObj);
  });
})(this);
