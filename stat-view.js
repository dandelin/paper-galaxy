var StatView = (function() {
    // stopTags: authors tag that will be ignored
    var stopTags = ["human computer interaction (hci)", "human-centered computing", "hci", "human factors", "design", "experimentation"];
    var tabObj = {"cooccur": {"isInit": false, "svg": {}},
                "wordle": {"isInit": false, "svg": {}},
                "ref": {"isInit": false, "svg": {}},
                "year": {"isInit": false, "svg": {}}};
    var currentTabName = "cooccur";
    var selectedPapers = [];

    var view = d3.select("#stat-view-body");
    var margin = {top: 10, bottom: 10, left: 10, right: 10};
    var width = document.getElementById("stat-view-body").offsetWidth - margin.left - margin.right;
    var height = document.getElementById("stat-view-body").offsetHeight - margin.top - margin.bottom;

    function svgAppender(svgId) {
        var svg =  view.append("svg")
            .attr("id", svgId)
            .attr("width", 0)
            .attr("height", 0);

        svg.append("g")
            .attr("transform", "translate("+margin.left+","+margin.top+")");

        return svg;
    }

    function selectTab(tabName) {
        // adjusts tabs' svg width and height
        // (to expose the selected one only)
        tabObj[currentTabName].svg.attr("width", 0);
        tabObj[currentTabName].svg.attr("height", 0);
        tabObj[tabName].svg.attr("width", width + margin.left + margin.right);
        tabObj[tabName].svg.attr("height", height + margin.top + margin.bottom);

        // init svg contents if it is not inited
        if(!tabObj[tabName].isInit) {
            if (tabName === "cooccur") {
                initCooccur(selectedPapers, tabObj["cooccur"].svg);
            } else if (tabName === "wordle") {
                initWordle(selectedPapers, tabObj["wordle"].svg);
            } else if (tabName === "ref") {
                initRef(selectedPapers, tabObj["ref"].svg);
            } else if (tabName === "year") {
                initYear(selectedPapers, tabObj["year"].svg);
            } else {
                console.log("unknown tabName: " + tabName);
            }
            tabObj[tabName].isInit = true;
        }
        currentTabName = tabName;

        function initCooccur(selectedPapers, cooccurSvg) {
            console.log("initCooccur");
        }

        function initWordle(selectedPapers, wordleSvg) {
            // calculate tag frequency list using wordles
            var tagObj = {}, tagList = [];
            selectedPapers.forEach(function(d) {
                d.author_tags.forEach(function(tag) {
                    if(stopTags.includes(tag)) {
                        return;
                    }
                    else if (!tagObj[tag]) {
                        tagObj[tag] = {tag: tag, papers: [d]};
                    } else {
                        tagObj[tag]["papers"].push(d);
                    }
                });
            });
            Object.keys(tagObj).forEach(function(key) {
                tagList.push(tagObj[key]);
            });
            tagList.sort(function(a, b) { return b.papers.length - a.papers.length; });
            tagList = tagList.slice(0, 30);

            // create wordle layout
            var fill = d3.scale.category10();
            var size = d3.scale.linear().domain([d3.min(tagList, function(d) { return Math.pow(d.papers.length, 2); })-1,d3.max(tagList, function(d) { return Math.pow(d.papers.length, 2); })+2]).range([6, 36]);
            var layout = d3.layout.cloud()
                .size([width, height])
                .words(tagList)
                .padding(3)
                .rotate(function(d) { return 0; })
                .text(function(d) { return d.tag; })
                .font("Sans-serif")
                .fontWeight("bold")
                .fontSize(function(d) { return size(Math.pow(d.papers.length, 2)); })
                .on("end", function(data) {
                    fill.domain(Array.apply(null, {length: data.length}).map(Number.call, Number));
                    var text = wordleSvg.select("g").attr("transform", "translate(" + [width/2, height/2] + ")")
                        .selectAll("text")
                        .data(data, function(d) { return d.tag; });

                    text
                        .transition("wordle-update")
                        .duration(300)
                        .style("font-size", function(d) { return d.size+"px"; })
                        .attr("fill", function(d, i) { return fill(i); })
                        .attr("transform", function(d) { return "translate("+[d.x, d.y]+")"; });

                    text.enter()
                    .append("text")
                        .attr("fill", function(d, i) { return fill(i); })
                        .attr("transform", function(d) { return "translate("+[d.x, d.y]+")"; })
                        .transition("wordle-enter")
                        .duration(300)
                        .style("font-size", function(d) { return d.size+"px"; })
                        .style("font-weight", "bold")
                        .style("font-family", "Sans-serif")
                        .style("user-select", "none")
                        .attr("text-anchor", "middle")
                        .text(function(d) { return d.tag; });

                    text.exit()
                        .transition("wordle-exit")
                        .duration(300)
                        .style("font-size", "0px")
                        .style("fill-opacity", 1e-6)
                        .remove();
                })
                .start();
        }

        function initRef(selectedPapers, refSvg) {
            console.log("initRef");
        }

        function initYear(selectedPapers, yearSvg) {
            console.log("initYear");
        }
    }

    return {
        init: function() {
            // append svg for each tabs
            Object.keys(tabObj).forEach(function(tabName) {
                tabObj[tabName].svg = svgAppender(tabName+"-svg");
            });

            // select default tab
            $("#tab-"+currentTabName).tab("show");
            selectTab(currentTabName);

            // initalize tab click handler
            // cooccur, wordle, ref, and year
            $("#stat-view-tabs #tab-cooccur").click(function(e) {
                e.preventDefault();
                $(this).tab("show");
                selectTab("cooccur");
            });
            $("#stat-view-tabs #tab-wordle").click(function(e) {
                e.preventDefault();
                $(this).tab("show");
                selectTab("wordle");
            });
            $("#stat-view-tabs #tab-ref").click(function(e) {
                e.preventDefault();
                $(this).tab("show");
                selectTab("ref");
            });
            $("#stat-view-tabs #tab-year").click(function(e) {
                e.preventDefault();
                $(this).tab("show");
                selectTab("year");
            });
        },
        update: function(newPapers) {
            // reset init status
            Object.keys(tabObj).forEach(function(tabName) {
                tabObj[tabName].isInit = false;
            });
            selectedPapers = newPapers;
            selectTab(currentTabName);
        }
    };
})();
