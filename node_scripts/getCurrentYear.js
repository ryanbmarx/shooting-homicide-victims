'use strict'

/*
	This script takes an input csv, filters to current year, 
	sorts it with most-current victims first, then outputs it 
	to a new file.
*/

const 	fs = require('fs'),
		d3 = require('d3'),
		json2csv = require('json2csv'),
		currentYear = new Date().getFullYear(),
		sortBy = require('lodash.sortby'),
		filter = require('lodash.filter'),
		dateParser = d3.timeParse('%Y-%m-%d'),
		inputPath = process.argv[2],
		outputPath = process.argv[3];



function getCurrentYear(lastDate){
	// Takes a date string, converts it into a Date() object and then returns just the year.
	return d3.timeFormat('%Y')(dateParser(lastDate));
}



fs.readFile(inputPath, 'utf-8', (err, data) => {
	if (err) throw err;

	// Take the data file and parse the csv string into JSON.
	let currentYearVictims = filter(d3.csvParse(data), o => {
		// Do the actual slicing of the current year's data by seeking the four-digit year in the datetime string
		return o['DATE'].indexOf(currentYear) > -1 ? true : false;
	});

	// Now sort the data by date, with most current coming first.
	currentYearVictims = sortBy(currentYearVictims, o => dateParser(o['DATE'], 'asc'));

	// Since sortBy only sorts in ascending order, reverse it to put current first.
	currentYearVictims.reverse();

	// Take the nicely-filtered and nicely-sorted JSON and make it a CSV
	const 	keys = Object.keys(currentYearVictims[0]),
			csv = json2csv({
				data: currentYearVictims,
				fields: keys
			});
	
	// Write the CSV to a seperate file
	fs.writeFile(outputPath, csv, err => {
		if (err) throw err;
	});

});