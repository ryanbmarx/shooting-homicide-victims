import countBy from "lodash.countby";
import sortBy from "lodash.sortby";
import filter from "lodash.filter";

function objectToArray(obj, sortByX = true){

	// Takes  data object of objects created by lodash/countby and transforms it into an array of objects.

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

	if (sortByX) return sortBy(arr, d => parseInt(d.x));
	return sortBy(arr, d => parseInt(d.y))
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

function getTreeMapData(data){
	const countedData = countBy(data, d => {
		return d['PUB_CAUSE'] == "" ? "Unknown" : d['PUB_CAUSE'];
	});
	return objectToArray(countedData, false);
}

module.exports = {
	GetTimeData: GetTimeData,
	GetDayData:GetDayData, 
	GetMonthData:GetMonthData,
	GetCurrentYearData:GetCurrentYearData,
	getTreeMapData:getTreeMapData
};