var 	orderBy = require('lodash.orderby'),
		 filter = require('lodash.filter'),
		 sumBy = require('lodash.sumby'),
		 groupBy = require('lodash.groupby'),
		 d3 = require('d3'),
		 queue = require("d3-queue").queue,
		 dataQueue = queue(),
		 fs = require('fs');

function getMonthlyTableData(currentData, oldData, oldDataYear){
	// console.log(currentData, oldData, oldDataYear);

	// Reduce old data down to just the desired year (at the time of this writing: 2016);
	let filteredOldData = filter(oldData, o => o.Year == oldDataYear.toString()), 
		retval={};

	// Sum the months for each data data
	[currentData, filteredOldData].forEach(dataset => {
		// Grab the year from the first item in the array so we can dilineate the datasets in the retval.
		var retvalKey = dataset[0]['Year'];

		// Group data by month
		var shootingsByMonth = groupBy(dataset, o => o.Month);

		// Get the keys for the object, which are, in this case, the months in numberic form
		var keys = Object.keys(shootingsByMonth);
		
		retval[retvalKey] = []
		// Sum each month
		keys.forEach(key => {	
			// Sum each month
			retval[retvalKey].push(sumBy(shootingsByMonth[key], o => parseInt(o.num_of_shootings)));
		})
	})

	return retval
}

// These are the three datasets we'll need to make the CrimeSite go.
var dataSets = [
	{
		id: "thisYear",
		url:`./frisco_brisco/shootings_2017_onwards.csv`
	},
	{
		id: "previousYears",
		url:`./frisco_brisco/shootings_upUntil_2016.csv`
	}
]


fs.readFile('frisco_brisco/shootings_2017_onwards.csv', 'utf-8', (err, currentData) => {
  if (err) throw err;
	fs.readFile('frisco_brisco/shootings_upUntil_2016.csv', 'utf-8', (err, oldData) => {
		if (err) throw err;
		
		var 	data = getMonthlyTableData(d3.csvParse(currentData), d3.csvParse(oldData), 2016),
				years = orderBy(Object.keys(data), y => parseInt(y), 'desc');

		let tableString = "<table>";

		years.forEach(year => {
			tableString += `<tr><td><strong>${year}</strong></td>`;
			data[year].forEach(n => {
				tableString += `<td>${n}</td>`
			})
			tableString += `</tr>`;
		})

		tableString += "</table>";

		console.log(tableString);
	});
  
});

// // Define the download queue
// dataSets.forEach( dataset => {
// 	dataQueue.defer(d3.csv, dataset.url);
// })    

// Activate the downloads
// dataQueue.awaitAll(function(error, files) { 
	// Files is, essentially, the dataSets variable, but it's just an array
	// of the downloaded datasets in order.

	// if (error) throw error;
	// console.log(files)

	// var 	data = getMonthlyTableData(files[0], files[1], 2016),
	// 		years = orderBy(Object.keys(data), y => parseInt(y), 'desc');

	// let tableString = "<table>";

	// years.forEach(year => {
	// 	tableString += `<tr><td><strong>${year}</strong></td>`;
	// 	data[year].forEach(n => {
	// 		tableString += `<td>${n}</td>`
	// 	})
	// 	tableString += `</tr>`;
	// })

	// tableString += "</table>";

	// console.log(tableString);
// });
