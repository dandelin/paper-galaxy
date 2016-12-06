(function(global) {
  // paperList: list of paper objects
  // tagList: list of frequencies of each author tag
  // ranList: list of filter ranges (year, citCount, refCount)
  Model.init(function(paperList, tagList, rangeList, authorList) {
    PlotView.init(paperList);
    controller.init(paperList, tagList, authorList);
    filterView.init(rangeList);
    DetailView.init();
  });
})(this);
