function draw_letters(data){
    let content = '<table class="pure-table">' +
        '<thead><tr><th width="120px" class="letter_title">标题</th><th width="50px">通信人</th><th width="40px">类别</th><th width="130px">来源</th></tr></thead>';
    
    for(i=0;i<data.length;i++){
        content += '<tr><td>' + data[i].title + '</td>'
        + '<td>' + data[i].penpal_name + '</td>'
        + '<td text-align="center">' + data[i].type + '</td>'
        + '<td>' + data[i].collection + '</td></tr>';
    }
    content += '</table>';
    let letter_box = d3.select('#letter_box');
    letter_box.html(content);
    
}