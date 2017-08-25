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

function getMaxAge(data){
	let retval = 0;
	data.forEach(d => {
		const age = parseInt(d['AGE']);
		retval = Math.max(retval, age);
	})
	return retval;
}

function getMinAge(data){
	let retval = 200;
	data.forEach(d => {
		const age = parseInt(d['AGE']);
		retval = Math.min(age, retval);
	})
	return retval;
}

function getButtonString(category, victimsArray){
	// From an array of victim objects (representing the unique values of the object 
	// attribute <category>), create an html string to be filter buttons in our app.

	let retval="";

	orderBy(victimsArray, v => v[category] == "" ? "Unknown" : v[category]).forEach(v => {
		let label = v[category] == "" ? "Unknown" : v[category];
		retval += `<button class='filter-button' data-checked=true data-cat='${category.toLowerCase()}' data-cat-value='${label.toLowerCase()}'>${labelFormatters[category](label)}</button>`;
	})

	return retval;
}

const labelFormatters = {};

labelFormatters.MAIN = function(att){
	// Takes attribute and returns human readable version for labeling purposes
	switch (att){
		case "PUB_CAUSE":
			return "Cause of death";
			break;
		case "RACE":
			return "Race";
			break;
		case "SEX":
			return "Sex";
			break;
	}
	return att;
}

labelFormatters.SEX = function(att){
		switch (att){
		case "M":
			return "Male";
			break;
		case "F":
			return "Female";
			break;
		case "UNKNOWN":
			return "Unknown";
			break;
	}
	return att;
}

labelFormatters.RACE = function(att){
		switch (att){
		case "B":
			return "Black, not hispanic";
			break;
		case "B(H)":
			return "Black, hispanic";
			break;
		case "W":
			return "White, not hispanic";
			break;
		case "W(H)":
			return "White, hispanic";
			break;
		case "A":
			return "Asian";
			break;
		case "UNKNOWN":
			return "Unknown";
			break;

	}
	return att;
}

labelFormatters.PUB_CAUSE = function(att){
	switch (att.toUpperCase()){		
		case "ASSAULT":
			return "Assault";
			break;
		case "BEATEN/STABBED":
			return "Beaten/Stabbed";
			break;
		case "CHILD ABUSE":
			return "Child Abuse";
			break;
		case "MULTIPLE INJURIES":
			return "Multiple Injuries";
			break;
		case "SHOT":
			return "Shot";
			break;
		case "STABBING":
			return "Stabbing";
			break;
		case "STRUCK BY AUTO":
			return "Struck by Auto";
			break;
		case "THROWN FROM AUTO":
			return "Thrown from Auto";
			break;
		case "UNKNOWN":
			return "Unknown";
			break;
		case "VEHICLE":
			return "Vehicle";
			break;

	}
	return att;
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

	let filtersHTML = `<div class='filters'>
		<div class="filters__group filters__group--age age-slider">
          <p class='filters__group-label'>Filter by age</p>
          <div id='age-slider' data-min-age=${getMinAge(victimsData)} data-max-age=${getMaxAge(victimsData)}></div>
          <span class="age-slider__label age-slider__label--left"></span>
          <span class="age-slider__label age-slider__label--right"></span>
        </div>`;

	// Put our buttons into some HTML architecture 
	attributes.forEach(att => {
		let filterGroup = `<div class='filters__group filters__group--${att.toLowerCase()}'>`;
		filterGroup += `<p class='filters__group-label'>${labelFormatters.MAIN(att)}</p>`
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