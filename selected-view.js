"use strict";
var SelectedView = (function() {
    var view = d3.select('#selected-view');
    var table = view.append('table');
    var head_row = table.append('thead').append('tr').attr("class", "selected-header");
    var tbody = table.append('tbody');
    
    head_row.append('th').text('Title').attr("class", "selected-title");
    head_row.append('th').text('Citation Count').attr("class", "selected-citation-count");
    
    return {
        updateSelectedPapers: function(selected) {
            var columns = ['title', 'citation-count']
            var data = selected[0].map(function(d){
                return {
                    data: d.__data__,
                    object: d
                };
            });
            
            data.sort(function(a, b){
                return parseInt(b.data.citation_count) - parseInt(a.data.citation_count);
            });
            
            var rows = tbody.selectAll('tr')
                .data(data, function(d){
                    return d.data.id;
                });

            rows
                .enter()
                .append('tr');

            rows
                .exit()
                .remove();
                
            var cells = rows.selectAll('td')
                .data(function(row){
                    return columns.map(function(column){
                        return {column: column, value: row.data[column]};
                    });
                })
                .enter()
                .append('td')
                .attr('class', function(d) { return "selected-"+d.column; })
                .text(function(d){
                    return d.value;
                });
                
            rows.on('mouseover', function(d){
                d.object.setAttribute('fill', 'red');
            }).on('mouseout', function(d){
                d.object.setAttribute('fill', 'black');
            }).on('click', function(d){
                controller.updateCurrentPaper(d.data);
                controller.drawTree(d.object);
            });
        }
    };
})();
