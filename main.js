(function(global) {
  // paperList: list of paper objects
  // tagList: list of frequencies of each author tag
  // ranList: list of filter ranges (year, citCount, refCount)
  Model.init(function(paperList, tagList, rangeList) {
    PlotView.init(paperList);
    filterView.init(rangeList)
    DetailView.init();
  });
})(this);
