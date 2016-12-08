function Controller() {
    this.paperList;
    this.tagList;
    this.authorList;
    this.authorHash;
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

    init: function(paperList, tagList, authorList, authorHash, paperObj) {
        this.paperList = paperList;
        this.tagList = tagList;
        this.authorList = authorList;
        this.authorHash = authorHash;
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

    isFiltered: function(paper) {
        return !this.visiblePaperList.includes(paper);
    },

    isFiltered_internal: function(paper) { // true: filter out, false: show
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
        // check title
        if (!this.checkTitles(paper, this.filters.keywordFilter.title)) { return false; }

        // check authors
        if (!this.checkAuthors(paper, this.filters.keywordFilter.author)) { return false; }

        // check keywords
        if (!this.checkTags(paper, this.filters.keywordFilter.keyword)) { return false; }

        return true;
    },

    checkTitles: function(paper, list) {
        var title = paper.title.toLowerCase();
        //var filter = this.filters.keywordFilter.title;
        var contains = true;
        list.every(function(word) {
            if (!title.includes(word.toLowerCase())) {
                contains = false;
                return false; // break
            } else {
                return true; // continue
            }
        });

        return contains;
    },

    checkAuthors: function(paper, list) {
        var authors = paper.authors;
        for (var i=0; i < list.length; i++) {
            var word = list[i];
            var contains = false;
            for (var j=0; j < authors.length; j++) {
                var author = authors[j];
                if (controller.getAuthorNameById(author.id).toLowerCase().includes(word.toLowerCase())) {
                    contains = true;
                    break;
                }
            }
            if (!contains) { return false; }
        }
        return true;
    },

    checkTags: function(paper, list) {
        var tags = paper.author_tags;
        for (var i=0; i < list.length; i++) {
            var word = list[i];
            var contains = false;
            for (var j=0; j < tags.length; j++) {
                var tag = tags[j];
                if (tag.toLowerCase().includes(word.toLowerCase())) {
                    contains = true;
                    break;
                }
            }
            if (!contains) { return false; }
        }
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
            if (!controller.isFiltered_internal(p)) {
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
        
        results["title"] = [];
        results["author"] = [];
        results["keyword"] = [];
        this.visiblePaperList.forEach(function(paper) {
            
            // search title
            if (paper.title.toLowerCase().includes(lowerCaseKeyword)) {
                results["title"].push(paper);
            }

            // search authors
            if (controller.checkAuthors(paper, [keyword])) {
                results["author"].push(paper);
            }

            // search tags
            if (controller.checkTags(paper, [keyword])) {
                results["keyword"].push(paper);
            }
        });

        return results;
    },

    drawTree: function(node){
        PlotView.drawGraph(node, this.paperObj);
    },

    getAuthorNameById: function(id) {
        return this.authorHash[id];
    }

}

var controller = new Controller();
