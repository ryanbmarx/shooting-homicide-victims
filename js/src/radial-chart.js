import * as d3 from 'd3';
import getTribColor from './getTribColors.js';
import {areaRadial, lineRadial} from 'd3-shape';

/*

  // console.log('loaded');

  // csv('data/geocodes-test.csv', (err, data) => {
  //   if (err) throw err;

  //     const minutesData = countBy(data, d => {
  //       const shootDate = new Date(1, 1, 1, d.Hour, 0, 0, 0);
  //       return shootDate;
  //     });

  //     // We want the data to be an array of objects, so let's transform a little more.
  //     let newMinutesData = [];

  //     Object.keys(minutesData).forEach(key => {
  //       newMinutesData.push({
  //         time: key,
  //         num_shootings: minutesData[key]
  //       })
  //     })

  //     const radial = new RadialChart({
  //       container: document.querySelector('#radial'),
  //       data: newMinutesData,
  //       innerMargins:{top:10,right:10,bottom:10,left:10},
  //     });

  // });
*/


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
				shootingsMax = d3.max(data, d => d.num_shootings);

		app.options = options;	

		console.log(options);


		// some housekeeping variable declarations
		const 	overallRadius = Math.min(innerWidth/2, innerHeight/2), // find the radius that fits in the box, in case it is not square
				angleSlice = Math.PI * 2 / (24 * 60); // this is the angle width (in radians) of each slice ... one for each minute

		// ###
		// SET SCALE
		// ###

		// The rScale is a little analogous to the yScale of a bar chart. 
		// It is the distance from the center each point will be and represents 
		// shootings in this usage.

		const rScale = d3.scaleLinear()
			.range([50, overallRadius]) // TODO: adjust the min here to give space in center?
			.domain([0, shootingsMax]);

		
		const dateScale = d3.scaleTime()
			.range([0, 24*60]) 
			.domain([new Date(1,1,1,0,0,0,0), new Date(1,1,1,23,59,0,0)]);



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
			// .attr('width', innerWidth)
			// .attr('height', innerHeight)
			.attr('transform', `translate(${margin.left + (innerWidth / 2)}, ${margin.top + (innerHeight / 2)})`);


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
			//         const shootDate = new Date(1, 1, 1, d.Hour, d.Minute, 0, 0);
				const 	dDate = new Date(d.time);
				return dateScale(dDate) * angleSlice;
			})
			.curve(d3.curveCardinalClosed); // this smooths out the angles

		// append the blob

		chartInner.append('path')
			.datum(data)
			.attr('d', d => radarLine(d))
			.style("fill", "blue")
			.style('stroke', 'red');
	}
}


module.exports = RadialChart;