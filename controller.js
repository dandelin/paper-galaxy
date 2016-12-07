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
        PlotView.drawGraph();
    },

    init: function(paperList, tagList, authorList, paperObj) {
        this.paperList = paperList;
        this.tagList = tagList;
        this.authorList = authorList;
        this.paperObj = paperObj;
    },

    notifyFilterChange: function() {
        this.filters = filterView.getFilters();
        PlotView.refresh();
        if(this.currentPaper !== undefined) PlotView.drawGraph();
    },

    isFiltered: function(paper) { // true: filter out, false: show
        if (!this.filters) {this.filters = filterView.getFilters();}

        var containsKeyword = this.checkKeyword(this.filters.keywordFilter);

        return !containsKeyword ||
            paper.year < this.filters.yearFilter.min || 
            paper.year > this.filters.yearFilter.max || 
            paper.citation_count < this.filters.citFilter.min || 
            paper.citation_count > this.filters.citFilter.max || 
            paper.reference_count < this.filters.refFilter.min || 
            paper.reference_count > this.filters.refFilter.max;
    },

    checkKeyword: function(keywordFilter) {
        var contains = false;

        filterView.searchCategories.forEach(function(category) {
            var 
        })

        // check title
        this.paperList.forEach(function(paper) {
            var title = paper.title.toLowerCase();
            // var filter = keywordFilter.

            if (paper.title.toLowerCase().includes(lowerCaseKeyword)) {
                results["title"].push(paper.title);
            }
        });

        // check authors
        results["author"] = [];
        this.authorList.forEach(function(author) {
            if (author.name.toLowerCase().includes(lowerCaseKeyword)) {
                results["author"].push(author.name);
            }
        });

        // check keywords
        results["keyword"] = [];
        this.tagList.forEach(function(tag) {
            if(tag.tag.toLowerCase().includes(lowerCaseKeyword)) {
                results["keyword"].push(tag.tag);
            }
        });

        return false;
        
    },

    onKeywordClick: function(text) {
        var category = text.split(":")[0].trim();
        var keyword = text.split(":")[1].trim();

        filterView.addKeywordToFilter(category, keyword);
        filterView.updateKeywordBox();
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
    },

    drawTree: function(node){
        PlotView.drawGraph(node, this.paperObj);
    }

}

var controller = new Controller();
