function Controller() {
    this.paperList;
    this.tagList;
    this.authorList;
    this.filters;
}

Controller.prototype = {
    init: function(paperList, tagList, authorList) {
        this.paperList = paperList;
        this.tagList = tagList;
        this.authorList = authorList;
    },

    notifyFilterChange: function() {
        this.filters = filterView.getFilters();
        PlotView.refresh();
    },

    isFiltered: function(paper) { // true: filter out, false: show
        if (!this.filters) {this.filters = filterView.getFilters();}

        return paper.year < this.filters.yearFilter.min || 
            paper.year > this.filters.yearFilter.max || 
            paper.citation_count < this.filters.citFilter.min || 
            paper.citation_count > this.filters.citFilter.max || 
            paper.reference_count < this.filters.refFilter.min || 
            paper.reference_count > this.filters.refFilter.max;
    },

    onKeywordClick: function(text) {
        console.log(text);
    },

    onKeywordInput: function(keyword) {
        var array = [];
        filterView.searchCategories.forEach(function(category) {
            var count = 23
            array.push({
                "category": category,
                "keyword": keyword,
                "count": count
            });
        });
        filterView.updatePopup(array);
    },

    searchKeyword: function(keyword) {

    }

}

var controller = new Controller();