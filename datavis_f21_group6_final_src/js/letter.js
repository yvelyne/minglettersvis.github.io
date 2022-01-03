function draw_letters(data){
    let content = '<table><tr><td>标题</td><td>通信人</td><td>类别</td><td>来源</td></tr>';
    
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