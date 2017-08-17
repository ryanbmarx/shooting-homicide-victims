import * as d3 from 'd3';
import getTribColor from '../utils/getTribColors.js';
import {areaRadial} from 'd3-shape';
import scaleRadial from '../utils/scale-radial.js';


// Cribbed from https://bl.ocks.org/mbostock/5479367295dfe8f21002fc71d6500392

function formatXTicks(category, num){	
	if (category == 'day'){
		// This must be the days
		switch (num){
			case "0":
				return "Sun.";
				break;
			case "1":
				return "Mon.";
				break;
			case "2":
				return "Tues.";
				break;
			case "3":
				return "Wedn.";
				break;
			case "4":
				return "Thurs.";
				break;
			case "5":
				return "Fri.";
				break;
			case "6":
				return "Sat.";
				break;
		}

	} else if (category == 'month'){
		// This must be the months
		switch (num){
			case "0":
				return "J";
				break;
			case "1":
				return "F";
				break;
			case "2":
				return "M";
				break;
			case "3":
				return "A";
				break;
			case "4":
				return "M";
				break;
			case "5":
				return "J";
				break;
			case "6":
				return "J";
				break;
			case "7":
				return "A";
				break;
			case "8":
				return "S";
				break;
			case "9":
				return "O";
				break;
			case "10":
				return "N";
				break;
			case "11":
				return "D";
				break;
		}
	} else if (category == 'time'){
		console.log('time')
		// This must be the hours. We're only going to label every 6 hours
		switch(num){
			case "0":
				return "12 a.m.";
				break;			
			case "6":
				return "6 a.m.";
				break;			
			case "12":
				return "Noon";
				break;
			case "18":
				return "6 p.m.";
				break;
		}
	} else {
		// If there is no format described above, then just kick it back
		return num;	
	}

	
}

class RadialBarChart{
	constructor(options){
		// console.log(options);

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
				chartBackgroundColor = getTribColor('trib-gray4'),
				tickLength = 7;

		console.log(data);

		// some housekeeping variable declarations
		const 	outerRadius = Math.min(innerWidth, innerHeight) * 0.5, // find the radius that fits in the box, in case it is not square
				innerRadius = outerRadius / 4 > 60 ? outerRadius / 4 : 60;

		

		
		// Define our scales
		const angleSlice = 2 * Math.PI / (data.length + 1); // This is the arc, in radians, reserved for each bar, with room for the blank one added in.

		// though it's circular, this is basically a bar chart, so use the scale band.
		const x = d3.scaleBand()
		    .range([0, (2 * Math.PI) - angleSlice]) // starting angle = 0, ending angle = full circle less one unit, in radians
		    .align(0)
		    .domain(data.map(d => d['x']));

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
		
		const yLabels = svg.append('g')
			.attr('class', 'labels labels--y')
			.attr('transform', `translate(${margin.left + (innerWidth/2) }, ${margin.top + (innerHeight/2)})`);

		const xLabels = svg.append('g')
			.attr('class', 'labels labels--x')
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
					.startAngle(d => x(d['x']))
					.endAngle(d => x(d['x']) + x.bandwidth())
					.padAngle(0.01)
					.padRadius(innerRadius))
				.style('fill', getTribColor('trib-blue2', .5));


		// Create the data join to guide our application of tick labeling (circles, labels)
		const yTicks = yLabels.selectAll('.labels__circle')
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


		// the white strokes
		yTicks.append('text')
			.attr('class', 'labels__label labels__label--outline')
			.attr('transform', d => `translate(-5, ${0 - y (d)})`)
			.attr('text-anchor', 'end')
			.style('font-size', '12px')
			// .style('font-weight', 'bold')
			.style('font-family', 'Arial, sans-serif')
			.style('stroke', chartBackgroundColor)
			.style('stroke-width', 3)
			.attr('dy', '.4em')
			.text((d,i) => i > 0 ? d : "") // Skip labeling 0, the first item

		// These are the black text
		yTicks.append('text')
			.attr('class', 'labels__label labels__label--black')
			.attr('transform', d => `translate(-5, ${0 - y (d)})`)
			.attr('text-anchor', 'end')
			.style('font-size', '12px')
			// .style('font-weight', 'bold')
			.style('font-family', 'Arial, sans-serif')
			// .style('stroke', chartBackgroundColor)
			// .style('stroke-width', 3)
			.attr('dy', '.4em')
			.text((d,i) => i > 0 ? d : "") // Skip labeling 0, the first item

		const xTicks = xLabels.selectAll('.x-label')
			.data(data)
			.enter().append('g')
			.attr('class', "labels__label labels__label--time-interval")
			.attr('text-anchor', 'middle')
			.attr('transform', d => {				
				let rotation = (x(d['x']) + (x.bandwidth() / 2)) * (180 / Math.PI) - 90;
				return `rotate(${rotation})translate(${innerRadius},0)`;
			});

			xTicks.append('line')
				.attr("x2", tickLength * -1)
				.style("stroke", "#000")
				.style('stroke-width', d => {
					// If it is the time chart, then let's add 6-hour bold ticks.
					if (data.length == 24) return parseInt(d['x']) % 6 == 0 ? 3 : 1;

					// If it is any other chart, just do thin ticks.
					return 1;
				});

			xTicks.append('text')
				.text(d => formatXTicks(options.labelKey, d['x']))
				.style('font-size', '12px')
				.style('font-family', 'Arial, sans-serif')
				.attr('transform', d => {
					// let rotation = (x(d['x']) + (x.bandwidth() / 2)) * (180 / Math.PI) - 90;
					// return `rotate(${ -1 * rotation})`;
					// If the label is in the top half of the circle, then rotate it for readability purposes.
					return (x(d['x']) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,20)" : "rotate(-90)translate(0,-13)"; 
				})

	}
}

module.exports = RadialBarChart;