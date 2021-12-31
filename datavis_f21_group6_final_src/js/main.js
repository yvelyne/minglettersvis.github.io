let _width = $(window).width();
let _height = $(window).height();
let width = 0.9 * _width;
let height = 1 * _height;

let profile_data = null;
let color = {
'大德': '#xexa2a',
'至大': '#1a1042',
'延祐': '#28115a',
'至治': '#3bxf70',
'致和': '#4c107a',
'至順': '#5c167f',
'至元': '#6b1c81',
'至正': '#7c2382',
'宣光': '#8c2981',
'天光': '#9d2e7f',
'永樂': '#ad337c',
'宣德': '#bf3976',
'正統': '#cf4070',
'景泰': '#de4968',
'天順': '#ea5561',
'成化': '#f4675c',
'弘治': '#fa795d',
'正德': '#fd8c63',
'嘉靖': '#fe9f6d',
'隆慶': '#ffb47b',
'萬曆': '#ffc68a',
'不详': '#a0a0a0'
};
function draw_graph(containerid, data) {
    let svg = d3.select('#' + containerid)
        .select('svg')
        .attr('width', width)
        .attr('height', height);

    let links = data.links;
    let nodes = data.nodes;

    // 调用d3的force-directed graph实现
    let simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force('collide', d3.forceCollide(d => {
                if (d.radius > 100)
                    return (30);
                else
                    return (5);
            }));

    // 实现拖拽后重新进行图布局
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active)
                simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active)
                simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    // links
    let link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.6)
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("stroke-width", d => Math.sqrt(d.value))
        .attr("stroke", "#808080")
        .attr("text", d => d.value)
        .on("mouseover", function (event, link_) {});
    link.append("title")
    .text(d => `${d.source.name}写给${d.target.name}：\n${d.value}封`);

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
    let flag = true;
    let node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => {
           return Math.sqrt(d.radius);
		   
        })
        .attr("fill", d => color[d.nianhao])
        .call(drag(simulation))
        .on("click", function (event, node_) {
            flag = !flag;  // 点击次数
            if (flag) {
                // 其他结点
                node.style("opacity", function (o) {
                    if(neighboring(node_, o) || neighboring(o, node_)){
						return 1;
					}  else {return 0.3};
                });
                // 被选中结点
                d3.select(this).style("opacity", 1);
                // 相连的边
                link.style("stroke-opacity", function (link_) {
                    if (link_.source === node_ || link_.target === node_) {
                        return 0.6;
                    } else
                        return 0.1;
                });
            } else {
                node.style("opacity", 1);
                link.style("stroke-opacity", 0.5);
            }
        });

    node.append("title")
    .text(d => `${d.name}\n${d.radius}封`);

    // 弧线link
    function linkArc(d) {
        const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
        return `
		M${d.source.x},${d.source.y}
		A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
	  `;
    }
    simulation.on("tick", () => {
        link.attr("d", linkArc);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
        label.attr("x", d => d.x)
        .attr("y", d => d.y);
    });
}

function draw_legend(data) {
    let height = 50;
    let width = 600;
    let group = data.group;
    let svg = d3.select('#legend')
        .select('svg')
        .attr('width', width)
        .attr('height', height);
    // 图例
    // 参考：https://stackoverflow.com/questions/13573771/adding-a-chart-legend-in-d3
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("x", 0)
        .attr("y", height - 25)
        .attr("height", 100)
        .attr("width", 200);
    legend.selectAll('g').data(group)
    .enter()
    .append('g')
    .each(function (d, i) {
        var g = d3.select(this);
        g.append("rect")
        .attr("x", i * 50 + 100)
        .attr("y", height - 25)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", d => color[d]);

        g.append("text")
        .attr("x", i * 50 + 113)
        .attr("y", height - 15)
        .attr("height", 30)
        .attr("width", 100)
        .style("font-family", "sans-serif")
        .style("font-size", 12)
        .style("fill", d => color[d])
        .text(d => d);

    });
}
function main() {
    // 图
    // d3.json('./data/graph.json').then(function (data) {
    //     draw_graph('container1', data);
    // })
    // 年龄分布
    d3.json('./data/profile_data.json').then(function (data){
        profile_data = data;
        draw_birthyear('birthyear_plot', data);
    })
}

main()
