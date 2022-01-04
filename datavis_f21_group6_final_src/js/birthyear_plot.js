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
    let padding = { 'left': 0.15 * width, 'bottom': 0.2 * height, 'top': 0.05 * height, 'right': 0.05 * width };

    let svg = d3.select('#' + containerid)
        .select('svg')
        .attr('width', width)
        .attr('height', height);
    svg.selectAll("*").remove();

    let y_max = 2;
    let y_min = -2;
    let x_max = year_start;
    let x_min = year_end;
    if(JSON.stringify(data)!=='{}'){
        let y_range = data["count_max"][0] - data["count_min"][0]
        y_max = data["count_max"][0] + y_range * 0.1
        y_min = data["count_min"][0] - y_range * 0.1

        x_range = data["year_max"][0] - data["year_min"][0]
        x_max = data["year_max"][0] + x_range * 0.1
        x_min = data["year_min"][0] - x_range * 0.1
    }

    // x axis
    let x = d3.scaleLinear()
        .domain([x_min, x_max])
        .range([padding.left, width - padding.right]);
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(get_tick_num(x_min, x_max, 10, 10))
        .tickFormat(d => d);

    // y axis
    let y = d3.scaleLinear()
        .domain([y_min, y_max])  // 写信数量为正，收信数量为负
        .range([height - padding.bottom, padding.top]);

    let axis_y = d3.axisLeft()
        .scale(y)
        .ticks(get_tick_num(y_min, y_max, 1, 6))  // 刻度数量
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
        .style('top', (event.clientY + 40) + 'px')
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

function generate_introduction(person_id) {
    let person_data = profile_data[person_id];
    if(person_data===null) clear_introdcution();
    $('.person_name').html(person_data.name);
    $('#birthyear').html((person_data.birth_year?person_data.birth_year:'未详') 
        + '(' + person_data.nianhao + ')');
    $('#deathyear').html(person_data.death_year?person_data.death_year:'未详');
    if(JSON.stringify(person_data.penpal)!=='{}'){
        let penpal = person_data.penpal;
        let content = ''
        
        // 寄信情况
        if(penpal.count_max[0]>0){
            content = '共'+ penpal.write_sum + '封，其中寄给' 
            + profile_data[penpal.count_max[1]].name + penpal.count_max[0] + '封';
        } else{
            content = '无'
        }
        $('#write_letter').html(content);

        // 收信情况
        if(penpal.count_min[0]<0){
            content = '共'+ (-penpal.receive_sum) + '封，其中收到' 
            + profile_data[penpal.count_min[1]].name + (-penpal.count_min[0]) + '封';
        } else{
            content = '无'
        }
        $('#receive_letter').html(content);

        // 年龄情况
        content = profile_data[penpal.year_min[1]].name + '(年长' + (person_data.birth_year-penpal.year_min[0]) + '岁)；'
        + profile_data[penpal.year_max[1]].name + '(年轻' + (penpal.year_max[0]-person_data.birth_year) + '岁)；'
        + '标准差为' + penpal.std.toFixed(1) + '岁'; 
        $('#std').html(content);
    }
}

function clear_introdcution(){
    $('.person_name').html('');
    $('#birthyear').html('');
    $('#deathyear').html('');
    $('#write_letter').html('');
    $('#receive_letter').html('');
    $('#std').html('');
}
