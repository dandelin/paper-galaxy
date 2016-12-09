"use strict";
var SelectedView = (function() {
    var view = d3.select('#selected-view');
    var table = view.append('table');
    var head_row = table.append('thead').append('tr');
    var tbody = table.append('tbody');
    
    head_row.append('th').text('Title');
    head_row.append('th').text('Citation Count');
    
    return {
        updateSelectedPapers: function(selected) {
            var columns = ['title', 'citation_count']
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
                .text(function(d){
                    return d.value;
                });
                
            rows.on('mouseover', function(d){
                d.object.setAttribute('fill', 'red');
                d3.select(this).style('background-color', '#aaaaaa');
            }).on('mouseout', function(d){
                d.object.setAttribute('fill', 'black');
                d3.select(this).style('background-color', null);
            }).on('click', function(d){
                controller.updateCurrentPaper(d.data);
                controller.drawTree(d.object);
            });
        }
    };
})();
