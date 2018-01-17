'use strict'

/*
	This script outputs a small HTML partial for the shootings and homicides template. It pulls the current cumulative
	total and last year's total for the same date. It's all dependent on the dates in the data, so it should
	adapt just fine as we cross into 2018. The resulting HTML is minified because why not?

*/


function leapYear(year) {
	// returns true if supplied year is a leap year
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}


const 	fs = require('fs'),
		d3 = require('d3'),
		find = require('lodash.find'),
		minify = require('html-minifier').minify,
		sortBy = require('lodash.sortby'),
		orderBy = require('lodash.orderby'),
		filter = require('lodash.filter'),
		dateParser = d3.timeParse('%Y-%m-%d'),
		outputPath = process.argv[2],
		type = outputPath.indexOf('homicides') > -1 ? "homicides" : "shootings",
		numberFormatter = d3.format(',');

fs.readFile(`./data/${ type }/${ type }.csv`, 'utf-8', (err, data) => {
	if (err) throw err;
	
	const 	incidents = orderBy(d3.csvParse(data), o => parseInt(o.ID)),
			mostCurrentEntry = incidents[incidents.length - 1], // This is the last/most current entry
			mostCurrentDate = new Date(`${mostCurrentEntry['YEAR']}-${mostCurrentEntry['MONTH']}-${mostCurrentEntry['DAY']}`),
			thisYear = mostCurrentEntry['YEAR'],
			lastYear = thisYear - 1,
			searchDate = new Date(`${lastYear}-${mostCurrentEntry['MONTH']}-${mostCurrentEntry['DAY']}`),
			bisectDate = d3.bisector(d => {
				return new Date(`${d['YEAR']}-${d['MONTH']}-${d['DAY']}`);
			}).right;
			

	let lastYearIncidents = filter(incidents, o => o['YEAR'] == lastYear);
	// lastYearIncidents = orderBy(lastYearIncidents, o => parseInt(o.ID));


	if (mostCurrentDate.getMonth() == 1 && mostCurrentDate.getDate() == 29 && !leapYear(mostCurrentDate.getFullYear())) {
		// If Feb. 29 is the selected date and the current year is NOT a leap year, 
		// then switch to Feb. 28 so everything makes sense.
		searchDate = new Date(year, date.getMonth(), 28,0,0,0,0);
	}

	let i = bisectDate(lastYearIncidents, searchDate) - 1,
		lastYearEntry = lastYearIncidents[i];

	const 	thisYearSum = parseInt(mostCurrentEntry['CUMULATIVE_SUM']),
			lastYearSum = parseInt(lastYearEntry['CUMULATIVE_SUM']);

	let lessMore;
	if (thisYearSum > lastYearSum){
		lessMore = `${numberFormatter(Math.abs(thisYearSum - lastYearSum))} more than`;
	} else if (thisYearSum < lastYearSum ){
		lessMore = `${numberFormatter(Math.abs(thisYearSum - lastYearSum))} fewer than`;
	} else {
		lessMore = "the same as";
	}



	const 	verb = type == 'homicides' ? 'killed' : 'shot',
			htmlString = minify(`<h2 class='title__headline'>In Chicago, <strong class='title__current-year'>${numberFormatter(thisYearSum)} people</strong> have been ${verb} this year. That is <strong class='title__last-year'>${lessMore}</strong> ${ lastYear }.</h2>
			<p class='title__subtitle'>Data through ${ d3.timeFormat('%A, %B %-d')(mostCurrentDate) }</p>`, {
			collapseWhitespace:true,
			collapseInlineTagWhitespace:false
		});

	fs.writeFile(outputPath, htmlString, err =>{
		if (err) throw err;
	})
})