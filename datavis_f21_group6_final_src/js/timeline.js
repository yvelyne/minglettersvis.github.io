let year_start = 1300;
let year_end = 1620;

let year_visible_start = year_start;
let year_visible_end = year_end;

function draw_timeline(containerid) {
    // 获取画布大小
    let width = $('#' + containerid).width()
    let height = $('#' + containerid).height()
    let svg = d3.select('#' + containerid)
        .select('svg')
        .attr('width', width)
        .attr('height', height);

    // 选中范围
    let margin = ({ top: 10, right: 20, bottom: 20, left: 20 })
    const brush = d3.brushX()
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .on("start brush end", brushed);
    let x = d3.scaleLinear([year_start, year_end], [margin.left, width - margin.right]);  // 线性映射。输入范围；输出范围

    let xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(brush)
        .call(brush.move, [year_start, year_end].map(x));

    function brushed(event) {
        const selection = event.selection;
        if (selection === null) {
            circle.attr("stroke", null);
        } else {
            [year_visible_start, year_visible_end] = selection.map(x.invert);  // 反向映射
            // 重置所有节点
            d3.selectAll('.node')
            .style('opacity', 0) 
            .filter((d, i)=>filter_node_by_year(d, i))   // 筛选可见的node
            .style("opacity", 1);
            
            // 重置所有边
            d3.selectAll('.link')
            .style('stroke-opacity', 0)  
            .filter((link_,i) => filter_link_by_year(link_, i))  // 筛选可见的边
            .style("stroke-opacity", default_link_opacity);
        }
    }
}

function filter_node_by_year(d, i){
    if (!d['birth_year']) return false;
    if (d['birth_year'] < year_visible_start || d['birth_year'] > year_visible_end) {
        return false;
    } else {
        return true;
    }
}

function filter_link_by_year(link_, i){
    let source_year = link_.source.birth_year;
    let target_year = link_.target.birth_year;
    if (!source_year || !target_year) return false;
    if (source_year >= year_visible_start && source_year<=year_visible_end && 
        target_year >= year_visible_start && target_year <= year_visible_end) {
        return true;
    } else {
        return false;
    };
}