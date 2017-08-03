import countBy from "lodash.countby";
import sortBy from "lodash.sortby";


function objectToArray(obj){

	// Takes  data object of objects created by lodash/countby and transforms it into an array of objects.

	let arr = [];

	Object.keys(obj).forEach(key => {
		// Some shootings don't have a time, so we'll omit them. They are under the "-1"key.
		if (key > -1){
			arr.push({
				x: key,
				y: obj[key]
			});
		}
	});

	return sortBy(arr, d => d.x);
}

function GetTimeData(data, summarizeBy){

	// Takes the victims data and aggregates into a data format for the radial charts.
	// @param data <iterable object> => The raw data object
	// @param summarizBy <strong> => The key by which the data should be summarized. 

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

module.exports = {
	GetTimeData: GetTimeData,
	GetDayData:GetDayData, 
	GetMonthData:GetMonthData
};