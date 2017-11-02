'use strict'

/*
	This script takes the victims data (at the moment just from homicides)
	and slices off this year's victims, outputtng it as a subtemplate
*/

const 	fs = require('fs'),
		d3 = require('d3'),
		orderBy = require('lodash.orderBy'),
		// filter = require('lodash.filter'),
		minify = require('html-minifier').minify,
		dateTimeParser = d3.timeParse('%Y-%m-%d %H:%M:%S'),
		dateFormatter = d3.timeFormat('%b %e'), // For when we don't know time
		dateTimeFormatter = d3.timeFormat('%-I:%M %p, %b %e'), // For when we know time.
		inputPath = process.argv[2],
		outputPath = process.argv[3],
		ageUnknownString = "Age unknown";


function formatSex(s){
	// We have room in here to accomadate others. If not specified, will return supplied value.
	if (s.length > 0){
		if (s.toUpperCase() == "M") return "male";
		if (s.toUpperCase() == "F") return "female";
		return s;
	}
	// If it is blank, skip it.
	return false;
}

function formatAge(a){
	if (a > 0) return `${a}-year-old`;
	if (a === 0 || a === "0") return 'Baby';
	if (a < 0) return ageUnknownString;
	return false;
}

function isFatal(victim){
	// Tests if shooting victim is coded as dead, based on a column in the data.
	if (victim['IS_FATAL'] == 1 || victim['IS_FATAL'] == "1" || victim['IS_FATAL'] == true || victim['IS_FATAL'].toUpperCase() == "TRUE"){
		return true;
	}
	return false;
}

function capFirstLetter(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// function transformData(data){
// 	// Takes the data, parses the CSV, strips it to current year, then orders by date/time
// 	const currentYear = new Date().getFullYear();

// 	let retval = d3.csvParse(data);

// 	// Filter to current year
// 	retval = filter(retval, r =>  r['DATE'].slice(0,4) == currentYear);

// 	// Order by datetime
// 	retval = orderBy(retval, r => {
// 		// We need to catch instnaces without a time. Just make it 12:01 a.m.
// 		return r['HOUR'].length > 0 ? dateTimeParser(`${r['DATE']} ${r['HOUR']}`) : dateTimeParser(`${r['DATE']} 00:01:00`);
// 	}, 'desc')

// 	return retval;
// }

function getAgeSexString(age, sex){
	let retval="";

	if (age && sex) {
		if (age.toUpperCase() == "BABY"){
			retval = `${capFirstLetter(sex)} baby`;
		} else {
			retval = `${age} ${sex}`;
		}
	} else if (age && !sex){
		retval = age;
	}  else if (!age && sex){
		retval = capFirstLetter(sex);
	}
	return retval;
}

fs.readFile(inputPath, 'utf-8', (err, data) => {
	if (err) throw err;

	let victims = d3.csvParse(data);

	// // This var will hold our growing string of victims	
	let victimListString = "<div class='victims'>";

	victims.forEach(v => {
		try{
			// If there is some error parsing the data, we will want to catch that, but move on and
			// and generate the others in the list.

			if (isFatal(v)){
				const 	link = v['LINK'].length > 0 ? v['LINK'] : false,
						inputDate = v['HOUR'].length > 0 ? dateTimeParser(`${v['DATE']} ${v['HOUR']}`) : dateTimeParser(`${v['DATE']} 00:01:00`),
						outputDate = v['HOUR'].length > 0 ? dateTimeFormatter(inputDate) : dateFormatter(inputDate),
						sex = formatSex(v['SEX']),
						age = formatAge(v['AGE']),
						name = v['NAME_FIRST'] && v['NAME_LAST'] ? `${v['NAME_FIRST']} ${v['NAME_LAST']}` : false;	
						
				let dataAttrString = ``;


				if (sex) dataAttrString += ` data-sex="${v['SEX'].toLowerCase()}"`; 
				if (age) dataAttrString += ` data-age="${v['AGE']}"`;

				if (v['RACE']) {					
					dataAttrString += ` data-race="${v['RACE'].toLowerCase()}"`;
				} else {
					dataAttrString += ` data-race="unknown" `;
				}

				if (v['PUB_CAUSE']) {
					dataAttrString += ` data-pub_cause="${v['PUB_CAUSE'].toLowerCase()}"`;
				} else {
					dataAttrString += ` data-pub_cause="unknown"`;
				}

				let victimString = `<div class='victim' ${ dataAttrString }>`;
				
				victimString += `<p class='victim__date'>${outputDate}</p>`		
		
				let descriptionBig, descriptionSmall = false;

				if (name){
					// If there is a name, put that in the big spot, with the age on the secondary line
					descriptionBig = name;
					descriptionSmall = getAgeSexString(age, sex);
				} else if (age == "Age unknown"){
					// If the age is not known, make sure it's in the secondary position
					descriptionBig = sex;
					descriptionSmall = age;
				} else {
					// Otherwise just go with the "XX-yo Male" construction	
					descriptionBig = getAgeSexString(age, sex);
				}				

				victimString += `<p class='victim__desc-big'>${descriptionBig}</p>`;

				if (descriptionSmall) victimString += `<p class='victim__desc-small'>${descriptionSmall}</p>`;;

				if (link) victimString += `<a target='_blank' class='victim__link' href='${link}'>READ STORY</a>`;
	
				victimString += "</div>";
	
				// Add our newly-formed victim to the running list
				victimListString += victimString;
			}
		}


		catch (e){
			console.log(`Error parsing data from ${v.TIME} ${v.DATE} at ${v['LOCATION']}`);
			console.log(e)
		}
	})

	victimListString += `</div>`;

	victimListString = minify(victimListString, {
		collapseWhitespace:true,
		collapseInlineTagWhitespace:true
	});
	
	// Write the string to a seperate file
	fs.writeFile(outputPath, victimListString, err => {
		if (err) throw err;
	})

})