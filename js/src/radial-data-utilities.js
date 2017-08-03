import countBy from "lodash.countby";
import sortBy from "lodash.sortby";

function GetTimeData(data, summarizeBy){

	// Takes the victims data and aggregates into a data format for the radial charts.
	// @param data <iterable object> => The raw data object
	// @param summarizBy <strong> => The key by which the data should be summarized. 

	// This provides the data grouped and counted by the desired key, but as an object of objects.
	const countedData = countBy(data, d => d[summarizeBy]);

	// We want the data to be an array of objects, so let's transform a little more.
	let countedData_arr = [];

	Object.keys(countedData).forEach(key => {
		// Some shootings don't have a time, so we'll omit them. They are under the "-1"key.
		if (key > -1){
			countedData_arr.push({
				x: new Date(1, 1, 1, key, 0, 0, 0),
				y: countedData[key]
			});
		}
	});

	// We want the final data to be in the correct order.
	return sortBy(countedData_arr, d => d.x)
}

module.exports = {
	GetTimeData: GetTimeData
};