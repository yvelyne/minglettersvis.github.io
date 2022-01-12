function draw_letters(person_id) {
    let content = '<table class="pure-table">';
    let count = 0;
    if(person_id===null){ // 展示全部
        for(person_id in letter_data){
            if(count>3) break;
            content += draw_one_person_data(person_id, content);
            count += 1;
        }
        content += '<tr class=letterellipsis>'
        + '<td width="100px">···</td>'
        + '<td width="55px">···</td>'
        + '<td width="40px">···</td>'
        + '<td width="120px">···</td></tr>';
    }
    else{
        content += draw_one_person_data(person_id, content);
    }
    content += '</table>';
    let letter_box = d3.select('#letter_box');
    letter_box.html(content);
}

function draw_one_person_data(person_id, content){
    let data = letter_data[person_id];
    if(!data || JSON.stringify(data)==='{}') return '';
    for (i = 0; i < data.length; i++) {
        person_id = data[i].penpal_id ? data[i].penpal_id : -1;  // 通信人id。若没有id则设为-1
        content += '<tr class=letter' + person_id + '>'
            + '<td width="100px">' + data[i].title + '</td>'
            + '<td width="55px">' + data[i].penpal_name + '</td>'
            + '<td width="40px">' + data[i].type + '</td>'
            + '<td width="120px">' + data[i].collection + '</td></tr>';
    }
    return content;
}

//滚动定位
function scollerLocation(person_id) {
    // https://www.cnblogs.com/Binblink/p/7499656.html
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