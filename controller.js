function Controller() {
    this.filters;
}

Controller.prototype = {
    updateFilter: function() {
        this.filters = filterView.getFilters();
        PlotView.refresh();
    },

    isFiltered: function(paper) { // true: filter out, false: show
        // console.log(paper.year);
        // console.log(paper.citation_count);
        // console.log(paper.reference_count);

        // console.log(paper.year < this.filters.yearFilter.min);
        // console.log(paper.year > this.filters.yearFilter.max);
        // console.log(paper.citation_count < this.filters.citFilter.min);
        // console.log(paper.citation_count > this.filters.citFilter.max);
        // console.log(paper.reference_count < this.filters.refFilter.min);
        // console.log(paper.reference_count > this.filters.refFilter.max);
        

        
        return paper.year < this.filters.yearFilter.min || 
            paper.year > this.filters.yearFilter.max || 
            paper.citation_count < this.filters.citFilter.min || 
            paper.citation_count > this.filters.citFilter.max || 
            paper.reference_count < this.filters.refFilter.min || 
            paper.reference_count > this.filters.refFilter.max;
    }
}

var controller = new Controller();