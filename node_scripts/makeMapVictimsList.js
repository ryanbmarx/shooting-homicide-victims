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
	if (gender.toUpperCase() == "M") return "male";
	if (gender.toUpperCase() == "F") return "female";
}

fs.readFile('data/current-year-victims.json', 'utf-8', (err, data) => {
	if (err) throw err;
	const 	victims = orderBy(JSON.parse(data), v => {
		return dateTimeParser(`${v.Date} ${v.Hour}`)
	}, 'desc');

	console.log(victims[10]);

	// This var will hold our growing string of victims
	let victimsListString = `<h3 class='map__victims-headline'>Fatal shootings</h3><ul class='victims'>`;
	
	victims.forEach(v => {
		if (v.isFatal == 1){
			// Only generate a list of fatal shootings
			try{
				// If there is some error parsing the data, we will want to catch that, but move on and
				// and generate the others in the list.

				const 	shootingDate = dateTimeParser(`${v.Date} ${v.Hour}`),
						age = typeof(parseInt(v.Age)) == "number" ? parseInt(v.Age) : false,
						gender = v.Sex.length > 0 ? v.Sex : false,
						link = v.Link,
						address = v['Shooting Location'],
						id = v['uniqueID'];


				// Make an empty string. If we have data, then we'll fill it up.
				let personString = "";

				// Start our victim description
				if (age || gender) personString = "Victim: ";
				
				// If there is an actual age, print it
				if (age) personString += `${age}-year-old `;
				
				// If a gender is known
				if (gender) personString += `${formatGender(gender)} `;

				victimsListString += `<li class='victim' data-shooting-id=${id}>
					<a class='map__link' href='${link}' target='_blank'>
						<p><strong>${ personString }</strong></p>
						<p>When: <time datetime="${ shootingDate }">${dateTimeFormatter(shootingDate)}</time></p>
						<p>Where: ${ address }</p>
					</a>
				</li>`
			}
	
			catch (e){
				console.log(`Error parsing data from ${v.Time} ${v.Date} at ${v['Shooting Location']}`);
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