const 	fs = require('fs'),
		uniqBy = require('lodash.uniqby'),
		d3 = require('d3'),
		orderBy = require('lodash.orderBy'),
		// filter = require('lodash.filter'),
		minify = require('html-minifier').minify,
		// dateTimeParser = d3.timeParse('%Y-%m-%d %H:%M:%S'),
		// dateFormatter = d3.timeFormat('%b %e'), // For when we don't know time
		// dateTimeFormatter = d3.timeFormat('%-I:%M %p, %b %e'), // For when we know time.
		inputPath = process.argv[2],
		outputPath = process.argv[3];

function getButtonString(category, victimsArray){
	// From an array of victim objects (representing the unique values of the object 
	// attribute <category>), create an html string to be filter buttons in our app.

	let retval="";

	orderBy(victimsArray, v => v[category] == "" ? "Unknown" : v[category]).forEach(v => {
		let label = v[category] == "" ? "Unknown" : v[category];
		retval += `<button class='filter-button' data-checked=true data-cat='${category.toLowerCase()}' data-cat-value='${label.toLowerCase()}'>${label.toLowerCase()}</button>`;
	})

	return retval;
}

fs.readFile(inputPath, 'utf-8', (err, data) => {

	// Turn our data into JSON
	const victimsData = d3.csvParse(data);

	// Create te empty object wto hold our button HTML strings
	let buttons = {};

	// This is the array of attributes for which we want buttons
	const attributes = ['RACE', 'PUB_CAUSE', 'SEX'];

	attributes.forEach(att => {

		// For each att, filter the victims data down to an array of uniques
		const tempArray = uniqBy(victimsData, v => v[att]);
		
		// stash the acrtual strings into our object
		buttons[att] = getButtonString(att, tempArray);
	})

	let filtersHTML = "<div class='filters'>";

	// Put our buttons into some HTML architecture 
	attributes.forEach(att => {
		let filterGroup = `<div class='filters__group filters__group--${att.toLowerCase()}'>`;
		filterGroup += buttons[att];
		filterGroup += `</div>`;

		filtersHTML += filterGroup;
	})

	filtersHTML += "</div>";


	filtersHTML = minify(filtersHTML, {
		collapseWhitespace:true,
		collapseInlineTagWhitespace:true
	});

	
	// Write the string to a seperate file
	fs.writeFile(outputPath, filtersHTML, err => {
		if (err) throw err;
	})



});