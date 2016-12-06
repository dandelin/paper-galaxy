function Controller() {
    this.filters;
    this.currentPaper;
}

Controller.prototype = {
    updateCurrentPaper: function(newPaper) {
      this.currentPaper = newPaper;
      DetailView.update(newPaper);
    },

    updateFilter: function() {
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
            array.push(category + ":" + keyword + " (" + count + ")");
        });
        console.log(array);
        filterView.updatePopup(array);
    }
}

var controller = new Controller();
