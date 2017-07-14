/*
	This script takes the victims data and slices off only the victims from the current year.

	TODO: Make this output a CSV
*/

const 	fs = require('fs'),
		d3 = require('d3'),
		orderBy = require('lodash.orderBy'),
		minify = require('html-minifier').minify,
		dateTimeParser = d3.timeParse('%Y-%m-%d %H:%M:%S'),
		dateTimeFormatter = d3.timeFormat('%-I:%M %p, %b %e');


function formatGender(gender){
	// We have room in here to accomadate others. If not specified, will return supplied value.
	if (gender.toUpperCase() == "M") return "male";
	if (gender.toUpperCase() == "F") return "female";
	return gender;
}

function isFatal(victim){
	// Tests if shooting victim is coded as dead, based on a column in the data.
	if (victim['IS_FATAL'] == 1 || victim['IS_FATAL'] == "1" || victim['IS_FATAL'] == true || victim['IS_FATAL'].toUpperCase() == "TRUE"){
		return true;
	}
	return false;
}

fs.readFile('data/current-year-victims.json', 'utf-8', (err, data) => {
	if (err) throw err;
	const victims = orderBy(JSON.parse(data), v => {
		return dateTimeParser(`${v.DATE} ${v.HOUR}`)
	}, 'desc');

	// This var will hold our growing string of victims
	let victimsListString = `<h3 class='map__victims-headline'>Fatal shootings</h3><ul class='victims'>`;
	
	victims.forEach(v => {
		if (isFatal(v)){
			// Only generate a list of fatal shootings
			try{
				// If there is some error parsing the data, we will want to catch that, but move on and
				// and generate the others in the list.

				const 	shootingDate = dateTimeParser(`${v['DATE']} ${v['HOUR']}`),
						age = typeof(parseInt(v['AGE'])) == "number" ? parseInt(v['AGE']) : false,
						gender = v['SEX'].length > 0 ? v['SEX'] : false,
						link = v['LINK'].length > 0 ? v['LINK'] : false,
						address = v['LOCATION'],
						id = v['ID'];


				// Make an empty string. If we have data, then we'll fill it up.
				let personString = "";

				// Start our victim description
				if (age || gender) personString = "Victim: ";
				
				// If there is an actual age, print it
				if (age) personString += `${age}-year-old `;
				
				// If a gender is known
				if (gender) personString += `${formatGender(gender)} `;

				// Start the list item
				victimsListString += `<li class='victim' data-shooting-id=${id}>`;
				
				// If there is a link, part 1
				if (link) victimsListString += `<a class='map__link' href='${link}' target='_blank'>`;
				
				// Add the stuff about the victim	
				victimsListString += `
						<p><strong>${ personString }</strong></p>
						<p>Where: ${ address }</p>`;

				// If there is a link, close what we opened
				if (link) victimsListString += `<p class='victim__link-text'> &raquo; Click for news story</p></a>`;		

				// Close the list item.
				victimsListString += `</li>`
			}
	
			catch (e){
				console.log(`Error parsing data from ${v.TIME} ${v.DATE} at ${v['LOCATION']}`);
				console.log(e)
			}
	}
	})

	victimsListString += `</ul>`;

	victimsListString = minify(victimsListString, {
		collapseWhitespace:true,
		collapseInlineTagWhitespace:true
	});
	
	// Write the string to a seperate file
	fs.writeFile('subtemplates/_victims-list.html', victimsListString, err => {
		if (err) throw err;
	})

})