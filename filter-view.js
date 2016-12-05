function FilterView() {
  this.yearFilter = {};
  this.citFilter = {};
  this.refFilter = {};
}

FilterView.prototype = {
  init: function (rangeList) {
    console.log("filterView init()");
    filterView.addSlider("Year", rangeList[0], this.yearFilter);
    filterView.addSlider("Citation Count", rangeList[1], this.citFilter);
    filterView.addSlider("Reference Count", rangeList[2], this.refFilter);
  },
  addSlider: function(text, range, filter) {
    filter.min = range.min;
    filter.max = range.max;
    d3.select("#filter-view").append('div')
      .attr("class", "sliderFilter")
      .text(text)
    .append('div')
      .attr("class", "slider")
      .call(d3.slider().axis(true).min(range.min).max(range.max).step(1).value([range.min,range.max]).on("slide", function(evt, value) {

        // call controller to update filter
        filter.min = arrayToMinMax(value).min;
        filter.max = arrayToMinMax(value).max;
        controller.updateFilter();
      }));
  },
  
  getFilters: function() {
    return {
      yearFilter: this.yearFilter,
      citFilter: this.citFilter,
      refFilter: this.refFilter
    }
  }
}

var filterView = new FilterView();
