function FilterView() {
  this.yearFilter = {};
  this.citFilter = {};
  this.refFilter = {};
  this.searchBox;
  this.searchPopup;
  this.searchCategories = ["title", "author_name", "keyword"];
}

FilterView.prototype = {
  init: function (rangeList) {
    this.searchBox = d3.select("#searchBox").on("input", function() {
      if (this.value.length > 0) {
        filterView.searchPopup.style("visibility", "visible");
        controller.updateKeyword(this.value);  
      } else {
        filterView.searchPopup.style("visibility", "hidden");
      }
      
    });

    this.searchPopup = d3.select(".searchFilter").append('ul')
      .style("visibility", "hidden");
    
    this.searchCategories.forEach(function(category) {
      filterView.searchPopup.append('li').text(category).on("click", function() {
        controller.onKeywordClick($(this).text());
      });
    });

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
