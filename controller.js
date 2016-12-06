function Controller() {
    this.paperList;
    this.tagList;
    this.authorList;
    this.filters;
    this.currentPaper;
}

Controller.prototype = {
    updateCurrentPaper: function(newPaper) {
      this.currentPaper = newPaper;
      DetailView.update(newPaper);
      CitationView.update(newPaper);
    },

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
        filterView.getSearchCategories().forEach(function(category) {
            var lists = controller.searchKeyword(keyword);
            array.push({
                "category": category,
                "keyword": keyword,
                "list": lists[category]
            });
        });
        filterView.updatePopup(array);
    },

    searchKeyword: function(keyword) {
        var results = {};
        var lowerCaseKeyword = keyword.toLowerCase();
        
        // search title
        results["title"] = [];
        this.paperList.forEach(function(paper) {
            if (paper.title.toLowerCase().includes(lowerCaseKeyword)) {
                results["title"].push(paper.title);
            }
        });

        // search authors
        results["author"] = [];
        this.authorList.forEach(function(author) {
            if (author.name.toLowerCase().includes(lowerCaseKeyword)) {
                results["author"].push(author.name);
            }
        });

        // search keywords
        results["keyword"] = [];
        this.tagList.forEach(function(tag) {
            if(tag.tag.toLowerCase().includes(lowerCaseKeyword)) {
                results["keyword"].push(tag.tag);
            }
        });

        return results;
    }

}

var controller = new Controller();
