let year_start = 1295;
let year_end = 1620;

let year_visible_start = year_start;
let year_visible_end = year_end;

let nianhao_time = [{'nianhao': '元貞', 'firstyear': 1295, 'lastyear': 1297},
{'nianhao': '大德', 'firstyear': 1297, 'lastyear': 1307},
{'nianhao': '至大', 'firstyear': 1308, 'lastyear': 1311},
{'nianhao': '皇慶', 'firstyear': 1312, 'lastyear': 1313},
{'nianhao': '延祐', 'firstyear': 1314, 'lastyear': 1320},
{'nianhao': '至治', 'firstyear': 1321, 'lastyear': 1323},
{'nianhao': '泰定', 'firstyear': 1324, 'lastyear': 1328},
{'nianhao': '天曆', 'firstyear': 1328, 'lastyear': 1330},
{'nianhao': '至順', 'firstyear': 1330, 'lastyear': 1333},
{'nianhao': '元統', 'firstyear': 1333, 'lastyear': 1334},
{'nianhao': '至元', 'firstyear': 1335, 'lastyear': 1340},
{'nianhao': '至正', 'firstyear': 1341, 'lastyear': 1370},
{'nianhao': '洪武', 'firstyear': 1368, 'lastyear': 1398},
{'nianhao': '建文', 'firstyear': 1399, 'lastyear': 1402},
{'nianhao': '永樂', 'firstyear': 1403, 'lastyear': 1424},
{'nianhao': '洪熙', 'firstyear': 1425, 'lastyear': 1425},
{'nianhao': '宣德', 'firstyear': 1426, 'lastyear': 1435},
{'nianhao': '正統', 'firstyear': 1436, 'lastyear': 1449},
{'nianhao': '景泰', 'firstyear': 1450, 'lastyear': 1457},
{'nianhao': '天順', 'firstyear': 1457, 'lastyear': 1464},
{'nianhao': '成化', 'firstyear': 1465, 'lastyear': 1487},
{'nianhao': '弘治', 'firstyear': 1488, 'lastyear': 1505},
{'nianhao': '正德', 'firstyear': 1506, 'lastyear': 1521},
{'nianhao': '嘉靖', 'firstyear': 1522, 'lastyear': 1566},
{'nianhao': '隆慶', 'firstyear': 1567, 'lastyear': 1572},
{'nianhao': '萬曆', 'firstyear': 1573, 'lastyear': 1620}];


function draw_timeline(containerid) {
    // 获取画布大小
    let width = $('#' + containerid).width()
    let height = $('#' + containerid).height()
    let svg = d3.select('#' + containerid)
        .select('svg')
        .attr('width', width)
        .attr('height', height);

    // 画图范围
    let margin = ({ top: 10, right: 20, bottom: 20, left: 20 })
    const brush = d3.brushX()
        .extent([[margin.left, margin.top-10], [width - margin.right, height - margin.bottom+10]])
        .on("start brush end", brushed);
    let x = d3.scaleLinear([year_start, year_end], [margin.left, width - margin.right]);  // 线性映射。输入范围；输出范围

    let xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
    svg.append("g")
        .call(xAxis);

    
    // 添加年号图例
    svg.append("g")
        .selectAll("rect")
        .data(nianhao_time)
        .join("rect")
        .attr("x", (d, i)=>(x(d.firstyear)))
        .attr("y", margin.top)
        .attr("height", height - margin.bottom - margin.top)
        .attr("width", (d, i)=>x(d.lastyear)-x(d.firstyear))
        .style("fill", (d, i)=>{
            let color = nianhao_color[d.nianhao];
            if(!color){
                console.log(1);
            }
            return color;
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