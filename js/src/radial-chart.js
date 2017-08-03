import * as d3 from 'd3';
import getTribColor from './getTribColors.js';
import {areaRadial} from 'd3-shape';



//http://vizuly.io/product/corona/?demo=d3js

// http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
// https://www.visualcinnamon.com/2015/10/different-look-d3-radar-chart.html

class RadialChart{
	constructor(options){
		const 	app = this,
				container = d3.select(options.container),
				bbox = container.node().getBoundingClientRect(), 
				height = bbox.height,
				width = bbox.width,
				margin = options.innerMargins,
				innerHeight = height - margin.top - margin.bottom,
				innerWidth = width - margin.right - margin.left,
				data = options.data,
				shootingsMax = d3.max(data, d => d.y),
				guideColor = getTribColor('trib-grey4'),
				pi = Math.PI;

		app.options = options;	

		// console.log(options);


		// some housekeeping variable declarations
		const 	overallRadius = Math.min(innerWidth/2, innerHeight/2), // find the radius that fits in the box, in case it is not square
				minRadius = overallRadius / 4 > 75 ? overallRadius / 4 : 75,
				angleSlice = Math.PI * 2 / data.length; // this is the angle width (in radians) of each slice ... one for each minute

		// ###
		// SET SCALE
		// ###

		// The y is a little analogous to the yScale of a bar chart. 
		// It is the distance from the center each point will be and represents 
		// shootings in this usage.

		const y = d3.scaleLinear()
			.range([minRadius, overallRadius]) // TODO: adjust the min here to give space in center?
			.domain([0, shootingsMax]);

		const x = d3.scaleTime()
			.range([0, data.length]) 
			.domain([new Date(1,1,1,0,0,0,0), new Date(1,1,1,23,59,0,0)]);

		const shootingsAxis = d3.axisLeft(y)
			.ticks(4);

		// Define a scale to choose color. This will let us have a dynamic number of blobs.
		const colorPicker = d3.scaleOrdinal().range(getTribColor('trib-blue2'));

		// ###
		// START MESSING WITH THE SVG
		// ###

		const svg = container.append('svg')
			.attr('width', width)
			.attr('height', height);

		// Create the chart inner <g> and make it absolutely centered in the intended 
		// display space (i.e. respect the defined margins)
		
		const chartInner = svg.append('g')
			.classed('chart-inner', true)
			.attr('transform', `translate(${margin.left + (innerWidth / 2)}, ${margin.top + (innerHeight / 2)})`);

		const guides = svg.append('g')
			.classed('guides', true)
			.attr('transform', `translate(${margin.left + (innerWidth / 2)}, ${margin.top + (innerHeight / 2)})`);

		svg.append('g')
			.attr('class', 'axis')
			.attr('transform', `translate(0,${innerHeight / -2})`)
			.call(shootingsAxis);

		// ###
		// DRAW THE GRID
		// ###

		//  TK

		// ###
		// DRAW THE AXES
		// ###

		//  TK?

		// ###
		// DRAW THE BLOB(S)
		// ###

		// The radial line generator
		const radarLine = areaRadial()
			.radius(d => y(d.y))
			.angle(d => {
				const 	dDate = new Date(d.x);
				return x(dDate) * angleSlice;
			})
			.curve(d3.curveCardinalClosed); // this smooths out the angles


		

		guides.append('line')
			.attr('x1', 0).attr('y1', innerHeight / -2)
			.attr('x2', 0).attr('y2', innerHeight / 2)
			.style('stroke', guideColor)
			.style('stroke-dasharray', '5px')
			.style('fill', 'transparent');

		guides.append('line')
			.attr('x1', innerWidth / -2).attr('y1', 0)
			.attr('x2', innerWidth / 2).attr('y2', 0)
			.style('stroke', guideColor)
			.style('stroke-dasharray', '5px')
			.style('fill', 'transparent');

		const guideCircles = y.ticks(5);

		guides.selectAll('.guide-circle')
			.data(guideCircles)
			.enter()
				.append('circle')
				.classed('guide-circle', true)
				.style('stroke', (d,i) => i == 0 ? 'black' : guideColor)
				.style('stroke-width', (d,i) => i == 0 ? 2 : 1)
				.style('stroke-dasharray', (d,i) => i == 0 ? '0' : '5px')
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', (d,i) => y(d))
				.style('fill', (d,i) => i == 0 ? 'white' : 'transparent');




		guides.selectAll('.guide-label--white')
			.data(guideCircles)
			.enter()
				.append('text')
				.attr('class', 'guide-label guide-label--white')
				.attr('transform', d => `translate(5, ${0 - y (d)})`)
				.style('font-size', '13px')
				.style('font-weight', 'bold')
				.style('font-family', 'Arial, sans-serif')
				.style('stroke', 'white')
				.style('stroke-width', 6)
				.attr('dy', '.4em')
				.text((d,i) => i > 0 ? d : "") // Skip labeling 0, the first item
				.each(function(d,i){
					let text = "";
					if (i > 0) text = d;  // Skip labeling 0, the first item
					guides.append('text')
						.attr('class', 'guide-label guide-label--black')
						.attr('transform', `translate(5, ${0 - y(d)})`)
						.style('font-size', '13px')
						.style('font-weight', 'bold')
						.style('font-family', 'Arial, sans-serif')
						.attr('dy', '.3em')
						.text(text);
				});



		// append the blob
		chartInner.append('path')
			.datum(data)
			.attr('fill', function(d, i){
				return '#ff00ff';
			})
			.attr('fill-opacity', 1)
			.attr('d', d => radarLine(d));

		chartInner.append('path')
			.datum(data)
			.style('stroke', 'red')
			.style('stroke-width', 3)
			.attr('d', d => radarLine(d));

		/*
		const x = d3.scaleTime()
			.range([0, data.length]) 
			.domain([new Date(1,1,1,0,0,0,0), new Date(1,1,1,23,59,0,0)]);

		*/

		const divisions = 4;

		const labels = svg.append('g')
			.classed('x-labels', true)
			.attr('transform', `translate(${margin.left + (innerWidth / 2)}, ${margin.top + (innerHeight / 2)})rotate(-90)`)
			.selectAll('g')
			.data(data)
			.enter()
			.append('g')
			.attr('text-anchor', 'middle')
			.attr('transform', (d,i) => {
				console.log(angleSlice, d.x, x(d.x), x(d.x) * angleSlice);
				return `rotate(${ (360 / 24 * i) }) translate(${minRadius - 25},0)`;
				// return `rotate(${ x(d.x) * angleSlice })translate(${minRadius},0)`;
			});

		labels.append('text')
			.attr("transform", (d,i) => { 
				return `rotate(${ (360 / -24 * i) + 90 })`;
			})
			.attr('dy', '0.25em')
			.style('font-size', '13px')
			.style('font-weight', 'bold')
			.style('font-family', 'Arial, sans-serif')
			.text(d => {
				const timeLabel = new Date(d.x).getHours();
				return timeLabel == 0 || timeLabel % 6 == 0 ? d3.timeFormat('%-I %p')(d.x) : "" ;
			})
		


	}
}


module.exports = RadialChart;