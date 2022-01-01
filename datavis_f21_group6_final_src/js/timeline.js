let year_start = 1300;
let year_end = 1620;
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
            const [year0, year1] = selection.map(x.invert);  // 反向映射
            $('#test').html(year1);
            // 选择node
            d3.selectAll('.node')
                .style('opacity', function (d) {
                    if (!d['birth_year']) return 0;
                    if (d['birth_year'] >= year0 && d['birth_year'] <= year1) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
            d3.selectAll('.link')
                .style("stroke-opacity", function (link_) {
                    let source_year = link_.source.birth_year;
                    let target_year = link_.target.birth_year;
                    if (!source_year || !target_year) return 0;
                    if (source_year >= year0 && source_year<=year1 && target_year >= year0 && target_year <= year1) {
                        return default_link_opacity;
                    } else {
                        return 0
                    };
                });
        }
    }

    return svg.node();
}