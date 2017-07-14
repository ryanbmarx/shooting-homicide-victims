'use strict'

/*
	This script takes the victims data and slices off only the victims from the current year.

	TODO: Make this output a CSV
*/

const 	fs = require('fs'),
		d3 = require('d3'),
		dateParser = d3.timeParse('%Y-%m-%d'),
		sortBy = require('lodash.sortby'),
		filter = require('lodash.filter');



function getCurrentYear(lastDate){
	// Takes a date string, converts it into a Date() object and then returns just the year.
	return d3.timeFormat('%Y')(dateParser(lastDate));
}



fs.readFile('data/raw-victims.csv', 'utf-8', (err, data) => {
	if (err) throw err;
	const 	victims = sortBy(d3.csvParse(data), o => dateParser(o.DATE)),
			currentYear = getCurrentYear(victims[victims.length-1]['DATE']),
			currentYearVictims = filter(victims, o => {
				// Do the actual slicing of the current year's data
				return o['DATE'].indexOf(currentYear) > -1 ? true : false;
			});

	// Write the json to a seperate file
	fs.writeFile('data/current-year-victims.json', JSON.stringify(currentYearVictims), err => {
		if (err) throw err;
	})

})