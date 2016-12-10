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
            var matrixLength = width > height ? width * 0.80 : height * 0.80;
            var matrixMargin = {top: height * 0.12, bottom: 0, left: width * 0.18, right: 0};
            var x = d3.scale.ordinal().rangeBands([0, matrixLength]);
            var z = d3.scale.linear().range([0, 1]);

            // authorDic will contain author info and index to matrix row
            // matrix will contain co-occurence matrix
            var authorDic = {}, matrix = [], index=0;

            // find every authors and allocate index
            selectedPapers.forEach(function(paper) {
                paper.authors.forEach(function(author) {
                    if(!authorDic[author.id]) {
                        authorDic[author.id] = author;
                        authorDic[author.id].index = index++;
                    }
                });
            });

            // allocate cell objects to matrix while leaving occurence frequency (z here) to 0
            Object.keys(authorDic).forEach(function(authorId) {
                matrix[authorDic[authorId].index] = {
                    y: authorDic[authorId],
                    cells: Object.keys(authorDic)
                        .map(function(authorId2) { return {x: authorDic[authorId2], z: 0}; })
                        .sort(function(a, b) { return a.x.index - b.x.index; })
                };
            });

            // count co-occurence frequency (z value)
            selectedPapers.forEach(function(paper) {
                paper.authors.forEach(function(author, i) {
                    paper.authors.forEach(function(author2, j) {
                        if (i==j) {
                            matrix[authorDic[author.id].index].cells[authorDic[author2.id].index].z += 1/paper.authors.length;
                        }
                        if (i<j) {
                            matrix[authorDic[author.id].index].cells[authorDic[author2.id].index].z += 1/paper.authors.length;
                            matrix[authorDic[author2.id].index].cells[authorDic[author.id].index].z += 1/paper.authors.length;
                        }
                    });
                });
            });

            x.domain(Object.keys(authorDic).map(function(authorId) { return authorDic[authorId].index; }));
            z.domain([0, d3.max([].concat.apply([], matrix.map(function(row) { return row.cells; })).map(function(cell) { return cell.z; }))]);

            var container = cooccurSvg.select("g")
              .html("")
              .attr("transform", function(d) { return "translate("+matrixMargin.left+","+matrixMargin.top+")" })

            container
                .append("rect")
                .attr("class", "background")
                .attr("width", matrixLength)
                .attr("height", matrixLength)
                .style("fill", "#ddd");

            var row = container
                .selectAll(".row")
                .data(matrix);

            // column text
            row.enter().append("text")
                .attr("transform", function(d) { return "translate(" + x(d.y.index) + ",0) rotate(-45)"; })
                .attr("x", 9)
                .attr("y", x.rangeBand() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "start")
                .attr("font-size", "3px")
                .text(function(d) { return d.y.name; });
            
            // row text
            row.enter().append("text")
                .attr("transform", function(d) { return "translate(0," + x(d.y.index) + ")"; })
                .attr("x", -2)
                .attr("y", x.rangeBand() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "end")
                .attr("font-size", "3px")
                .text(function(d) { return d.y.name; });

            row.enter().append("g")
                .attr("class", "row")
                .attr("transform", function(d) { return "translate(0," + x(d.y.index) + ")"; })
                .each(function(row) {
                    var cell = d3.select(this).selectAll(".cell")
                        .data(row.cells)
                    .enter().append("rect")
                        .attr("class", "cell")
                        .attr("x", function(d) { return x(d.x.index); })
                        .attr("width", x.rangeBand())
                        .attr("height", x.rangeBand())
                        .attr("fill-opacity", function(d) { console.log(d.z, z(d.z)); return z(d.z); })
                        .attr("fill", "steelblue");
                    
                });

        }

        function initWordle(selectedPapers, wordleSvg) {
            // calculate tag frequency list
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
                    fill.domain(d3.range(data.length));
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
