"use strict";
var SelectedView = (function() {
  var view = d3.select('#selected-view');
  view.style('overflow', 'scroll');
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
      })

      var rows = tbody.selectAll('tr')
          .data(data)
          .enter()
          .append('tr');
      
      var cells = rows.selectAll('td')
          .data(function(row){
              return columns.map(function(column){
                  return {column: column, value: row.data[column]};
              })
          })
          .enter()
          .append('td')
          .text(function(d){
              return d.value;
          });
          
      rows.on('mouseover', function(d){
          d.object.setAttribute('fill', 'red');
      }).on('mouseout', function(d){
          d.object.setAttribute('fill', 'black');
      })
    }
  };
})();
