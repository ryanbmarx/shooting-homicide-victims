import * as d3 from 'd3'


class TreeMap{
	constructor(options){
		const app = this;
		app.options = options;

		const 	data = options.data,
				container = d3.select(app.options.container),
				bbox = app.options.container.getBoundingClientRect(),
				width = bbox.width,
				height = bbox.height,
				margin = app.options.innerMargins,
				innerHeight = height - margin.top - margin.bottom,
				innerWidth = width - margin.right - margin.left;

		console.log(data);


		const treemap = d3.treemap()
			// .tile(d3.treemapResquarify)
			.size([innerWidth, innerHeight])
			.round(true)
			.paddingInner(2)

		const rt = d3.hierarchy(data, d => d.children)
			.sum(d => d.y);

		const violenceTree = treemap(rt);
		
		console.log(violenceTree.leaves());

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

		const cell = chartInner.selectAll('g')
			.data(violenceTree.leaves())
			.enter()
			.append('g')
	      	.attr("transform", function(d) { 
	      		console.log(d);
	      		return "translate(" + d.x0 + "," + d.y0 + ")"; 
	      	});

		cell.append('rect')
			.attr("width", function(d) { return d.x1 - d.x0; })
			.attr("height", function(d) { return d.y1 - d.y0; })
			.attr("fill", 'rgba(255,0,0,.5)');

	}
}

module.exports = TreeMap;