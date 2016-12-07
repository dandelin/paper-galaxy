//var CitationView = (function() {
    //var paperObj;
    //var view = d3.select("#citation-view");
    //var margin = {top: 10, bottom: 10, left: 10, right: 10};
    //var width = document.getElementById("citation-view").offsetWidth - margin.left - margin.right;
    //var height = document.getElementById("citation-view").offsetHeight - margin.top - margin.bottom;

    //var centerWidth = width * 0.15;
    //var leftWidth = (width - centerWidth)/2;
    //var rightWidth = (width - centerWidth)/2;

    //// leftSvg for citedby
    //var leftSvg = view.append("svg") .attr("x", margin.left)
        //.attr("width", leftWidth)
        //.attr("height", height + margin.top + margin.bottom)
        //.style("overflow-y", "auto");

    //leftSvg.append("text")
        //.attr("font-size", "12px")
        //.attr("dominant-baseline", "central")
        //.attr("text-anchor", "middle")
        //.attr("x", margin.left + leftWidth/2)
        //.attr("y", margin.top)
        //.text("Cited By");

    //var citedbyGroup = leftSvg.append("g")
        //.attr("transform", "translate("+margin.left+","+margin.top+")");

    //// centerSvg for current paper
    //var centerSvg = view.append("svg")
        //.attr("x", leftWidth)
        //.attr("width", centerWidth)
        //.attr("height", height + margin.top + margin.bottom);

    //// rightSvg for references
    //var rightSvg = view.append("svg")
        //.attr("x", leftWidth + centerWidth + margin.left)
        //.attr("width", rightWidth + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        //.style("overflow-y", "auto");

    //rightSvg.append("text")
        //.attr("font-size", "12px")
        //.attr("dominant-baseline", "central")
        //.attr("text-anchor", "middle")
        //.attr("x", rightWidth/2)
        //.attr("y", margin.top)
        //.text("References");

    //var referencesGroup = rightSvg.append("g")
        //.attr("transform", "translate(0,"+margin.top+")");

    //return {
        //init: function(_paperObj) {
            //paperObj = _paperObj;
        //},
        //update: function(newPaper) {
            //var referencesElems = referencesGroup.selectAll("g")
                //.data(newPaper.references.map(function(d) { return paperObj[d]; }), function(d) { return d.id; });

            //var referencesElemsEnter = referencesElems.enter()
                //.append("g")
                //.attr("class", "references")
                //.attr("transform", function(d, i) { return "translate(0,"+(i*(10+5)+15)+")"; });
            
            //referencesElemsEnter
                //.append("text")
                //.attr("dominant-baseline", "central")
                //.attr("x", "3px")
                //.attr("font-size", "8px")
                //.text(function(d) { return d.title; });

            //referencesElems
                //.attr("transform", function(d, i) { return "translate(0,"+(i*(10+5)+15)+")"; });

            //referencesElems.exit()
                //.remove();

            //var citedbyElems = citedbyGroup.selectAll("g")
                //.data(newPaper.cited_by.map(function(d) { return paperObj[d]; }), function(d) { return d.id; });

            //var citedbyElemsEnter = citedbyElems.enter()
                //.append("g")
                //.attr("class", "citedby")
                //.attr("transform", function(d, i) { return "translate(0,"+(i*(10+5)+15)+")"; });
            
            //citedbyElemsEnter
                //.append("text")
                //.attr("dominant-baseline", "central")
                //.attr("x", "3px")
                //.attr("font-size", "8px")
                //.text(function(d) { return d.title; });

            //citedbyElems
                //.attr("transform", function(d, i) { return "translate(0,"+(i*(10+5)+15)+")"; });

            //citedbyElems.exit()
                //.attr("fill-opacity", "0")
                //.remove();
        //},
    //};
//})();
