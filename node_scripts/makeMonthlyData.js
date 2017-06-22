const 	orderBy = require('lodash.orderby'),
		filter = require('lodash.filter'),
		sumBy = require('lodash.sumby'),
		groupBy = require('lodash.groupby'),
		d3 = require('d3'),
		queue = require("d3-queue").queue,
		dataQueue = queue(),
		fs = require('fs'),
		minify = require('html-minifier').minify;

function getMonthlyTableData(rawData){

	// Retrieve the year of the last date in the dataset. First, sort it by date.

	let tempData = orderBy(rawData, o => {
		return new Date(parseInt(o.Year), parseInt(o.Month), parseInt(o.Day), 0,0,0,0);
	})

	const 	currentYear = parseInt(tempData[tempData.length - 1]['Year']),
			lastYear = currentYear - 1;

	// Pluck only the last year and year prior from the dataset, discarding the rest.

	tempData = filter(rawData, o => {
		return parseInt(o.Year) == currentYear || parseInt(o.Year) == lastYear;
	})

	tempData = groupBy(tempData, o => o.Month);

	const months = Object.keys(tempData);
	let monthlyJson = {
		data:[],
		columns:[]
	};

	months.forEach(month => {
		const tempMonth = groupBy(tempData[month], d => d.Year);
		// console.log(tempMonth);
		monthlyJson.data.push({
			"month": parseInt(month) - 1,
			"totalLastYear": sumBy(tempMonth[lastYear], d => parseInt(d.num_of_shootings)),
			"totalCurrentYear": sumBy(tempMonth[currentYear], d => parseInt(d.num_of_shootings))
		})
	})

	monthlyJson.columns = ['months', lastYear, currentYear];
	return monthlyJson;
}



fs.readFile('data/raw-data.csv', 'utf-8', (err, rawData) => {
	if (err) throw err;
	
	const data = getMonthlyTableData(d3.csvParse(rawData));

	fs.writeFile('data/monthly.json', JSON.stringify(data), err =>{
		if (err) throw err;
	})
});