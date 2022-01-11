let _width = $(window).width();
let _height = $(window).height();

let profile_data = null;
let letter_data = null;

// todo 书信关系颜色设置（graph中的边，scatterplot中的点）
let receive_color = "orange";  // 收信颜色
let write_color = "blue";  // 寄信颜色
let center_color = "red";  // 中心人物
let highlight_stroke_color = "#5D5769";  // 鼠标悬浮时高亮描边颜色
let unknown_value_color = "#81876B";  // 未知值的颜色。例如缺失出生年份、缺失标准差时使用此颜色

// todo 调整年号配色。目前的配色是通过main.py的generate_colors函数生成的。
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
    '不详': unknown_value_color
};

// todo link设置
let default_link_color = "#8A8995";
let default_link_opacity = 0.6;

// todo 高亮信件颜色
let highlight_letter_color = "#FFEED7";

function main() {
    // 放置下拉框
    $('#color_by_select').css("left", $('#graph_plot').offset().left + "px")
        .css('visibility', 'visible');

    draw_timeline('timeline_plot');
	
    // 人物
    d3.json('./data/profile_data.json').then(function (data){
        profile_data = data;
        draw_birthyear('birthyear_plot', {});

        // 图
        // // todo 调graph时使用下面这段，调至满意后将最后一个参数改为true，将下载的文件保存为./data/save.json，并切换为直接显示模式
        // d3.json('./data/graph.json').then(function (data) {
        //     draw_graph('graph_plot', data, true);
        // })
        // 直接显示模式，数据中存了节点的坐标
        d3.json('./data/save.json').then(function (data) {
            draw_graph('graph_plot', data, false);
        })
    })

    // 书信
    d3.json('./data/letter.json').then(function(data){
        letter_data = data;
        draw_letters({});
    })
}

main()
