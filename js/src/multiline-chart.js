import * as d3 from 'd3';

class MultilineChart{
	constructor(options){
		console.log(options)
		const 	app = this;
		app.options = options;
		app.data = options.data;
		app._container = options.container;

		MultilineChart.initChart(app);
	}


	static initChart(app){
		
		// ----------------------------------
		// GET THE KNOW THE CONTAINER
		// ----------------------------------

		const 	data = app.data,
				container = d3.select(app._container),
				bbox = app._container.getBoundingClientRect(), 
				height = bbox.height,
				width = bbox.width,
				margin = app.options.innerMargins,
				innerHeight = height - margin.top - margin.bottom,
				innerWidth = width - margin.right - margin.left;






		// ----------------------------------
		// start working with the SVG
		// ----------------------------------

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

		// ----------------------------------
		// APPEND AXES
		// ----------------------------------


	}
}

module.exports = MultilineChart;