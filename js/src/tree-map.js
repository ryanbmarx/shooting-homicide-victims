import * as d3 from 'd3'
import getTribColor from './utils/getTribColors.js';
import getTextColor from './utils/get-text-color.js';


class TreeMap{
	constructor(options){
		const app = this;
		app.options = options;

		const 	data = options.data,
				container = d3.select(app.options.container),
				legendWidth = 150,
				bbox = app.options.container.getBoundingClientRect(),
				width = bbox.width - legendWidth,
				height = bbox.height,
				margin = app.options.innerMargins,
				innerHeight = height - margin.top - margin.bottom,
				innerWidth = width - margin.right - margin.left,
				colors = [
					getTribColor('trib_red2'),
					getTribColor('trib_orange'),
					getTribColor('trib_yellow1'),
					getTribColor('trib_blue2'),
					getTribColor('trib_blue3'),
					getTribColor('trib_blue5'),
					getTribColor('trib_green2'),
					getTribColor('trib_green4'),
					getTribColor('trib_blue_gray')
				];

		console.log(data);

		const colorScale = d3.scaleOrdinal()
			.range(colors)

		const treemap = d3.treemap()
			// .tile(d3.treemapResquarify)
			.size([innerWidth, innerHeight])
			.round(true)
			.paddingInner(2)

		const rt = d3.hierarchy(data, d => d.children)
			.sum(d => d.y);

		const violenceTree = treemap(rt);
		
		const svg = container
			.append('svg')
			.attr('width', width)
			.attr('height', height);

		const chartInner = svg
			.append('g')
			.classed('chart-inner', true)
			.attr('width', innerWidth)
			.attr('height', innerHeight)
			.attr('transform', `translate(${margin.left}, ${margin.top})`);

		const legend = container.insert('dl')
			.classed('causes-legend', true);

		const cell = chartInner.selectAll('g')
			.data(violenceTree.leaves())
			.enter()
			.append('g')
	      	.attr("transform", function(d) { 
	      		return "translate(" + d.x0 + "," + d.y0 + ")"; 
	      	});

		cell.append('rect')
			.attr("width", function(d) { return d.x1 - d.x0; })
			.attr("height", function(d) { return d.y1 - d.y0; })
			.attr("fill", d => colorScale(d['data']['x']))
			.each(d => {
				legend.append('dt')
					.append('span')
					.classed('causes-legend__box', true)
					.style('background-color', colorScale(d['data']['x']));
				legend.append('dd')
					.text(`${d['data']['x']} (${d['data']['y']})`);

			});

		cell.append('text')
			.classed('tree-label', true)
			.attr('x', d => (d.x1 - d.x0)/2)
			.attr('y', d => (d.y1 - d.y0)/2)
			.attr('dy', ".35em")
			.attr('text-anchor', 'middle')
			.style('fill', d => getTextColor(colorScale(d['data']['x']), true))
			.text(d => d.data.y)



	}


}

module.exports = TreeMap;