function draw_graph(containerid, data, save_layout) {
    // 获取画布大小
    let width = $('#' + containerid).width()
    let height = $('#' + containerid).height()
    let svg = d3.select('#' + containerid)
        .select('svg')
        .attr('width', width)
        .attr('height', height);

    let links = data.links;
    let nodes = data.nodes;

    // todo 调整图的布局。文档：https://github.com/d3/d3-force
    let simulation = d3.forceSimulation(nodes)
        .alphaDecay(0.03)  // todo 衰减参数，值越大越早停止布局迭代
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))  // 中间的引力，使整个图趋近圆形
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force('collide', d3.forceCollide(d => {  // 防止重叠。值越大，分布越稀疏，迭代的时间越长
            if (d.radius > 100)
                return (20);
            else
                return (3);
        }));

    // links
    let link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", default_link_opacity)
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("class", "link")
        .attr("stroke-width", d => Math.sqrt(d.value))
        .attr("stroke", default_link_color)
        .attr("d", linkArc)

    // 构建邻接关系
    // 参考：https://stackoverflow.com/questions/8739072/highlight-selected-node-its-links-and-its-children-in-a-d3-force-directed-grap
    let linkedByIndex = {};
    links.forEach(function (item) {
        linkedByIndex[item.source.id + "," + item.target.id] = 1;
    })

    function neighboring(node1, node2) {
        return linkedByIndex[node1.id + "," + node2.id];
    }

    // nodes
    let flag = false;
    let node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => {
            return Math.sqrt(d.radius)*0.6;  // todo 节点大小映射
        })
        .attr('x', d => d['fx'])
        .attr('y', d => d['fy'])
        .attr('id', d => 'node' + d['id'])
        .attr('class', d => 'node ' + d["nianhao"])
        .attr("fill", d => nianhao_color[d.nianhao])
        .style('opacity', 1)
        .on("click", function (event, node_) {
            if(node_.birth_year<year_visible_start || node_.birth_year > year_visible_end) return;
            flag = !flag;  // 点击次数
            if (flag) {
                show_connected(node_);
                if(node_.agg) return;
                draw_birthyear('birthyear_plot', profile_data[node_.id]['penpal']);  // 设置birthdayplot
                draw_letters(letter_data[node_.id]);  // 显示书信信息
                generate_introduction(node_.id);
            } else {
                renew_graph();
                draw_birthyear('birthyear_plot', {});  // 清空birthdayplot
                draw_letters({})
                clear_introdcution();
            }
        })
        .on("mouseover", function (event, d) {
            if (parseFloat(this.style.opacity) != 1) return;  // 隐藏的节点不高亮
            linking_highlight(d.id);
            show_node_tooltip(event, d);
        })
        .on("mouseout", function (event, d) {
            renew();
            let tooltip = d3.select('#node_tooltip');
            tooltip.style('visibility', 'hidden');
        });

    function show_connected(node_) {
        // 其他结点
        d3.selectAll('.node')
        .style("opacity", 0)
        .filter((d, i)=>filter_node_by_year(d, i))
        .style("opacity", function (o) {
            if (!neighboring(node_, o) && !neighboring(o, node_)) {  // 不相连
                return 0.3;
            } else { // 相连
                return 1;
            }            
        });
        // 被选中结点
        d3.select('#node' + node_.id)
            .style("opacity", 1)
        // 相连的边

        d3.selectAll('.link')
        .style("stroke-opacity", 0)
        .filter((d, i)=>filter_link_by_year(d, i))
        .style("stroke-opacity", function (link_) {
            if (link_.source.id === node_.id || link_.target.id === node_.id) {
                return default_link_opacity;
            } else
                return 0;
        })
        .style("stroke", function (link_) {
            if (link_.source.id === node_.id) {  // 寄出
                return write_color;
            } else if (link_.target.id === node_.id) {
                return receive_color;
            }
        })
    }

    // 重置graph
    function renew_graph() {
        d3.selectAll('.node')
        .filter((d, i)=>filter_node_by_year(d, i))
        .style("opacity", 1);

        node.style("stroke", null)

        d3.selectAll('.link')
        .filter((d, i)=>filter_link_by_year(d, i))
        .style("stroke-opacity", default_link_opacity);
        link.style("stroke", default_link_color);
    }

    // 弧线link
    function linkArc(d) {
        const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
        return `
          M${d.source.x},${d.source.y}
          A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
        `;
    }

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        link.attr("d", linkArc);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    })
        .on("end", function () {
            if (!save_layout) return;
            // // 下载数据到本地
            for (i = 0; i < node.data().length; i++) {
                node.data()[i]["fx"] = node.data()[i]["x"];
                node.data()[i]["fy"] = node.data()[i]["y"];
                node.data()[i]["vx"] = 0;
                node.data()[i]["vy"] = 0;
            }
            link.attr("d", linkArc)
            let data = {
                "nodes": node.data(),
                "links": link.data()
            }
            let content = JSON.stringify(data);
            let blob = new Blob([content], { type: "text/plain;charset=utf-8" });
            saveAs(blob, "save.json");
        });
}

// 悬浮的tooltip
function show_node_tooltip(event, d) {
    let content = ''
    if (d['agg']) {  // 是聚合节点
        content = '<table><tr><td>' + d['name'].split(',').slice(0, 3).join('，') + ' 等</td></tr></table>';
    } else {
        let dob = d['birth_year'] ? d['birth_year'] : '未详'
        let dod = d['death_year'] ? d['death_year'] : '未详'
        let nianhao = d['nianhao'] ? d['nianhao'] : '未详'

        content = '<table><tr><td>姓名</td><td>' + d['name'] + '</td></tr>'
            + '<tr><td>生卒年</td><td>' + dob + '-' + dod + '</td></tr>'
            + '<tr><td>年代</td><td>' + nianhao + '</td></tr>'
            + '<tr><td>寄/收信</td><td>' + d['radius'] + '封</td></tr>'
            + '</table>';
    }
    // tooltip
    let tooltip = d3.select('#node_tooltip');
    tooltip.html(content)
        .style('left', (event.clientX + 20) + 'px')
        .style('top', (event.clientY + 20) + 'px')
        //.transition().duration(500)
        .style('visibility', 'visible');
}
