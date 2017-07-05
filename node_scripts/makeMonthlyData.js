const 	orderBy = require('lodash.orderby'),
		filter = require('lodash.filter'),
		sumBy = require('lodash.sumby'),
		groupBy = require('lodash.groupby'),
		d3 = require('d3'),
		fs = require('fs'),
		minify = require('html-minifier').minify;

function getMonthlyTableData(rawData){

	// Retrieve the year of the last date in the dataset. 

	// First, sort it by date.
	let tempData = orderBy(rawData, o => {
		return new Date(parseInt(o.YEAR), parseInt(o.MONTH), parseInt(o.MONTH), 0,0,0,0);
	})

	const 	currentYear = parseInt(tempData[tempData.length - 1]['YEAR']),
			currentMonth = new Date().getMonth() + 1, // In our data, january = 1, so we need to add one from the JS.
			lastYear = currentYear - 1;

	// Pluck only the last year and year prior from the dataset, discarding the rest.
	tempData = filter(rawData, o => {
		return parseInt(o.YEAR) == currentYear || parseInt(o.YEAR) == lastYear;
	})

	// Transform the data into an object of arrays, grouped by month
	tempData = groupBy(tempData, o => o.MONTH);

	// Grab the data object's keys. This will be our iterable item.
	const months = Object.keys(tempData);
	
	// Stub out the final data object. This is the format we will want, which mimicks the result of d3.csvParse();
	let monthlyJson = {
		data:[],
		columns:[]
	};

	// While iterating over the keys, sum the shootings by month and push them into our data )
	months.forEach(month => {
		const tempMonth = groupBy(tempData[month], d => d.YEAR);
	
		let tempObj = {
			"month": parseInt(month) - 1,
			"totalLastYear": sumBy(tempMonth[lastYear], d => parseInt(d.NUM_OF_SHOOTINGS))
			// "totalCurrentYear": sumBy(tempMonth[currentYear], d => parseInt(d.NUM_OF_SHOOTINGS))
		}


		// If the month is current or passed, add the difference. If we didn't check for 
		// the current month, then we'd get a bunch of 100% drops in shooting for months 
		// that had yet to pass.
		if(month <= currentMonth) {
			tempObj["totalCurrentYear"] = sumBy(tempMonth[currentYear], d => parseInt(d.NUM_OF_SHOOTINGS));
			tempObj["difference"] = tempObj["totalCurrentYear"] - tempObj["totalLastYear"];
		}

		// Insert the month's information into the data object.
		monthlyJson.data.push(tempObj)
	})
	
	// Lastly, just fill out the columns list, which should adapt when the date changes over.
	monthlyJson.columns = ['months', lastYear, currentYear, 'difference'];
	
	// We're done.
	return monthlyJson;
}



fs.readFile('data/raw-dates.csv', 'utf-8', (err, rawData) => {
	if (err) throw err;
	
	const data = getMonthlyTableData(d3.csvParse(rawData));

	fs.writeFile('data/monthly.json', JSON.stringify(data), err =>{
		if (err) throw err;
	})
});