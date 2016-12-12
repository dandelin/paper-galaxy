var defaultColor = "#dddddd";
var lassoColor = "#fff080";
var selectedColor = "#f19f4d";
var hoverColor = "#ec576b";

function Controller() {
    this.paperList;
    this.tagList;
    this.authorHash;
    this.filters;
    this.visiblePaperList;
    // this.visibleTagList;
    // this.visibleAuthorList;
    this.currentPaper;
    this.selectedCircles;
    this.hoveredCircle;
    this.hoveredData;
}

Controller.prototype = {
    updateSelectedCircles: function(selectedCircles) {
        var fillWithStatusSelectedChange = this.fillWithStatusSelectedChange;
        var c = this;
        if(this.selectedCircles){
            this.selectedCircles[0].forEach(function(circle){
                fillWithStatusSelectedChange.call(c, d3.select(circle));
            })
        }
        this.selectedCircles = selectedCircles;
        this.selectedCircles.style('fill', highlightApplier);
        SelectedView.updateSelectedPapers(selectedCircles);
        StatView.update(selectedCircles[0].map(function(d) { return d.__data__; }));
    },

    updateCurrentPaper: function(newPaper) {
        if (this.currentPaper === newPaper) { return; }
        d3.select('#p' + newPaper.id).style('fill', selectedColor);
        if(this.currentPaper){
            d3.select('#p' + this.currentPaper.id).style('fill', defaultColor);
            if(this.selectedCircles){
                var currentPaper = this.currentPaper;
                if(this.selectedCircles[0].some(function(sc){ return sc.__data__.id === currentPaper.id; })){
                    d3.select('#p' + this.currentPaper.id).style('fill', lassoColor);
                }
            }
        };
        this.currentPaper = newPaper;
        DetailView.update(newPaper);
        PlotView.drawGraph();
    },

    getStatus: function(circle){
        var lassoed = false;
        var selected = false;
        if(this.selectedCircles){
            if(this.selectedCircles[0].some(function(sc){ return sc.__data__.id === circle.__data__.id; })) lassoed = true;
        }
        if(this.currentPaper){
            if(this.currentPaper.id == circle.__data__.id) selected = true;
        }
        return {
            'lassoed': lassoed,
            'selected': selected
        };
    },

    fillWithStatus: function(circle){
        var status = this.getStatus(circle.node());
        if(status.selected == true) circle.style('fill', selectedColor);
        else if(status.lassoed == true) circle.style('fill', lassoColor);
        else circle.style('fill', defaultColor);
    },

    fillWithStatusSelectedChange: function(circle){
        var status = this.getStatus(circle.node());
        if(status.selected == true) circle.style('fill', selectedColor);
        else circle.style('fill', defaultColor);
    },

    mouseOnSinglePaper: function(paperData){
        this.hoveredData = paperData;
        this.hoveredCircle = d3.select('#p' + paperData.id);
        this.hoveredCircle.style('fill', hoverColor);

        if(this.currentPaper){
            var currentCircle = d3.select('#p' + this.currentPaper.id);
            this.fillWithStatus(currentCircle);
        };
        DetailView.update(paperData);
        PlotView.drawGraph();
    },

    mouseOutSinglePaper: function(){
        this.fillWithStatus(this.hoveredCircle);
        this.hoveredData = undefined;
        this.hoveredCircle = undefined;
        if(this.currentPaper) d3.select('#p' + this.currentPaper.id).style('fill', selectedColor);
        if(this.currentPaper) DetailView.update(this.currentPaper);
        if(this.currentPaper) PlotView.drawGraph();
        else PlotView.removeGraph();
    },

    mouseOnMultipleCircles: function(hoveredCircles) {
        //this.hoveredPapers = hoveredPapers;
        hoveredCircles.style('fill', hoverColor);
    },

    mouseOutMultipleCircles: function(hoveredCircles) {
        hoveredCircles.style('fill', defaultColor);
        if(this.currentPaper) d3.select('#p' + this.currentPaper.id).style('fill', selectedColor);
        if(this.selectedCircles) this.selectedCircles.style('fill', lassoColor);
    },

    selectCircle: function(data){
        return d3.select('#p' + data.id).node();
    },

    circlesOfAuthor: function(name){
        var papers = this.paperList.filter(function(paper){
            return paper.authors.some(function(author) { return author.name == name; });
        });
        var selectCircle = this.selectCircle;
        var circles = d3.select('.empty');
        papers.forEach(function(paper){
            circles[0].push(selectCircle(paper));
        });
        circles[0].splice(0, 1);
        return circles;
    },

    mouseOnAuthor: function(name){
        var circles = this.circlesOfAuthor(name);
        circles.style('fill', hoverColor);
    },

    mouseOutAuthor: function(name){
        var circles = this.circlesOfAuthor(name);
        var fillWithStatus = this.fillWithStatus;
        var c = this;
        circles[0].forEach(function(circle){
            fillWithStatus.call(c, d3.select(circle));
        })
    },

    clickAuthor: function(name){
        var circles = this.circlesOfAuthor(name);
        this.updateSelectedCircles(circles);
    },

    init: function(paperList, tagList, authorHash, paperObj) {
        this.paperList = paperList;
        this.tagList = tagList;
        this.authorHash = authorHash;
        this.paperObj = paperObj;

        this.visiblePaperList = paperList;
        // this.visibleTagList = tagList;
        // this.visibleAuthorList = authorList;
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

                // // add tags
                // p.author_tags.forEach(function(t) {
                //     tags.pushIfNotExist(t, function(e) {
                //         return e === t;
                //     });
                // });

                // // add authors
                // p.authors.forEach(function(a) {
                //     authors.pushIfNotExist(a, function(e) {
                //         return a.id === e.id;
                //     });
                // });
            }
        });

        this.visiblePaperList = papers;
        // this.visibleTagList = tags;
        // this.visibleAuthorList = authors;
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
