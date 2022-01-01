let _width = $(window).width();
let _height = $(window).height();
let width = 0.9 * _width;
let height = 1 * _height;

let profile_data = null;

function main() {
    // 图
    d3.json('./data/graph.json').then(function (data) {
        draw_graph('graph_plot', data);
    })
    // 年龄分布
    d3.json('./data/profile_data.json').then(function (data){
        profile_data = data;
        draw_birthyear('birthyear_plot', profile_data[28691]['penpal']);
    })
}

main()
