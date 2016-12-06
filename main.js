(function(global) {
  // paperList: list of paper objects
  // tagList: list of frequencies of each author tag
  // rangeList: list of filter ranges (year, citCount, refCount)
  Model.init(function(paperObj, paperList, tagList, rangeList, authorList) {
    PlotView.init(paperList, tagList);
    controller.init(paperList, tagList, authorList);
    filterView.init(rangeList)
    CitationView.init(paperObj);
  });
})(this);
