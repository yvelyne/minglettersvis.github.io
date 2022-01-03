function get_tick_num(min_, max_, min_range, max_tick_num) {
    let range = max_ - min_
    let tick_num = range / min_range;
    while (tick_num > max_tick_num) {
        tick_num *= 0.5;
    }
    return Math.ceil(tick_num);
}

function draw_birthyear(containerid, data) {
    let x_attr = 'dob';  // 出生年份
    let y_attr = 'count';  // 信件数量

    // 获取画布大小
    let width = $('#' + containerid).width()
    let height = $('#' + containerid).height()
    let padding = { 'left': 0.1 * width, 'bottom': 0.2 * height, 'top': 0.1 * height, 'right': 0.1 * width };

    let svg = d3.select('#' + containerid)
        .select('svg')
        .attr('width', width)
        .attr('height', height);
    svg.selectAll("*").remove();

    // x axis
    let x = d3.scaleLinear()
        .domain([data["year_min"], data["year_max"]])
        .range([padding.left, width - padding.right]);
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(get_tick_num(data["year_min"], data["year_max"], 10, 10))
        .tickFormat(d => d);

    // y axis
    let y = d3.scaleLinear()
        .domain([data["count_min"], data["count_max"]])  // 写信数量为正，收信数量为负
        .range([height - padding.bottom, padding.top]);

    let axis_y = d3.axisLeft()
        .scale(y)
        .ticks(get_tick_num(data["count_min"], data["count_max"], 1, 6))  // 刻度数量
        .tickFormat(d => d);

    // x axis
    svg.append('g')
        .attr('transform', `translate(${0}, ${height - padding.bottom})`)
        .call(axis_x)
        .attr('font-size', '0.8rem')

    svg.append('g')
        .attr('transform', `translate(${padding.left + (width - padding.left - padding.right) / 2}, ${height - padding.bottom})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dx', '-0.4rem')
        .attr('dy', 0.1 * height)
        .text('出生年份');

    // y axis
    svg.append('g')
        .attr('transform', `translate(${padding.left}, ${0})`)
        .call(axis_y)
        .attr('font-size', '0.8rem')
    svg.append('g')
        .attr('transform', `
            translate(${padding.left}, ${height / 2})
            rotate(-90)    
        `)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dy', -height * 0.1)
        .attr('dx', height * 0.07)
        .text('寄信数量');
    svg.append('g')
        .attr('transform', `
            translate(${padding.left}, ${height / 2})
            rotate(-90)    
        `)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dy', -height * 0.1)
        .attr('dx', -height * 0.27)
        .text('收信数量');

    // points
    if(JSON.stringify(data) === '{}') return;  // 没有数据
    svg.append('g')
        .selectAll('circle')
        .data(data['points'])
        .enter().append('circle')
        .attr('class', 'point')
        .attr('id', d => 'point' + d['id'])
        .attr('cx', (d, i) => {
            return x(parseInt(d[x_attr]));
        })
        .attr('cy', (d, i) => {
            return y(parseInt(d[y_attr]));
        })
        .attr('r', 3)
        .attr('fill', (d, i) => {
            if (d['type'] === 'write') {
                return write_color;
            } else if (d['type'] === 'receive') {
                return receive_color;
            } else {
                return center_color;
            }
        })
        .on('mouseover', (e, d) => {
            linking_highlight(d.id);
            show_point_tooltip(e, d);
        })
        .on('mouseout', (e, d) => {
            renew();
            let tooltip = d3.select('#point_tooltip');
            tooltip.style('visibility', 'hidden');
        })
}

// 悬浮的tooltip
function show_point_tooltip(event, d) {
    
    let dob = d['birth_year'] ? d['birth_year'] : '未详'
    let dod = d['death_year'] ? d['death_year'] : '未详'
    let action = '';
    let content = '';
    if(d['type']=='receive'){
        content = '收到' + profile_data[d['id']]['name'] + (-d['count']) + '封';
    }else if(d['type']=='write'){
        content = '寄给' + profile_data[d['id']]['name'] + d['count'] + '封';
    }else{
        content = profile_data[d['id']]['name'];
    }
    
    // tooltip
    let tooltip = d3.select('#point_tooltip');
    tooltip.html(content)
        .style('left', (event.clientX + 20) + 'px')
        .style('top', (event.clientY + 20) + 'px')
        //.transition().duration(500)
        .style('visibility', 'visible');
}

function renew() {
    d3.selectAll('.point')
        .attr('stroke', 'none')
    d3.selectAll('.node')
        .attr('stroke', 'none')
}

function linking_highlight(person_id) {
    // 高亮节点
    d3.selectAll('#point' + person_id)
        .attr("stroke", highlight_stroke_color)
        .attr("stroke-width", 2);  // scatterplot描边
    d3.select('#node' + person_id)
        .attr('stroke', highlight_stroke_color)
        .attr("stroke-width", 5);  // 图节点描边
}