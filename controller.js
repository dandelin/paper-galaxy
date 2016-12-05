function Controller() {
    this.filters;
}

Controller.prototype = {
    updateFilter: function() {
        this.filters = filterView.getFilters();
        PlotView.refresh();
    },

    isFiltered: function(paper) { // true: filter out, false: show
        return paper.year < this.filters.yearFilter.min || 
            paper.year > this.filters.yearFilter.max || 
            paper.citation_count < this.filters.citFilter.min || 
            paper.citation_count > this.filters.citFilter.max || 
            paper.reference_count < this.filters.refFilter.min || 
            paper.reference_count > this.filters.refFilter.max;
    }
}

var controller = new Controller();