import * as d3 from 'd3';
import scaleRadial from '../utils/scale-radial.js';
import getTextColor from '../utils/get-text-color.js';

class PieChart{
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
				x = options.xKey,
				y = options.yKey;

		// Some geometric variables to use.
		const 	outerRadius = Math.min(innerWidth, innerHeight) * 0.5, // find the radius that fits in the box, in case it is not square
				innerRadius = !options.donutWidth ? 0 : outerRadius - parseInt(options.donutWidth), // If we want a donut shape, set an inner radius, too.
				angleSlice = 2 * Math.PI / (data.length + 1); // This is the arc, in radians, reserved for each bar, with room for the blank one added in.;
		

		

		const colors = d3.scaleOrdinal()
			.range([
				"#004E87",
				"#7493C1",
				"#CBDDED"
			])
			.domain(d3.map(data, d => d[x]));

		
		// This is the pie generator. 
		const pie = d3.pie()
		    .value(d => d[y])
		    .padAngle(options.sliceSpacing);

		const pieMaker = d3.arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius);

		const pieLabel = d3.arc()
			.innerRadius(innerRadius)
			.outerRadius((outerRadius - innerRadius / 2))

		// ###
		// START MESSING WITH THE SVG
		// ###

		// We need an coordinates origin (0,0) in the center, instead of the top left.
		// This is why we translate like we do below.

		const svg = container.append('svg')
			.attr('width', width)
			.attr('height', height);
		

		const chartInner = svg.append('g')
			.classed('chart-inner', true)
			.attr('transform', `translate(${margin.left + (innerWidth/2) }, ${margin.top + (innerHeight/2)})`);
	

		const slices = chartInner.selectAll('.pie-slice')
			.data(pie(data))
			.enter();

		slices
			.append('path')
			.classed('pie-slice', true)
			.attr('d', 	pieMaker)
			.style('fill', d => colors(d['data'][x]));

		slices
			.append('text')
			.attr("transform", function(d) { return "translate(" + pieMaker.centroid(d) + ")"; })
			.text(d => d['data'][y])
			.attr('text-anchor', 'middle')
			.attr('dy', '0.35em')
			.style('fill', d => getTextColor(colors(d['data'][x]), true))
			.style('font-family','Arial, sans-serif')
			.style('font-size','13px')
			.style('font-weight', 'bold')

		chartInner.append('circle')
			.style('stroke', 'black')
			.style('stroke-width', 2)
			.style('fill', 'transparent')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', innerRadius)

		const pieLegend = d3.select(options.container)
			.append('dl')
			.attr('class', 'legend legend--centered');

		data.forEach(cat => {
			pieLegend
				.append('dt')
				.html(`<span style='background-color:${colors(cat[x])}'></span>`);

			pieLegend.append('dd')
				.html(`${ cat[x] }`);
		});
			
	}
}

module.exports = PieChart;