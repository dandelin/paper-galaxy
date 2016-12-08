function FilterView() {
  this.keywordFilter = {}; // title, author, keyword
  this.yearFilter = {};
  this.citFilter = {};
  this.refFilter = {};
  this.searchBox;
  this.searchPopup;
  this.keywordBox;
  this.searchCategories = ["title", "author", "keyword"];
}

FilterView.prototype = {
  init: function (rangeList) {
    this.searchBox = d3.select("#searchBox").on("input", function() {
      if (this.value.length > 0) {
        filterView.setSearchPopupDisplay("block");
        controller.onKeywordInput(this.value);  
      } else {
        filterView.setSearchPopupDisplay("none");
      }
    });

    this.searchPopup = d3.select(".searchFilter").append('div')
      .attr("class", "popupBox")
    .append('div')
      .attr("class", "search_result")
      .style("display", "none");
    
    this.searchCategories.forEach(function(category) {
      // init keywordFilter
      filterView.keywordFilter[category] = [];
    });
    
    this.keywordBox = d3.select(".searchFilter").append('div')
      .attr("class", "keywordBox");

    this.searchCategories.forEach(function(category) {
      filterView.keywordBox.append('div')
        .attr("class", "keywordGroup group_"+category);
    });

    filterView.addSlider2("Year", rangeList[0], this.yearFilter);
    filterView.addSlider2("Citation Count", rangeList[1], this.citFilter);
    filterView.addSlider2("Reference Count", rangeList[2], this.refFilter);
  },

  updatePopup: function(searchResult) {
    var element = this.searchPopup.html("").append("ul")
      .selectAll("li")
      .data(searchResult)
    .enter().append("li")
      .attr("class", "popupElm")
      .on("click", function() {
        filterView.setSearchPopupDisplay("none");
        filterView.clearSearchBox();
        controller.onKeywordClick(d3.select(this).select("span").text());
      })
      .on("mouseover", function(d, i) {
        var offsetWidth = document.getElementById("filter-view").offsetWidth;
        var detailDiv = d3.select("body").append('div')
          .attr("class", "search_details panel panel-default")
          .style("opacity", "0")
          .style("left", (offsetWidth+10) + "px");
        var detailContent = detailDiv.append("ul")
          .attr("class", "list-group")
          .selectAll("li")
          .data(d.list)
          .enter().append("li")
          .attr("class", "detailElm list-group-item");
        detailContent.append("div")
          .attr("class", "detailContent")
          .text(function(elm) { return elm.title; });
        detailContent.append("div")
          .attr("class", "detailContent")
          .selectAll("span")
          .data(function(elm) { return elm.authors} )
          .enter().append("span")
          .attr("class", "detailContent_label label " + filterView.getLabelType("author"))
          .text(function(author) { return controller.getAuthorNameById(author.id); });
        detailContent.append("div")
          .attr("class", "detailContent")
          .selectAll("span")
          .data(function(elm) { return elm.author_tags} )
          .enter().append("span")
          .attr("class", "detailContent_label label " + filterView.getLabelType("keyword"))
          .text(function(tag) { return tag; });
        
        detailDiv.transition()
          .duration(500)
          .ease("quad")
          .style("opacity", "1");
      })
      .on("mouseout", function() {
        var detailDiv = d3.select("body").selectAll(".search_details");
        detailDiv.transition()
          .duration(100)
          .ease("quad")
          .style("opacity", "0");
        detailDiv.remove();
      });

    element.append("span")
      .attr("class", "catrgory_keyword")
      .text(function(d) { return d.category + ": " + d.keyword});
    element.append("span")
      .attr("class", "badge")
      .text(function(d) { return d.list.length; });
  },

  updateKeywordBox: function() {
    Object.keys(this.keywordFilter).forEach(function(key) {
      var group = filterView.keywordBox.select(".group_" + key);
      var element = group.selectAll("span")
        .data(filterView.keywordFilter[key]);
      element.enter().append("span")
        .attr("class", "keyword label " + filterView.getLabelType(key))
        .text(function(d) {return d;})
        .on("click", function() {
          filterView.removeKeywordFromFilter(key, d3.select(this).text());
          this.remove();
        });
      element.exit().remove();
      if (filterView.keywordFilter[key].length > 0) {
        group.style("display", "block");
      } else {
        group.style("display", "none");
      }
    });
  },

  getLabelType: function(category) {
    var colors = ["label-primary", "label-success", "label-warning"];
    return colors[this.searchCategories.indexOf(category)];
  },

  setSearchPopupDisplay: function(d) {
    this.searchPopup.style("display", d);
  },

  clearSearchBox: function() {
    document.getElementById("searchBox").value = "";
  },

  addSlider2: function(text, range, filter) {
    filter.min = range.min;
    filter.max = range.max;
    var id = "slider_" + text.toLowerCase().split(" ")[0];

    var slider = d3.select("#filter-view").append('div')
      .attr("class", "sliderFilter")
      .text(text)
      .append('div')
      .attr("class", "slider")
      .append('input')
      .attr("type", "text")
      .attr("id", id);
    
    $("#" + id).ionRangeSlider({
      type: "double",
      min: range.min,
      max: range.max,
      from: range.min,
      to: range.max,
      step:1,
      onChange: function (data) {
        // call controller to update filter
        filter.min = data.from;
        filter.max = data.to;
        controller.notifyFilterChange();
      }
    });
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
    this.keywordFilter[category].pushIfNotExist(keyword, function(elm) {
      return elm === keyword;
    });
    controller.notifyFilterChange();
  },

  removeKeywordFromFilter: function(category, keyword) {
    this.keywordFilter[category].removeIfExist(keyword);
    controller.notifyFilterChange();
  },
  
  getFilters: function() {
    return {
      keywordFilter: this.keywordFilter,
      yearFilter: this.yearFilter,
      citFilter: this.citFilter,
      refFilter: this.refFilter
    }
  },

  getSearchCategories: function() {
    return this.searchCategories;
  }
}

var filterView = new FilterView();
