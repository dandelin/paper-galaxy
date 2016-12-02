(function(global) {
  // paperList: list of paper objects
  // tagList: list of frequencies of each author tag
  Model.init(function(paperList, tagList) {
    PlotView.init(paperList);
  });
})(this);
