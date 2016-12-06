function FilterView() {
  this.keywordFilter = {}; // title, author, keyword
  this.yearFilter = {};
  this.citFilter = {};
  this.refFilter = {};
  this.searchBox;
  this.searchPopup;
  this.searchCategories = ["title", "author", "keyword"];
}

FilterView.prototype = {
  init: function (rangeList) {
    this.searchBox = d3.select("#searchBox").on("input", function() {
      if (this.value.length > 0) {
        filterView.searchPopup.style("display", "block");
        controller.onKeywordInput(this.value);  
      } else {
        filterView.searchPopup.style("display", "none");
      }
      
    });

    this.searchPopup = d3.select(".searchFilter").append('div')
      .attr("class", "popupBox")
      .style("display", "none");
    // this.searchPopup.append('ul')
      
    
    this.searchCategories.forEach(function(category) {
      // // init search popup
      // filterView.searchPopup.select(".popupList").append('li')
      //   .attr("class", "popupElm")
      //   .text(category).on("click", function() {
      //   controller.onKeywordClick(d3.select(this).text());
      // });
      // init keywordFilter
      filterView.keywordFilter[category] = [];
    });

    filterView.addSlider("Year", rangeList[0], this.yearFilter);
    filterView.addSlider("Citation Count", rangeList[1], this.citFilter);
    filterView.addSlider("Reference Count", rangeList[2], this.refFilter);
  },

  updatePopup: function(array) {
    var element = this.searchPopup.html("").append("ul")
      .selectAll("li")
      .data(array)
    .enter().append("li")
      .attr("class", "popupElm")
      .on("click", function() {
        controller.onKeywordClick(d3.select(this).text());
      });

    element.append("span")
      .attr("class", "catrgory_keyword")
      .text(function(d) { return d.category + ": " + d.keyword});
    element.append("span")
      .attr("class", "badge")
      .text(function(d) { return d.count; });
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
        controller.notifyFilterChange();
      }));
  },

  addKeywordToFilter: function(category, keyword) {
    this.keywordFilter[category].pushIfNotExist(keyword);
  },

  removeKeywordFromFilter: function(category, keyword) {
    this.keywordFilter[category].removeIfExist(keyword);
  },
  
  getFilters: function() {
    return {
      keywordFilter: this.keywordFilter,
      yearFilter: this.yearFilter,
      citFilter: this.citFilter,
      refFilter: this.refFilter
    }
  }
}

var filterView = new FilterView();
