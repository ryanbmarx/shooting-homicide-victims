import * as d3 from 'd3';

class ListBarChart{
	constructor(options){
		const app = this;
		const 	container = d3.select(options.container),
				bbox = 	options.container.getBoundingClientRect(), 
				height = bbox.height,
				width = bbox.width,
				margin = options.innerMargins,
				innerHeight = height - margin.top - margin.bottom,
				innerWidth = width - margin.right - margin.left,
				data = options.data;

		// ----------------------------------
		// SCALES AND AXES
		// ----------------------------------

		// The y scale

		const y = d3.scaleBand()
			.range([0, innerHeight])
			.padding(0.01)
			.domain(data.map(d => d['x']));
		
		// The x scale

		const x = d3.scaleLinear()
			.domain(d3.extent(data, d => d['y']))
			.range([0, innerWidth]);

		// The x axes

		const xAxisTop = d3.axisTop(x)
			.ticks(options.xTicks);

		const xAxisBottom = d3.axisBottom(x)
			.ticks(options.xTicks);


		// ----------------------------------
		// START MESSING WITH SVGs
		// ----------------------------------

		//Inserts svg and sizes it
		const svg = container
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        svg.append('g')
        	.attr('class', 'axis axis--x-top')
        	.attr('transform', `translate(${ margin.left },${ margin.top })`)
        	.call(xAxisTop)
        	.select('.domain').remove();

        svg.append('g')
        	.attr('class', 'axis axis--x-bottom')
        	.attr('transform', `translate(${ margin.left },${ innerHeight + margin.top })`)
        	.call(xAxisBottom)
        	.select('.domain').remove();

		const chartInner = svg.append('g')
			.classed('chartInner', true)
			.attr("width",innerWidth)
			.attr("height",innerHeight)
			.attr(`transform`,`translate(${ margin.left },${ margin.top })`);

		// ----------------------------------
		// Add the data
		// ----------------------------------

		const ethnicity = chartInner.selectAll('g')
			.data(data)
			.enter()
			.append('g')
			.classed('race-ethnicity', true)
			.attr('transform', d => `translate(0,${y(d['x'])})`)
			.attr('text-anchor', 'start')
			.style('font-family','Arial, sans-serif')
			.style('font-size','13px')
			.style('font-weight', 'bold')
			.style('stroke-linecap','round');

		ethnicity.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('height', y.bandwidth())
			.attr('width', d => x(d['y']))
			.attr('fill', options.barColor);

		ethnicity.append('text')
			.attr('x', 0)
			.attr('y', y.bandwidth() / 2)
			.attr('transform', d => `translate(10,0)`)
			.text(d => `${d['x']} (${d['y']})`)
			.attr('dy', '.3em')
			.style('fill','black');
	}
}


module.exports = ListBarChart;