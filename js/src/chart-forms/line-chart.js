import * as d3 from 'd3';


class LineChart{
	constructor(options){
		const app = this;
		app.options = options;
		app._container = options.container
		app.meta = options.meta;

		app.initChart(options.dataset);
	}

	initChart(data){
		let app = this;

		// ----------------------------------
		// GET THE KNOW THE CONTAINER
		// ----------------------------------

		const 	container = d3.select(app._container),
				bbox = 	app._container.getBoundingClientRect(), 
				height=bbox.height,
				width=bbox.width,
				margin = app.options.innerMargins,
				innerHeight = height - margin.top - margin.bottom,
				innerWidth = width - margin.right - margin.left,
				y = app.options.yAttribute, 
				x = app.options.xAttribute;

		console.log(data)
		// ----------------------------------
		// MAKE SCALES
		// ----------------------------------

		// If the user has defined min or max values for the x range, such as starting at zero,
		// then use those values. Otherwise, find them.
		const 	yMax = app.options.maxYValue ? app.options.maxYValue : d3.max(data, d => parseFloat(d[y])),
				yMin = app.options.minYValue ? parseFloat(app.options.minYValue) : d3.min(data, d => parseFloat(d[y]));

		//Scale functions
		//This is the y scale used to size and position the bars
		const yScale = d3.scaleLinear()
			.domain([yMin, yMax])
			.nice()
			.range([innerHeight, 0]);


		// If the user has defined min or max values for the x range, such as starting at zero,
		// then use those values. Otherwise, find them.
		const 	xMax = app.options.maxXValue ? parseFloat(app.options.maxXValue) : d3.max(data, d => parseFloat(d[x])),
				xMin = app.options.minXValue ? parseFloat(app.options.minXValue) : d3.min(data, d => parseFloat(d[x]));

		// Make the x scale
		const xScale = d3.scaleLinear()
			.domain([xMin, xMax])
			.nice()
			.range([0, innerWidth]);

		// ----------------------------------
		// MAKE LINE GENERATOR(S)
		// ----------------------------------

		// This is the line generator, used to make the d attribute for the <path>
		app.line = d3.line()
		    .x(d => xScale(d[x]))
		    .y(d => yScale(d[y]));

		// If user has selected a curvy line, then make it curvy.
		if (app.options.curvyLine) app.line.curve(d3.curveBasisOpen)

		console.log(xMax, xMin, yMax, yMin);

		if(app.options.filled) {
			// STILL TK: Make an area generator to place under the line for a filled line chart
			console.log('User chose dowwwwwwn ... i mean fiiiilllled.')

			// if (app.options.curvyLine) app.area.curve(d3.curveBasisOpen)
		}

		// ----------------------------------
		// START MESSING WITH SVGs
		// ----------------------------------

		//Inserts svg and sizes it
		const svg = container
            .append("svg")
            .attr("width", width)
            .attr("height", height);

		const chartInner = svg.append('g')
			.classed('chartInner', true)
			.attr("width",innerWidth)
			.attr("height",innerHeight)
			.attr(`transform`,`translate(${margin.left},${margin.top})`);

		// ----------------------------------
		// APPEND <g> ELEMENTS FOR SCALES 
		// ----------------------------------

		if (app.options.showYAxis){
			// Define the y axis and add a tick formatter if a format string is define in the options.
			const yAxis = d3.axisLeft(yScale);

			// If the user has defined a # format string
			if (app.options.formatStrings.yAxis){
				const yFormatter = d3.format(app.options.formatStrings.yAxis);
				yAxis.tickFormat(yFormatter)
			}
			// If the user has defined the desired # ticks ...
			if (app.options.ticks.yAxis){
				yAxis.ticks(app.options.ticks.yAxis);
			}
		   svg.append('g')
				.attr("class", "y axis")
				.attr(`transform`,`translate(${margin.left},${margin.top})`)
				.call(yAxis);
		}
		
		if (app.options.showXAxis){
			// Create an x axis if the option requires it

			// Define the x axis 
			const xAxis = d3.axisBottom(xScale);

			// ... add a tick formatter if a format string is define in the options.
			if (app.options.formatStrings.xAxis){
				const xFormatter = d3.format(app.options.formatStrings.xAxis);
				xAxis.tickFormat(xFormatter);
			}

			// If the user has defined the desired # ticks ...
			if (app.options.ticks.xAxis){
				console.log('choosing tic', app.options.ticks.xAxis);
				xAxis.ticks(app.options.ticks.xAxis);	
			}
			// Now, append the axis elements to the SVG
		   svg.append('g')
				.attr("class", "x axis")
				.attr(`transform`,`translate(${ margin.left },${ margin.top + innerHeight })`)
				.transition()
					.duration(app.options.transitionTime)
					.call(xAxis);
		}

		if (app.options.filled) {
			// https://riccardoscalco.github.io/textures/
			// This is the filled area
			// var t = textures.lines()
			// 	.size(5)
			// 	.strokeWidth(3)
			// 	.background(app.barColor)
			// 	.stroke(getTribColor('trib_blue3'));

			// svg.call(t);

			const area = d3.area()
				// .curve(d3.curveBasis)
			    .y0(innerHeight)
			    .x(d => xScale(d.x))
			    .y1(d => yScaleDisplay(d.y));

			chartInner.append("path")
			      .datum(data)
			      .attr("class", "area")
			      .attr("d", area)
			      .style('fill', app.options.areaFillColor)
		}

		// Line comes after area  so it lays on top.
		chartInner.append("path")
		      .datum(data)
		      .attr("class", "line")
		      .attr("d", app.line)
		      .style('stroke', app.options.strokeColor)
		      .style('stroke-width', app.options.strokeWidth)
		      .style('fill', 'transparent');
		
		// ----------------------------------
		// ADD THE META LABELING
		// ----------------------------------
		
		if (app.meta){
			// Add the <g> for the labeling, and hang some base styles on it.
			// Only text attr/style that differs from this needs to be applied.
			const labels = svg.append('g')
				.classed('chart-labels', true)
				.style('font-family','Arial, sans-serif')
				.style('font-size','13px')
				.style('font-weight','bold')
				.style('margin','0 0 0 0')
				.style('line-height', '1.3em')
				.attr('text-anchor', 'middle')
				.attr('dy', '1em');

			if (app.meta.headline){
				labels.append('text')
					.classed('chart-labels__headline', true)
					.text(`${app.meta.headline}`)
					.style('font-size','19px')
					.attr('x', 0)
					.attr('y', 0)
					.attr('text-anchor', 'start');
			}
			if (app.meta.xAxisLabel){
				labels.append('text')
					.classed('chart-labels__xAxisLabel', true)
					.text(`${app.meta.xAxisLabel}`)
					.attr('x', margin.left + (innerWidth / 2))
					.attr('y', height)
					.attr('dy', '-.3em');
					
			}
			if (app.meta.yAxisLabel){
				labels.append('text')
					.classed('chart-labels__yAxisLabel', true)
					.text(`${app.meta.yAxisLabel}`)
					.attr('x', 0)
					.attr('y', margin.top + (innerHeight / 2))
					.attr('transform', `rotate(-90, 0, ${margin.top + (innerHeight / 2)})`)
									.attr('dy', '1em');
			}

			if (app.meta.sources){
				container.append('p')
					.classed('chart-labels__source', true)
					.style('font-weight','normal')
					.text(`${app.meta.sources}`);
			}

			if(app.meta.credit){
				container.append('p')
					.classed('chart-labels__credit', true)
					.text(`${app.meta.credit}`)
					.style('font-family','Arial, sans-serif')
					.style('font-size','13px')
					.style('margin','7px 0 0 0')
					.style('line-height', '1.3em');
			}
		}

     }
}


module.exports = LineChart;