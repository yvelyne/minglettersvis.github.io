let _width = $(window).width();
let _height = $(window).height();

let profile_data = null;

let nianhao_color = {
    '元貞': '#170f3d',
    '大德': '#1b1044',
    '至大': '#221150',
    '皇慶': '#251155',
    '延祐': '#28115a',
    '至治': '#2d1161',
    '泰定': '#321067',
    '天曆': '#360f6b',
    '至順': '#370f6c',
    '元統': '#390f6e',
    '至元': '#3e0f72',
    '至正': '#51127c',
    '洪武': '#6b1c81',
    '建文': '#7b2382',
    '永樂': '#882781',
    '洪熙': '#932b80',
    '宣德': '#992d80',
    '正統': '#a5317e',
    '景泰': '#b0347b',
    '天順': '#b73779',
    '成化': '#c63c74',
    '弘治': '#da466b',
    '正德': '#e75163',
    '嘉靖': '#f7705c',
    '隆慶': '#fd8c63',
    '萬曆': '#ffac76',
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
