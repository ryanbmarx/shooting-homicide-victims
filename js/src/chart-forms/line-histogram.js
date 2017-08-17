import * as d3 from 'd3';

class LineHistogram{
	constructor(options){
		const 	app = this,
				container = d3.select(options.container),
				bbox = container.node().getBoundingClientRect(), 
				height = bbox.height,
				width = bbox.width,
				margin = options.innerMargins,
				innerHeight = height - margin.top - margin.bottom,
				innerWidth = width - margin.right - margin.left,
				data = options.data;

		console.log(options, bbox);

		app.options = options;

		console.log(data);

		// ###
		// SET SCALES, AXES, ETC.
		// ###


		const svg = container.append('svg')
				.attr('width', width)
				.attr('height', height);

			
		const chartInner = svg.append('g')
			.classed('chart-inner', true)
			.attr('transform', `translate(${margin.left}, ${margin.top})`);

		const xExtent = d3.extent(data, d => parseInt(d.x))

		const x = d3.scaleLinear()
			.range([0, innerWidth]) 
			.domain(xExtent);

		const xAxisFunc = d3.axisBottom(x);

		const xAxis = svg
			.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(${margin.left}, ${margin.top + innerHeight})`)
			.call(xAxisFunc);

		const yExtent = d3.extent(data, d => parseInt(d.y))

		const y = d3.scaleLinear()
			.range([innerHeight, 0]) 
			.domain(yExtent.reverse());

		const yAxisFunc = d3.axisLeft(x);

		const yAxis = svg
			.append('g')
			.attr('class', 'y axis')
			.attr('transform', `translate(${margin.left}, ${margin.top})`)
			.call(yAxisFunc);

		// ###
		// MAKE A LINE
		// ###

		const line = d3.line()
			.curve(d3.curveBasisOpen)
		    .x(d => {
		    	console.log(x(parseInt(d['x'])));
		    	return x(parseInt(d['x']))})
		    .y(d => y(parseInt(d['y'])));

		chartInner.append("path")
			.datum(data)
			.attr("class", `line`)
			.attr("d", line)
			.attr('stroke', "black")
			.attr('stroke-width', 3)
			.attr('fill', 'transparent')
			.attr('stroke-linecap', 'round');

	}
}

module.exports = LineHistogram;