function draw_letters(data){
    let content = '<table class="pure-table">' +
        '<thead><tr><th>标题</th><th>通信人</th><th>类别</th><th>来源</th></tr></thead>';
    
    for(i=0;i<data.length;i++){
        content += '<tr><td>' + data[i].title + '</td>'
        + '<td>' + data[i].penpal_name + '</td>'
        + '<td>' + data[i].type + '</td>'
        + '<td>' + data[i].collection + '</td></tr>';
    }
    content += '</table>';
    let tooltip = d3.select('#letter_box');
    tooltip.html(content);
    
}