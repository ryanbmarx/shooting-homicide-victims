import getTribColor from './getTribColors.js';
import * as d3 from 'd3';
import filter from 'lodash.filter';
import orderBy from 'lodash.orderby';
import monthFormatter from './month-formatter.js';

function leapYear(year) {
	// returns true if supplied year is a leap year
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

function getLastDate(data, years){
	let lastYear = [];
	years.forEach(y => {
		lastYear.push(parseInt(y));
	})
	lastYear = lastYear.sort().reverse()[0];
	
	const 	l = data[lastYear].length,
			lastDate = data[lastYear][l-1];

	return new Date(lastDate['YEAR'], lastDate['MONTH'] - 1, lastDate['DAY'],0,0,0,0);
}

function monthAxis(month){
	return monthFormatter(month.getMonth());
}

class MultilineChart{
	constructor(options){
		const 	app = this;
		app.options = options;
		app.data = options.data;
		app._container = options.container;
		app.mobileLayoutBreakpoint = 600
		console.log(options);
		MultilineChart.initChart(app);


	}
	
	highlightDay(date, years, data, xScale, yScale, innerHeight, innerWidth){
		const 	app = this, 
				table = d3.select("#cumulative-table"),
				bisectDate = d3.bisector(d => {
					return new Date(d['YEAR'], (d['MONTH'] - 1), d['DAY'],0,0,0,0);
				}).right;


		// Update the date on the highlight
		const dateString = `${monthFormatter(date.getMonth(), 'ap')} ${date.getDate()}`;
		d3.select('#cumulative-label').html(dateString);
		

		// Clear the existing rows, so they can be updated.
		table.selectAll('*').remove();

		// Prime the table to accept new data points
		const 	yearsRow = table.append('thead').append('tr'),
				shootingsRow = table.append('tbody').append('tr');

		
		// For each year, in descending order, append a row with two cells to the table.
		years.sort().forEach(year => {
			
			// To avoid discrepancies in time, create a search date 
			// that is set to midnight for the desired date
			let searchDate = new Date(year, date.getMonth(), date.getDate(),0,0,0,0);

			// Account for the leap year;
			if (date.getMonth() == 1 && date.getDate() == 29 && !leapYear(year)) {
				// If Feb. 29 is the selected date and the current year is NOT a leap year, 
				// then switch to Feb. 28 so everything makes sense.
				searchDate = new Date(year, date.getMonth(), 28,0,0,0,0);
			}

			// We're going to cycle through the years, one by one, starting with the oldest.
			const tempData = orderBy(data[year], d => parseInt(d.ID));

			let i = bisectDate(tempData, searchDate) - 1,
				d = tempData[i];

			// First, add the year to the thead row, which should be two-digit format if on mobile
			if (window.innerWidth < app.mobileLayoutBreakpoint){
				// If on mobile, we want a two-digit year.
				yearsRow.append('th')
					.html(`&rsquo;${year.slice(2)}`);

			} else {
				// If not on mobile, we want a four-digit year.
				yearsRow.append('th')
					.html(year);				
			}


			// Then, add the shootings cumulative total to the tbody 
			// Test if the search date has occurred
			if (searchDate <= app.lastDate){

				// Other cell gets the cumulative shootings
				shootingsRow.append('td')
					.html(`${d3.format(',')(d['CUMULATIVE_SUM'])}`);

				// Only if we have a valid data point, move the highlight circles 
				// to where they need to be. If there isn't one, then make one.

				d3.select(`.highlight-circle--${year}`)
					// .transition()
					// .duration(100)
					.style('opacity', 1)
					.attr('cx', xScale(date))	
					.attr('cy', yScale(d['CUMULATIVE_SUM']));

			} else {
				// If the search date has not occurred in the current year then skip with a "n/a"
				d3.select(`.highlight-circle--${app.lastYear}`).style('opacity', 0);
				shootingsRow.append('td')
					.html(`n/a`);
			}
		})

		// Migrate the vertical highlight line to the mouse position
		d3.select('.highlight-line')
			.attr('x2',xScale(date))
			.attr('x1',xScale(date))
		
		// Make the table/data label visible
		d3.select('.highlight')
			.style('opacity', 1);
	}

	static initChart(app){
		
		// ----------------------------------
		// GET THE KNOW THE CONTAINER
		// ----------------------------------

		const 	data = app.data,
				container = d3.select(app._container),
				bbox = app._container.getBoundingClientRect();

				let width= bbox.width;

		const	height = bbox.height,
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
					lastIndexValue = data[year][lastIndex]["CUMULATIVE_SUM"];
			return parseInt(lastIndexValue);
		})

		
		const yScale = d3.scaleLinear()
			.domain([0, yMax])
			.nice()
			.range([innerHeight, 0]);

		const yAxisFunc = d3.axisLeft(yScale);


		// const xScale = d3.scaleTime()
		// 	.range([0,innerWidth])
		// 	.domain(d3.extent(data[useYear], d=> {
		// 		// create a domain extent out of the first year's dates
		// 		return new Date(d['YEAR'], d['MONTH'] - 1, d['DAY'],0,0,0,0);
		// 	}));



		const yearExtent = [
			new Date(useYear, 0, 1,0,0,0,0),
			new Date(useYear, 11, 31,0,0,0,0)
		]
		const xScale = d3.scaleTime()
			.range([0,innerWidth])
			.domain(yearExtent);


		const xAxisFunc = d3.axisBottom(xScale)
			.tickFormat(monthAxis);

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
			    .x(d => xScale(new Date(useYear, d['MONTH'] - 1, d['DAY'],0,0,0,0)))
			    .y(d => yScale(d['CUMULATIVE_SUM']));

			chartInner.append("path")
				.datum(data[year])
				.attr("class", `line line--${year}`)
				.attr("d", line)
				.attr('stroke', lineColor)
				.attr('stroke-width', lineWeight)
				.attr('fill', 'transparent')
				.attr('stroke-linecap', 'round');

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