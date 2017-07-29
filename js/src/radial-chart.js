import * as d3 from 'd3';
import getTribColor from './getTribColors.js';
import {areaRadial, lineRadial} from 'd3-shape';



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
				shootingsMax = d3.max(data, d => d.num_shootings),
				guideColor = getTribColor('trib-grey4');

		app.options = options;	

		console.log(options);


		// some housekeeping variable declarations
		const 	overallRadius = Math.min(innerWidth/2, innerHeight/2), // find the radius that fits in the box, in case it is not square
				minRadius = overallRadius / 3 > 150 ? overallRadius / 3 : 150,
				angleSlice = Math.PI * 2 / data.length; // this is the angle width (in radians) of each slice ... one for each minute

		// ###
		// SET SCALE
		// ###

		// The rScale is a little analogous to the yScale of a bar chart. 
		// It is the distance from the center each point will be and represents 
		// shootings in this usage.

		const rScale = d3.scaleLinear()
			.range([minRadius, overallRadius]) // TODO: adjust the min here to give space in center?
			.domain([0, shootingsMax]);

		
		const dateScale = d3.scaleTime()
			.range([0, data.length]) 
			.domain([new Date(1,1,1,0,0,0,0), new Date(1,1,1,23,59,0,0)]);

		const shootingsAxis = d3.axisLeft(rScale)
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

		chartInner.append('g')
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
			.radius(d => rScale(d.num_shootings))
			.angle((d,i) => {
				const 	dDate = new Date(d.time);
				return dateScale(dDate) * angleSlice;
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

		const guideCircles = [0, shootingsMax / 2, shootingsMax];

		guides.selectAll('.guides .guide-circle')
			.data(guideCircles)
			.enter()
			.append('circle')
			.classed('guide-circle', true)
			.style('stroke', (d,i) => i == 0 ? 'black' : guideColor)
			.style('stroke-width', (d,i) => i == 0 ? 2 : 1)
			.style('stroke-dasharray', (d,i) => i == 0 ? '0' : '5px')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', (d,i) => {
				console.log(d,i);
				return rScale(d)
			})
			.style('fill', (d,i) => i == 0 ? 'white' : 'transparent');


		// The innermost guide
		// chartInner.append('circle')
		// 	.attr('cx', 0)
		// 	.attr('cy', 0)
		// 	.attr('r', minRadius)
		// 	.style('stroke', 'black')
		// 	.style('stroke-dasharray', '5px')
		// 	.style('fill', 'white');

		// The outermost guide
		// chartInner.append('circle')
		// 	.attr('cx', 0)
		// 	.attr('cy', 0)
		// 	.attr('r', overallRadius)
		// 	.style('stroke', 'black')
		// 	.style('stroke-dasharray', '5px')
		// 	.style('fill', 'transparent');

		// append the blob
		chartInner.append('path')
			.datum(data)
			.style('fill', 'blue')
			.style('stroke', 'red')
			.style('stroke-width', 3)
			.attr('d', d => radarLine(d));
	}
}


module.exports = RadialChart;