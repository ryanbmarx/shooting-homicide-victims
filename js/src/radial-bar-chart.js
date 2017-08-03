import * as d3 from 'd3';
import getTribColor from './getTribColors.js';
import {areaRadial} from 'd3-shape';
import scaleRadial from './scale-radial.js';


// Cribbed from https://bl.ocks.org/mbostock/5479367295dfe8f21002fc71d6500392

class RadialBarChart{
	constructor(options){
		console.log(options);

		// options.data.unshift({ x: "-1", y:0 }); // We need space for labels. Add a blank data element to beginning

		const 	app = this,
				container = d3.select(options.container),
				bbox = container.node().getBoundingClientRect(), 
				height = bbox.height,
				width = bbox.width,
				margin = options.innerMargins,
				innerHeight = height - margin.top - margin.bottom,
				innerWidth = width - margin.right - margin.left,
				data = options.data,
				yMax = d3.max(data, d => d.y),
				guideColor = getTribColor('trib-grey2'),
				chartBackgroundColor = getTribColor('trib-gray4');

		// some housekeeping variable declarations
		const 	outerRadius = Math.min(innerWidth, innerHeight) * 0.5, // find the radius that fits in the box, in case it is not square
				innerRadius = outerRadius / 4 > 75 ? outerRadius / 4 : 75;

		

		
		// Define our scales
		const angleSlice = 2 * Math.PI / data.length;


		console.log(angleSlice);
		// though it's circular, this is basically a bar chart, so use the scale band.
		const x = d3.scaleBand()
		    .range([0, (2 * Math.PI) - angleSlice]) // starting angle = 0, ending angle = full circle less one unit, in radians
		    .align(0)
		    .domain(data.map(d => d.x));

		// Scale radial is a custom function by Bostock. See file for link to gist.
		const y = scaleRadial()
		    .range([innerRadius, outerRadius])
		    .domain([0, yMax]);


		// ###
		// START MESSING WITH THE SVG
		// ###

		const svg = container.append('svg')
			.attr('width', width)
			.attr('height', height);
		
		const labels = svg.append('g')
			.classed('labels', true)
			.attr('transform', `translate(${margin.left + (innerWidth/2) }, ${margin.top + (innerHeight/2)})`);

		const chartInner = svg.append('g')
			.classed('chart-inner', true)
			.attr('transform', `translate(${margin.left + (innerWidth/2) }, ${margin.top + (innerHeight/2)})`);

		chartInner.selectAll('.time-unit')
			.data(data)
			.enter()
			.append('path')
				.classed('time-unit', true)
				.attr('d', d3.arc()
					.innerRadius(d => y(0))
					.outerRadius(d => y(d.y))
					.startAngle(d => x(d.x))
					.endAngle(d => x(d.x) + x.bandwidth())
					.padAngle(0.01)
					.padRadius(innerRadius))
				.style('fill', getTribColor('trib-blue2', .5));


		// Create the data join to guide our application of tick labeling (circles, labels)
		const yTicks = labels.selectAll('.labels__circle')
			.data(y.ticks(4))
			.enter();

		// Create the circles
		yTicks.append('circle')
			.classed('labels__circle', true)
			.style('stroke', (d,i) => i == 0 ? 'black' : guideColor)
			.style('stroke-width', (d,i) => i == 0 ? 2 : 1)
			.style('stroke-dasharray', (d,i) => i == 0 ? '0' : '5px')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', (d,i) => y(d))
			.style('fill', (d,i) => i == 0 ? 'white' : 'transparent');

		yTicks.append('text')
			.attr('class', 'labels__label')
			.attr('transform', d => `translate(-5, ${0 - y (d)})`)
			.attr('text-anchor', 'end')
			.style('font-size', '12px')
			// .style('font-weight', 'bold')
			.style('font-family', 'Arial, sans-serif')
			// .style('stroke', chartBackgroundColor)
			// .style('stroke-width', 3)
			.attr('dy', '.4em')
			.text((d,i) => i > 0 ? d : "") // Skip labeling 0, the first item

	}
}





module.exports = RadialBarChart;