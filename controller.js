function Controller() {
    this.paperList;
    this.tagList;
    this.authorList;
    this.filters;
    this.visiblePaperList;
    this.visibleTagList;
    this.visibleAuthorList;
    this.currentPaper;
}

Controller.prototype = {
    updateCurrentPaper: function(newPaper) {
        this.currentPaper = newPaper;
        DetailView.update(newPaper);
        //CitationView.update(newPaper);
        PlotView.drawGraph();
    },

    init: function(paperList, tagList, authorList, paperObj) {
        this.paperList = paperList;
        this.tagList = tagList;
        this.authorList = authorList;
        this.paperObj = paperObj;

        this.visiblePaperList = paperList;
        this.visibleTagList = tagList;
        this.visibleAuthorList = authorList;
    },

    notifyFilterChange: function() {
        this.filters = filterView.getFilters();
        this.updateVisibleItemList(this.filters);
        PlotView.refresh();
        if(this.currentPaper !== undefined) PlotView.drawGraph();
    },

    isFiltered: function(paper) { // true: filter out, false: show
        if (!this.filters) {this.filters = filterView.getFilters();}

        var containsKeyword = this.checkKeyword(paper);

        return !containsKeyword ||
            paper.year < this.filters.yearFilter.min || 
            paper.year > this.filters.yearFilter.max || 
            paper.citation_count < this.filters.citFilter.min || 
            paper.citation_count > this.filters.citFilter.max || 
            paper.reference_count < this.filters.refFilter.min || 
            paper.reference_count > this.filters.refFilter.max;
    },

    checkKeyword: function(paper) {
        var contains;

        // check title
        var title = paper.title.toLowerCase();
        var filter = this.filters.keywordFilter.title;
        contains = true;
        filter.every(function(word) {
            if (!title.includes(word.toLowerCase())) {
                contains = false;
                return false;
            } else {
                return true;
            }
        });
        if (!contains) { return false; }

        // check authors
        var authors = paper.authors;
        var filter = this.filters.keywordFilter.author;
        filter.forEach(function(word) {
            contains = false;
            authors.every(function(author) {
                if (author.name.toLowerCase().includes(word.toLowerCase())) {
                    contains = true;
                    return false;
                } else {
                    return true;
                }
            });
            if (!contains) { return false; }
        });
        if (!contains) { return false; }

        // check keywords
        var tags = paper.author_tags;
        var filter = this.filters.keywordFilter.keyword;
        filter.forEach(function(word) {
            contains = false;
            tags.every(function(tag) {
                if (tag.toLowerCase().includes(word.toLowerCase())) {
                    contains = true;
                    return false;
                } else {
                    return true;
                }
            });
            if (!contains) { return false; }
        });
        if (!contains) { return false; }

        return true;
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

    updateVisibleItemList: function(filters) {
        var papers = [];
        var tags = [];
        var authors = [];
        this.paperList.forEach(function(p) {
            if (!controller.isFiltered(p)) {
                // add papers
                papers.push(p);

                // add tags
                p.author_tags.forEach(function(t) {
                    tags.pushIfNotExist(t, function(e) {
                        return e === t;
                    });
                });

                // add authors
                p.authors.forEach(function(a) {
                    authors.pushIfNotExist(a, function(e) {
                        return a.id === e.id;
                    });
                });
            }
        });

        this.visiblePaperList = papers;
        this.visibleTagList = tags;
        this.visibleAuthorList = authors;
    },

    searchKeyword: function(keyword) {
        var results = {};
        var lowerCaseKeyword = keyword.toLowerCase();
        
        // search title
        results["title"] = [];
        this.visiblePaperList.forEach(function(paper) {
            if (paper.title.toLowerCase().includes(lowerCaseKeyword)) {
                results["title"].push(paper.title);
            }
        });

        // search authors
        results["author"] = [];
        this.visibleAuthorList.forEach(function(author) {
            if (author.name.toLowerCase().includes(lowerCaseKeyword)) {
                results["author"].push(author.name);
            }
        });

        // search keywords
        results["keyword"] = [];
        this.visibleTagList.forEach(function(tag) {
            var t = tag;
            if (tag.tag) {
                t = tag.tag;
            }
            if(t.toLowerCase().includes(lowerCaseKeyword)) {
                results["keyword"].push(t);
            }
        });

        return results;
    },

    drawTree: function(node){
        PlotView.drawGraph(node, this.paperObj);
    }

}

var controller = new Controller();
