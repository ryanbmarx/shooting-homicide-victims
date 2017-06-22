import getTribColor from './getTribColors.js';
import * as d3 from 'd3';
import filter from 'lodash.filter';
import orderBy from 'lodash.orderby';

function getLastDate(data, years){
	let lastYear = [];
	years.forEach(y => {
		lastYear.push(parseInt(y));
	})
	lastYear = lastYear.sort().reverse()[0];

	const 	l = data[lastYear].length,
			lastDate = data[lastYear][l-1];

	return new Date(lastDate['Year'], lastDate['Month'] - 1, lastDate['Day'],0,0,0,0);
}

class MultilineChart{
	constructor(options){
		const 	app = this;
		app.options = options;
		app.data = options.data;
		app._container = options.container;

		MultilineChart.initChart(app);
	}
	
	highlightDay(date, years, data, xScale, yScale, innerHeight, innerWidth){
		const 	app = this, 
				table = d3.select("#ytd-highlight-table"),
				bisectDate = d3.bisector(d => {
					return new Date(d.Year, (d.Month - 1), d.Day,0,0,0,0);
				}).right;


		// Update the date on the highlight
		d3.select('#ytd .ytd-highlight__label').html(d3.timeFormat('%B %-d')(date));
		

		// Clear the existing rows, so they can be updated.
		table.selectAll('*').remove();
		
		// For each year, in descending order, append a row with two cells to the table.
		years.sort().reverse().forEach(year => {
			const 	row = table.append('tr'),
					searchDate = new Date(year, date.getMonth(), date.getDate(),0,0,0,0);

			const tempData = orderBy(data[year], d => parseInt(d.ID));
			let i = bisectDate(tempData, searchDate) - 1,
				d = tempData[i];


			// First cell gets the year
			row.append('td')
				.html(year);

			if (searchDate <= app.lastDate){
				// Other cell gets the cumulative shootings
				row.append('td')
					.html(`${d3.format(',')(d.cum_sum)}`);

				// Only if we have a valid data point, move the highlight circles 
				// to where they need to be. If there isn't one, then make one.

				d3.select(`.highlight-circle--${year}`)
					// .transition()
					// .duration(100)
					.style('opacity', 1)
					.attr('cx', xScale(date))	
					.attr('cy', yScale(d.cum_sum));

			} else {
				// This cumulative date is 
				d3.select(`.highlight-circle--${app.lastYear}`).style('opacity', 0);
				row.append('td')
					.html(`n/a`);
			}
		})


		d3.select('.highlight-line')
			// .transition()
			// .duration(100)
			.attr('x2',xScale(date))
			.attr('x1',xScale(date))
		
		d3.select('.ytd-highlight')
			// .transition()
			// .duration(100)
			.style('opacity', 1);
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
				innerWidth = width - margin.right - margin.left,
				years = Object.keys(data),
				useYear = years[0]; // The arbitrary year used to feed the xScale a full Date()
				
				// These dates will help handle missing data from days yet to pass. 
				// For practical purposes, these can be considered the "current" dates. 
				// I'm plucking the date from the data so it:
				// 
				// 1) Will work even if the app goes months without a data update
				// 2) Will still work in 2018 without any code updates. (fingers crossed)

				app.lastDate = getLastDate(app.data, years);
				app.lastYear = app.lastDate.getFullYear();
		

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

		const chartHighlights = svg
			.append('g')
			.classed('chart-highlights', true)
			.attr('width', innerWidth)
			.attr('height', innerHeight)
			.attr('transform', `translate(${margin.left}, ${margin.top})`);

		// This vertical line will accent the point in time the user is hovering.
		chartHighlights.append('line')
			.classed('highlight-line', true)
			.attr('stroke', 'black')
			.attr('stroke-width', 2)
			.attr('x1', width + 10)
			.attr('x2', width + 10)
			.attr('y1', 0)
			.attr('y2', innerHeight);

		// This path will connect the vertical highlight line to the highlight box
		chartHighlights.append('path')
			.classed('highlight-path', true)
			.attr('stroke', 'black')
			.attr('stroke-width', 2);


		// ----------------------------------
		// MAKE SOME SCALES
		// ----------------------------------
		const yMax = d3.max(years, year => {
			// For each year in the data object, pluck the last entry and find the largest such entry.
			const 	lastIndex = data[year].length - 1,
					lastIndexValue = data[year][lastIndex]["cum_sum"];
			return parseInt(lastIndexValue);
		})

		
		const yScale = d3.scaleLinear()
			.domain([0, yMax])
			.nice()
			.range([innerHeight, 0]);

		const yAxisFunc = d3.axisLeft(yScale);


		const xScale = d3.scaleTime()
			.range([0,innerWidth])
			.domain(d3.extent(data[useYear], d=> {
				// create a domain extent out of the first year's dates
				return new Date(d.Year, d.Month - 1, d.Day,0,0,0,0);
			}));


		const xAxisFunc = d3.axisBottom(xScale);

		// ----------------------------------
		// APPEND AXES
		// ----------------------------------

		const yAxis = svg
			.append('g')
			.attr('class', 'y axis')
			.attr('transform', `translate(${margin.left}, ${margin.top})`)
			.call(yAxisFunc);


		const xAxis = svg
			.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(${margin.left}, ${margin.top + innerHeight})`)
			.call(xAxisFunc);

		years.forEach(year => {
			const 	lineColor = year == app.lastYear ? app.options.currentColor : app.options.otherColor,
					lineWeight = year == app.lastYear ? 4 : 2;

			const line = d3.line()
				.curve(d3.curveBasisOpen)
			    .x(d => xScale(new Date(useYear, d.Month - 1, d.Day,0,0,0,0)))
			    .y(d => yScale(d.cum_sum));

			chartInner.append("path")
				.datum(data[year])
				.attr("class", `line line--${year}`)
				.attr("d", line)
				.attr('stroke', lineColor)
				.attr('stroke-width', lineWeight)
				.attr('fill', 'transparent');

			// Append a highlight circle for each year
			if (year == app.lastYear){
				// The circle for current year needs a little special style.
				chartHighlights.append('circle')
					.classed(`highlight-circle--${year}`, true)
					.classed(`highlight-circle`, true)
					.attr('cx', width + 10)	
					.attr('cy', innerHeight)
					.attr('r', 6)
					.attr('fill', 'white')
					.attr('stroke', 'black')
					.attr('stroke-width', 3);

			} else {
				chartHighlights.append('circle')
					.classed(`highlight-circle--${year}`, true)
					.classed(`highlight-circle`, true)
					.attr('cx', width + 10)	
					.attr('cy', innerHeight)
					.attr('r', 5)
					.attr('fill', 'black');
				}
		});

		chartInner.append('rect')
			.attr('height', innerHeight)
			.attr('width', innerWidth)
			.attr('fill', 'transparent')
			.on('mousemove', function(){
				const 	date = xScale.invert(d3.mouse(this)[0]);
				app.highlightDay(date, years, data, xScale, yScale, innerHeight, innerWidth);
	    	});

		app.highlightDay(app.lastDate, years, data, xScale, yScale, innerHeight, innerWidth);
			
	}
}

module.exports = MultilineChart;