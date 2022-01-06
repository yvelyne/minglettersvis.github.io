function draw_letters(data) {
    let content = '<table class="pure-table">' +
        '<thead><tr><th width="120px" class="letter_title">标题</th><th width="50px">通信人</th><th width="40px">类别</th><th width="130px">来源</th></tr></thead>';

    let person_id;
    for (i = 0; i < data.length; i++) {
        person_id = data[i].penpal_id ? data[i].penpal_id : -1;  // 通信人id。若没有id则设为-1
        content += '<tr class=letter' + person_id + '>'
            + '<td>' + data[i].title + '</td>'
            + '<td>' + data[i].penpal_name + '</td>'
            + '<td text-align="center">' + data[i].type + '</td>'
            + '<td>' + data[i].collection + '</td></tr>';
    }
    content += '</table>';
    let letter_box = d3.select('#letter_box');
    letter_box.html(content);

}

//滚动定位
function scollerLocation(person_id) {
    // 样式复原
    $('#letter_box tr').css("background-color", "transparent");
    let tab = $('#letter_box'); //具有滚动条的div
    let scrollTo = $('.letter' + person_id); //获取指定class的元素 思路定位行高度量-顶部高度量 +当前滚动条位置高度

    if(scrollTo.length > 0){  // 找到用户
        tab.scrollTop(
            scrollTo.offset().top - tab.offset().top + tab.scrollTop()
        );
        
        // 高亮显示
        scrollTo.css("background-color", highlight_letter_color);
    }
}