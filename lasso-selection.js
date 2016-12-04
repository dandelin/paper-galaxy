var makeLasso = function(scope) {

    var lasso_start = function() {
        lasso.items()
            .style('opacity', 0.15);
    };

    var lasso_draw = function() {
        lasso.items().filter(function(d) {return d.possible===true})
            .style('opacity', 1);

        lasso.items().filter(function(d) {return d.possible===false})
            .style('opacity', 0.15);
    };

    var lasso_end = function() {
        lasso.items()
            .style("opacity", 1);

        var selected = lasso.items().filter(function(d) {return d.selected===true});
        selection_done(selected);
    };

    // 라소 브러쉬를 위한 영역
    var lasso_area = scope.svg.append("rect")
        .attr("width", scope.width)
        .attr("height", scope.height)
        .style("opacity", 0);
    
    // 라소의 정의
    var lasso = scope.d3.lasso()
        .area(lasso_area) // 영역의 정의
        .items(scope.d3.selectAll(".paper"))
        .on('start', lasso_start)
        .on('draw', lasso_draw)
        .on('end', lasso_end);

    return lasso;
}