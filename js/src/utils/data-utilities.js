import countBy from "lodash.countby";
import sumBy from "lodash.sumby";
import sortBy from "lodash.sortby";
import filter from "lodash.filter";

function objectToArray(obj, sortByX = true, sortDirection = 'asc'){

	// Takes  data object of objects created by lodash/countby and transforms it into an array of objects.

	// Create a new array of objects with the object keys moved into the object.
	let arr = [];
	Object.keys(obj).forEach(key => {
		// Some shootings don't have a time, so we'll omit them. They are under the "-1"key.
		if (key > -1 || isNaN(key)){
			arr.push({
				x: key,
				y: obj[key]
			});
		}
	});

	// Now we sort it.
	let sorted;

	// If the user wants it sorted by the x attribute, then do 
	// so (this is default). Otherwise sort it by the Y
	if (sortByX) {
		sorted = sortBy(arr, d => parseInt(d.x))
	} else {
		sorted = sortBy(arr, d => parseInt(d.y));
	}
	
	// Lodash sorts only in ascending order.
	// If the user has opted for a descending 
	// order, then reverse it.
	if (sortDirection == "desc") return sorted.reverse();
	return sorted;
}

 
function GetCurrentYearData(data){
	// Takes a data array of incident objects and returns an array of objects from the current year.
	const 	currentYear = new Date().getFullYear(),
			currentYearIncidents = filter(data, d => {
				const 	dateString = d['DATE'].split('-'),
						incidentYear = new Date(dateString[0], dateString[1], dateString[2]).getFullYear();
				return incidentYear == currentYear;
			});
	return currentYearIncidents;
}

function GetTimeData(data, summarizeBy){

	// Takes the victims data and aggregates into a data format for the radial charts.
	// @param data <iterable object> => The raw data object
	// @param summarizeBy <strong> => The key by which the data should be summarized. 

	// This provides the data grouped and counted by the desired key, but as an object of objects.
	const countedData = countBy(data, d => d[summarizeBy]);

	// We want the final data to be in the correct order.
	return objectToArray(countedData);
}

function GetDayData(data){

	const countedData = countBy(data, d => {
		return new Date(d['DATE']).getDay();
	});

	return objectToArray(countedData);
}

function GetMonthData(data){

	const countedData = countBy(data, d => {
		return new Date(d['DATE']).getMonth();
	});

	return objectToArray(countedData);
}

function GetAgeData(data){

	let ageData = countBy(data, d =>{
		if (parseInt(d.AGE) > 1) return d.AGE;
		if (typeof(d.AGE) == 'string' && d.AGE.toUpperCase() != "NONE" && d.AGE.toUpperCase() != "M") return 0;
		return "bogus";
	});

	ageData = objectToArray(ageData, false);
	
	// The ages, though numbers, are string variables. We need to fix that.
	ageData.forEach(age => {
		age.x = parseInt(age.x);
	});

	// Now sort by age and return.
	return sortBy( ageData, d => parseInt(d.x));
}

function getTreeMapData(data){
	// Takes the allVictims data object and summarizes by cause of death. 
	// Obviously, this will not work with shootings data since there are no
	// causes listed. Even so, the cause would be shooting. Anyhow ...
	// It returns an array of incident objects formatted in a d3.hierarchy-compatible
	// format. Also, any cause of death repesenting 1% or less of the overall total 
	// will be lumped with "other."

	const countedData = countBy(data, d => {
		return d['PUB_CAUSE'] == "" ? "Unknown" : d['PUB_CAUSE'];
	});

	const totalIncidents = data.length;

	let other = 0, // running total of "other"
		otherTypes = [], // running list of the types being omitted
		childNodes = []; // the rest of the violence types

	objectToArray(countedData, false).forEach(cause => {
		if (cause.y / totalIncidents <= 0.01) {
			other += cause.y;
			otherTypes.push(cause.x);
		} else {
			childNodes.push(cause);
		}
	})

	childNodes.push({
		x: "Other",
		y: other,
		causes:otherTypes
	})

	return {
			name: "violence",
			children: childNodes
		}
}

function GetSexData(data){
	const countedData = countBy(data, d => {
		if (d['SEX'].toUpperCase() == "M") return "Male";
		if(d['SEX'].toUpperCase() == "F") return "Female";
		return "Not Known";
	});
	return objectToArray(countedData, false, 'desc');
}

function GetRaceEthnicityData(data){
	const countedData = countBy(data, d => d.RACE == "" ? "Not known" : d.RACE);
	return objectToArray(countedData, false, 'desc');
}

module.exports = {
	GetTimeData: GetTimeData,
	GetDayData:GetDayData, 
	GetMonthData:GetMonthData,
	GetCurrentYearData:GetCurrentYearData,
	getTreeMapData:getTreeMapData,
	GetAgeData: GetAgeData,
	GetSexData:GetSexData,
	GetRaceEthnicityData:GetRaceEthnicityData
};