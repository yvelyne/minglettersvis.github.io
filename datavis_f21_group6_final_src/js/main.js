let _width = $(window).width();
let _height = $(window).height();

let profile_data = null;

let nianhao_color = {
    '大德': '#xexa2a',
    '至大': '#1a1042',
    '延祐': '#28115a',
    '至治': '#3bxf70',
    '致和': '#4c107a',
    '至順': '#5c167f',
    '至元': '#6b1c81',
    '至正': '#7c2382',
    '宣光': '#8c2981',
    '天光': '#9d2e7f',
    '永樂': '#ad337c',
    '宣德': '#bf3976',
    '正統': '#cf4070',
    '景泰': '#de4968',
    '天順': '#ea5561',
    '成化': '#f4675c',
    '弘治': '#fa795d',
    '正德': '#fd8c63',
    '嘉靖': '#fe9f6d',
    '隆慶': '#ffb47b',
    '萬曆': '#ffc68a',
    '不详': '#a0a0a0'
};

// node设置
let receive_color = "orange";
let write_color = "blue";
let center_color = "red";
let highlight_stroke_color = "#ff6a33";  // 悬浮时高亮描边颜色

// link设置
let default_link_color = "#808080";
let default_link_opacity = 0.6;

// 重点人物
person_list = [
    29570,  // 陈献章
    123973,  // 申时行
    65870,  // 汤显祖
];

function main() {
    draw_timeline('timeline_plot');

    // 图
    d3.json('./data/save.json').then(function (data) {
        draw_graph('graph_plot', data, false);
    })
    // 人物
    d3.json('./data/profile_data.json').then(function (data){
        profile_data = data;
        draw_birthyear('birthyear_plot', {});

        // 几个重点人物
        for(i=0; i<person_list.length; i++){
            person_id = person_list[i];
            element_id = 'birthyear_plot_' + person_id;
            let element = "<div id='" + element_id + "' class='birthyear_container'>"
			    + "<svg></svg></div>";
            $('#special_person').append(element);
            draw_birthyear(element_id, profile_data[person_id]['penpal']);
        }
    })
}

main()
