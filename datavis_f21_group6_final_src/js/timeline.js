let year_start = 1290;
let year_end = 1670;

let year_visible_start = year_start;
let year_visible_end = year_end;

let count_max = 180;

let nianhao_time = [{'mid': 1295, 'count': 1, 'nianhao': '元貞'},
{'mid': 1305, 'count': 1, 'nianhao': '大德'},
{'mid': 1315, 'count': 0, 'nianhao': '延祐'},
{'mid': 1325, 'count': 1, 'nianhao': '泰定'},
{'mid': 1335, 'count': 0, 'nianhao': '至元'},
{'mid': 1345, 'count': 0, 'nianhao': '至正'},
{'mid': 1355, 'count': 2, 'nianhao': '至正'},
{'mid': 1365, 'count': 3, 'nianhao': '至正'},
{'mid': 1375, 'count': 0, 'nianhao': '洪武'},
{'mid': 1385, 'count': 1, 'nianhao': '洪武'},
{'mid': 1395, 'count': 1, 'nianhao': '洪武'},
{'mid': 1405, 'count': 3, 'nianhao': '永樂'},
{'mid': 1415, 'count': 6, 'nianhao': '永樂'},
{'mid': 1425, 'count': 29, 'nianhao': '洪熙'},
{'mid': 1435, 'count': 45, 'nianhao': '宣德'},
{'mid': 1445, 'count': 34, 'nianhao': '正統'},
{'mid': 1455, 'count': 41, 'nianhao': '景泰'},
{'mid': 1465, 'count': 34, 'nianhao': '成化'},
{'mid': 1475, 'count': 49, 'nianhao': '成化'},
{'mid': 1485, 'count': 62, 'nianhao': '成化'},
{'mid': 1495, 'count': 71, 'nianhao': '弘治'},
{'mid': 1505, 'count': 111, 'nianhao': '弘治'},
{'mid': 1515, 'count': 119, 'nianhao': '正德'},
{'mid': 1525, 'count': 107, 'nianhao': '嘉靖'},
{'mid': 1535, 'count': 140, 'nianhao': '嘉靖'},
{'mid': 1545, 'count': 135, 'nianhao': '嘉靖'},
{'mid': 1555, 'count': 177, 'nianhao': '嘉靖'},
{'mid': 1565, 'count': 89, 'nianhao': '嘉靖'},
{'mid': 1575, 'count': 54, 'nianhao': '萬曆'},
{'mid': 1585, 'count': 38, 'nianhao': '萬曆'},
{'mid': 1595, 'count': 31, 'nianhao': '萬曆'},
{'mid': 1605, 'count': 16, 'nianhao': '萬曆'},
{'mid': 1615, 'count': 9, 'nianhao': '萬曆'},
{'mid': 1625, 'count': 5, 'nianhao': '德陵'},
{'mid': 1635, 'count': 3, 'nianhao': '思陵'},
{'mid': 1645, 'count': 0, 'nianhao': '顺治'},
{'mid': 1655, 'count': 0, 'nianhao': '顺治'},
{'mid': 1665, 'count': 1, 'nianhao': '康熙'}];


function draw_timeline(containerid) {
    // 获取画布大小
    let width = $('#' + containerid).width()
    let height = $('#' + containerid).height()
    let svg = d3.select('#' + containerid)
        .select('svg')
        .attr('width', width)
        .attr('height', height);

    // 画图范围
    let margin = ({ top: 10, right: 20, bottom: 20, left: 80 })
    const brush = d3.brushX()
        .extent([[margin.left, margin.top-10], [width - margin.right, height - margin.bottom+5]])
        .on("start brush end", brushed);
    let x = d3.scaleLinear([year_start, year_end], [margin.left, width - margin.right]);  // 线性映射。输入范围；输出范围
    let y = d3.scaleLinear([0, count_max], [height - margin.bottom, margin.top]);  // 线性映射。输入范围；输出范围

    let xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
    svg.append("g")
        .call(xAxis);
    // y轴
    let yAxis = g => g
        .attr('transform', `translate(${margin.left}, ${0})`)
        .call(
            d3.axisLeft()
            .scale(y)
            .ticks(5)  // 刻度数量
            .tickFormat(d => d))
    svg.append("g")
        .call(yAxis);

    svg.append('g')
        .attr('transform', `
            translate(${margin.left}, ${height / 2})
            rotate(-90)    
        `)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dy', -height * 0.35)
        .attr('dx', -height * 0.2)
        .text('出生人数');
    
    let qingAxis = g => g
        .attr('transform', `translate(${x(1644)}, ${0})`)
        .call(
            d3.axisLeft()
            .scale(y)
            .ticks(0)  // 刻度数量
            .tickFormat(d => d))
    svg.append("g")
        .call(qingAxis);
    svg.append('g')
        .attr('transform', `
            translate(${x(1644)}, ${height / 2})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dy', 0)
        .attr('dx', '10px')
        .text('清朝');

    let mingAxis = g => g
        .attr('transform', `translate(${x(1368)}, ${0})`)
        .call(
            d3.axisLeft()
            .scale(y)
            .ticks(0)  // 刻度数量
            .tickFormat(d => d))
    svg.append("g")
        .call(mingAxis);
    svg.append('g')
        .attr('transform', `
            translate(${x(1368)}, ${height / 2})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dy', 0)
        .attr('dx', '10px')
        .text('明朝');

    
    // 添加年号图例
    svg.append("g")
        .selectAll("rect")
        .data(nianhao_time)
        .join("rect")
        .attr("x", (d, i)=>(x(d.mid-5)))
        .attr("y", (d, i)=> y(d.count))
        .attr("height", (d, i) => height - margin.bottom - y(d.count))
        .attr("width", (x(1625)-x(1615))*0.95)
        .style("fill", (d, i)=>{
            return nianhao_color[d.nianhao];
        });

    // 添加刷选
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
            .style('visibility', 'hidden') 
            .filter((d, i)=>filter_node_by_year(d.id))   // 筛选可见的node
            .style("visibility", 'visible');

            d3.selectAll('.person_label')
            .style('visibility', 'hidden') 
            .filter((d, i)=>filter_node_by_year(d.id))   // 筛选可见的label
            .style("visibility", 'visible');
            
            // 重置所有边
            d3.selectAll('.link')
            .style('stroke-opacity', 0)  
            .filter((link_,i) => filter_link_by_year(link_, i))  // 筛选可见的边
            .style("stroke-opacity", default_link_opacity);
        }
    }
}

function filter_node_by_year(person_id){
    let d = profile_data[person_id];
    if (!d || !d['birth_year']) return false;
    if (d['birth_year'] < year_visible_start || d['birth_year'] > year_visible_end) {
        return false;
    } else {
        return true;
    }
}

function filter_link_by_year(link_, i){
    if(link_.source.agg || link_.target.agg) return false;
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