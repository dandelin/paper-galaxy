var StatView = (function() {
    // stopTags: authors tag that will be ignored
    var stopTags = ["human computer interaction (hci)", "human-centered computing", "hci", "human factors", "design", "experimentation"];
    var tabObj = {"cooccur": {"isInit": false, "svg": {}},
                "wordle": {"isInit": false, "svg": {}},
                "ref": {"isInit": false, "svg": {}},
                "year": {"isInit": false, "svg": {}}};
    var currentTabName = "wordle";
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
            if (!selectedPapers || selectedPapers.length == 0) { return; }

            var matrixLength = width > height ? width * 0.75 : height * 0.75;
            var matrixMargin = {top: height * 0.20, bottom: 0, left: width * 0.22, right: 0};
            var x = d3.scale.ordinal().rangeBands([0, matrixLength]);
            var z = d3.scale.linear().range([0, 1]);

            // authorDic will contain author info and index to matrix row
            // matrix will contain co-occurence matrix
            var authorDic = {}, authorList = [], matrix = [], index=0;

            // find every authors and allocate index
            selectedPapers.forEach(function(paper) {
                paper.authors.forEach(function(author) {
                    if(!authorDic[author.id]) {
                        authorDic[author.id] = author;
                        authorDic[author.id].count = 1;
                    } else {
                        authorDic[author.id].count++;
                    }
                });
            });

            Object.keys(authorDic).forEach(function(authorId) {
                authorList.push(authorDic[authorId]);
            });
            authorList.sort(function(a,b) { return b.count - a.count; });
            authorList = authorList.slice(0, 20);
            authorList.forEach(function(author, i) {
                author.index = i;
            });
            var authorIdList = authorList.map(function(author) { return author.id; });

            // allocate cell objects to matrix while leaving occurence frequency (z here) to 0
            authorList.forEach(function(author) {
                matrix[author.index] = {
                    y: author,
                    cells: authorList
                        .map(function(author2) { return {x: author2, z: 0}; })
                };
            });

            // count co-occurence frequency (z value)
            selectedPapers.forEach(function(paper) {
                paper.authors.forEach(function(author, i) {
                    paper.authors.forEach(function(author2, j) {
                        if(!authorIdList.includes(author.id) || !authorIdList.includes(author2.id)) {
                            return;
                        }
                        if (i==j) {
                            matrix[authorIdList.indexOf(author.id)].cells[authorIdList.indexOf(author2.id)].z += 1/paper.authors.length;
                        }
                        if (i<j) {
                            matrix[authorIdList.indexOf(author.id)].cells[authorIdList.indexOf(author2.id)].z += 1/paper.authors.length;
                            matrix[authorIdList.indexOf(author2.id)].cells[authorIdList.indexOf(author.id)].z += 1/paper.authors.length;
                        }
                    });
                });
            });

            x.domain(authorList.map(function(author) { return author.index; }));
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

            var paperIds = controller.paperList.map(function(d) { return d.id; });

            // column text
            row.enter().append("text")
                .attr("transform", function(d) { return "translate(" + (x(d.y.index)+x.rangeBand()/2) + ",0) rotate(-45)"; })
                .attr("dx", "2em")
                .attr("text-anchor", "start")
                .attr("font-size", "3px")
                .style("user-select", "none")
                .text(function(d) { return d.y.name; })
                .on("mouseover", function(d) {
                    controller.mouseOnMultipleCircles(d3.selectAll(".paper")
                        .filter(function(paper) { return paper.authors.map(function(d) { return d.id; }).includes(d.y.id); }));
                })
                .on("mouseout", function(d) {
                    controller.mouseOutMultipleCircles(d3.selectAll(".paper")
                        .filter(function(paper) { return paper.authors.map(function(d) { return d.id; }).includes(d.y.id); }));
                })
                .on("click", function(d) {
                    controller.updateSelectedCircles(d3.selectAll(".paper")
                        .filter(function(paper) { return paper.authors.map(function(d) { return d.id; }).includes(d.y.id); }));
                });
            
            // row text
            row.enter().append("text")
                .attr("transform", function(d) { return "translate(0," + x(d.y.index) + ")"; })
                .attr("y", x.rangeBand() / 2)
                .attr("dx", "-1em")
                .attr("text-anchor", "end")
                .attr("font-size", "3px")
                .style("user-select", "none")
                .text(function(d) { return d.y.name; })
                .on("mouseover", function(d) {
                    controller.mouseOnMultipleCircles(d3.selectAll(".paper")
                        .filter(function(paper) { return paper.authors.map(function(d) { return d.id; }).includes(d.y.id); }));
                })
                .on("mouseout", function(d) {
                    controller.mouseOutMultipleCircles(d3.selectAll(".paper")
                        .filter(function(paper) { return paper.authors.map(function(d) { return d.id; }).includes(d.y.id); }));
                })
                .on("click", function(d) {
                    controller.updateSelectedCircles(d3.selectAll(".paper")
                        .filter(function(paper) { return paper.authors.map(function(d) { return d.id; }).includes(d.y.id); }));
                });

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
                        .attr("fill-opacity", function(d) { return z(d.z); })
                        .attr("fill", "steelblue");
                    
                });

        }

        function initWordle(selectedPapers, wordleSvg) {
            if (!selectedPapers || selectedPapers.length == 0) { return; }

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
            var size = d3.scale.linear().domain([d3.min(tagList, function(d) { return Math.pow(d.papers.length, 2); })-1,d3.max(tagList, function(d) { return Math.pow(d.papers.length, 2); })+2]).range([6, 28]);
            if(tagList[0].tag.length > 18) {
                size.range([6, 19]);
            }
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
                        .on("mouseover", function(word) {
                            var paperIds = controller.paperList.map(function(d) { return d.id; });
                            controller.mouseOnMultipleCircles(d3.selectAll(".paper")
                                .filter(function(paper) { return paper.author_tags.includes(word.tag) && paperIds.includes(paper.id); }));
                        })
                        .on("mouseout", function(word) {
                            var paperIds = controller.paperList.map(function(d) { return d.id; });
                            controller.mouseOutMultipleCircles(d3.selectAll(".paper")
                                .filter(function(paper) { return paper.author_tags.includes(word.tag) && paperIds.includes(paper.id); }));
                        })
                        .on("click", function(word) {
                            var paperIds = controller.paperList.map(function(d) { return d.id; });
                            controller.updateSelectedCircles(d3.selectAll(".paper")
                                .filter(function(paper) { return paper.author_tags.includes(word.tag) && paperIds.includes(paper.id); }));
                            //var paperIds = word.papers.map(function(d) { return d.id; });
                            //controller.updateSelectedCircles(d3.selectAll(".paper")
                                //.filter(function(paper) { return paperIds.includes(paper.id); }));
                        })
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
            if (!selectedPapers || selectedPapers.length == 0) { return; }

            // refedDic will contain referenced papers and the referrers
            var refedDic = {}, refedList = [];
            var paperNumLimit = 7;
            var histMargin = {top: 10, bottom: 40, left: 30, right: 10};
            var histWidth = width * 0.8, histHeight = height * 0.8;

            var x = d3.scale.linear().range([0, histWidth]);
            var y = d3.scale.ordinal().rangeBands([0, histHeight]);
            var fill = d3.scale.category10().domain(d3.range(paperNumLimit));

            // find every authors and allocate index
            selectedPapers.forEach(function(paper) {
                paper.references.forEach(function(refedPaperId) {
                    if(!refedDic[refedPaperId]) {
                        refedDic[refedPaperId] = {paper: controller.paperObj[refedPaperId], referrers: [paper]};
                    } else {
                        refedDic[refedPaperId].referrers.push(paper);
                    }
                });
            });

            Object.keys(refedDic).forEach(function(refedPaperId) {
                refedList.push(refedDic[refedPaperId]);
            });

            refedList.sort(function(a, b) { return b.referrers.length - a.referrers.length; });
            refedList = refedList.slice(0, paperNumLimit);

            x.domain([0, d3.max(refedList.map(function(d) { return d.referrers.length; }))]);
            y.domain(d3.range(refedList.length));

            refSvg.select("g")
                .attr("transform", "translate("+margin.left+","+margin.top+")");

            var barGroup = refSvg.select("g")
                .selectAll(".bar-group")
                .data(refedList, function(d) { return d.paper.id; });

            // update
            barGroup
                .transition()
                .duration(300)
                .attr("transform", function(d, i) { return "translate(0, " + y(i) + ")"; });

            barGroup.selectAll(".bar")
                .data(function(d) { return [d]; })
                .transition()
                .duration(300)
                .style("fill", function(d, i) { return fill(i); })
                .attr("width", function(d) { return x(d.referrers.length); })
                .attr("height", y.rangeBand()/2)
                .attr("y", y.rangeBand()/4);

            barGroup.selectAll(".count") 
                .data(function(d) { return [d]; })
                .text(function(d) { return d.referrers.length; })
                .transition()
                .duration(300)
                .attr("x", function(d) { return x(d.referrers.length); })
                .attr("y", y.rangeBand()/2);

            barGroup.selectAll(".label")
                .data(function(d) { return [d]; })
                .text(function(d) { return d.paper.title; })
                .transition()
                .duration(300)
                .attr("y", y.rangeBand()*3/4);

            // enter
            var enter = barGroup.enter()
                .append("g")
                .attr("class", "bar-group")
                .attr("transform", function(d, i) { return "translate(0, " + y(i) + ")"; })
                .on("mouseover", function(d) {
                    controller.mouseOnSinglePaper(d.paper);
                })
                .on("mouseout", function(d) {
                    controller.mouseOutSinglePaper(d.paper);
                })
                .on("click", function(d) {
                    controller.updateCurrentPaper(d.paper);
                });

            enter.append("rect") 
                .attr("class", "bar")
                .attr("y", y.rangeBand()/4)
                .style("fill", function(d, i) { return fill(i); })
                .attr("height", y.rangeBand()/2)
                .attr("width", "0px")
                .transition()
                .duration(300)
                .attr("width", function(d) { return x(d.referrers.length); });

            enter.append("text") 
                .attr("class", "count")
                .attr("dominant-baseline", "central")
                .attr("text-anchor", "end")
                .attr("dx", "-3px")
                .attr("y", y.rangeBand()/2)
                .style("font-size", "6px")
                .style("fill", "white")
                .text(function(d) { return d.referrers.length; })
                .attr("x", "0px")
                .transition()
                .duration(300)
                .attr("x", function(d) { return x(d.referrers.length); });

            enter.append("text")
                .attr("class", "label")
                .attr("y", y.rangeBand()*3/4)
                .attr("dominant-baseline", "text-before-edge")
                .style("font-size", "11px")
                .text(function(d) { return d.paper.title; })
                .attr("fill-opacity", 0)
                .transition()
                .duration(300)
                .attr("fill-opacity", 1);

            // exit
            var exit = barGroup.exit();

            exit.selectAll(".bar")
                .transition()
                .duration(300)
                .attr("width", "0px");

            exit.selectAll(".count")
                .transition()
                .duration(300)
                .attr("x", "0px")
                .attr("fill-opacity", 0);;

            exit.selectAll(".label")
                .text(function(d) { return d.paper.title; })
                .transition()
                .duration(300)
                .attr("fill-opacity", 0);

            exit.transition()
                .delay(300)
                .remove();
        }

        function initYear(selectedPapers, yearSvg) {
            if (!selectedPapers || selectedPapers.length == 0) { return; }
            var bins = {};
            selectedPapers.forEach(function(p) {
                if (!bins[p.year]) { bins[p.year] = []; }
                bins[p.year].push(p);
            });
            var years = Object.keys(bins);
            years.sort();

            var max = bins[years.reduce(function(a, b){ 
                return bins[a].length > bins[b].length ? a : b 
            })].length;

            var axisSize = {x: 10, y: 15};
            var svgWidth = width - axisSize.y;
            var svgHeight = height - axisSize.x;

            var x = d3.scale.ordinal().domain(years).rangeBands([0, svgWidth]),
                y = d3.scale.linear().domain([max, 0]).range([0, svgHeight]).nice();
            var xAxis = d3.svg.axis().scale(x).orient("bottom"),
                yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format("d"));
            
            var gridMargin = 10;
            var gridSize = Math.ceil((svgWidth - gridMargin) / years.length) - gridMargin;
            var g = yearSvg.select("g")
                .attr("transform", "translate("+ (margin.left + axisSize.y) +","+margin.top+")");
            var bars = g.selectAll(".bar").data(years);

            bars.enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d, i) { return gridMargin + i * (gridSize + gridMargin); })
                .attr("width", gridSize)
                .attr("y", function(d) {
                    return svgHeight * (1- bins[d].length / max);
                })
                .attr("height", function(d) {
                    return svgHeight * (bins[d].length / max);
                })
                .attr("rx", 1)
                .attr("ry", 1);

            bars.transition()
                .attr("x", function(d, i) { return gridMargin + i * (gridSize + gridMargin); })
                .attr("width", gridSize)
                .attr("y", function(d) {
                    return svgHeight * (1- bins[d].length / max);
                })
                .attr("height", function(d) {
                    return svgHeight * (bins[d].length / max);
                });

            bars.exit().remove();

            if (g.selectAll(".axis")[0].length == 0) {
                g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + svgHeight + ")")
                .call(xAxis);

                g.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis);
            } else {
                g.selectAll(".axis--x").transition().call(xAxis);
                g.selectAll(".axis--y").transition().call(yAxis);
            }
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
