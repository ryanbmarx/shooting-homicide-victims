import * as d3 from 'd3';
import orderBy from 'lodash.orderby';
import union from 'lodash.union';
import getTribColor from '../utils/getTribColors.js';
import monthFormatter from '../utils/month-formatter.js';



class GroupedBarChart{
	constructor(options){
		const 	app = this;
		app.options = options;
		app.data = app.options.data
		app._container = options.container;


		GroupedBarChart.initChart(app)

	}

	static initChart(app){		
		// ----------------------------------
		// GET THE KNOW THE CONTAINER
		// ----------------------------------

		const 	data = app.data.data,
				container = d3.select(app._container),
				bbox = app._container.getBoundingClientRect(), 
				height = bbox.height,
				width = bbox.width,
				margin = app.options.innerMargins,
				innerHeight = height - margin.top - margin.bottom,
				innerWidth = width - margin.right - margin.left,
				keys = Object.keys(data[0]).slice(1,3); // The first column is the Month indicator. Let's ditch it so we can find the max shootings without caring that the month also is a number.
				
		// ----------------------------------
		// BUILD SCALES AND AXES
		// ----------------------------------

		// Find the most shootings from either year.
		const yMax = d3.max(data, d => {
			return d3.max(keys, key => {
				return parseInt(d[key]);
			})
		})

		// The traditional yScale will govern bar height.
		const yScale = d3.scaleLinear()
			.domain([0, yMax ])
			.nice()
			.range([innerHeight,0]);

		// This will handle position of the bar groups, which is why it's domain is 0->innerWidth
		// It's a pretty typical xScale for bar charts.
		
		const xScale0 = d3.scaleBand()
			.range([0, innerWidth])
			.paddingInner(0.2)
			.domain(data.map(d => d.month));

		// This will govern position WITHIN the bar groups. We need a bar position for each year, and
		// those bars will need to be constrained to the width (the `bandwidth()`) defined by the other
		// xScale
		const xScale1 = d3.scaleBand()
			.padding(0.1)
			.domain(keys)
			.range([0,xScale0.bandwidth()]);

		// This scale will color the bars by year
		const barColorScale = d3.scaleOrdinal()
			.range([app.options.otherColor, app.options.currentColor])
			.domain(keys);

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

		const yAxis = svg
			.append('g')
			.attr('class', 'y axis')
			.attr('transform', `translate(${margin.left}, ${margin.top})`)
			.call(d3.axisLeft(yScale));

		const xAxisFunc = d3.axisBottom(xScale0)
			.tickFormat(monthFormatter);

		const xAxis = svg
			.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(${margin.left}, ${margin.top + innerHeight})`)
			.call(xAxisFunc);


		// ----------------------------------
		// MAKE CHART
		// ----------------------------------
		// We're going to append a g for each month and then, within that d3 datajoin, 
		// nest another data join to draw the bars

		chartInner
			.selectAll('g')
			.data(data)
				.enter()
				.append('g')
				.attr("transform", d => `translate(${ xScale0(d.month) },0)`)
				// now we start the new join
				.selectAll('rect')
				.data( d => {
					return keys.map( key => {
			    		return {key: key, value: d[key]}; 
					})
				}).enter()
					.append('rect')
					.attr("x", d => xScale1(d.key))
					.attr("y", d => yScale(d.value))
					.attr("width", xScale1.bandwidth())
					.attr("height", d => innerHeight - yScale(d.value))
					.attr("fill", d => barColorScale(d.key));



	}
}
module.exports = GroupedBarChart;