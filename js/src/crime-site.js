import {csv, json} from 'd3';
import groupBy from 'lodash.groupby';
// const queue = require("d3-queue").queue;
import GroupedBarChart from './grouped-bar-chart.js';
import MultilineChart from './multiline-chart.js';

// var 	orderBy = require('lodash.orderby'),
// 		filter = require('lodash.filter'),
// 		sumBy = require('lodash.sumby');

// function getMonthlyTableData(currentData, oldData, oldDataYear){
// 	// console.log(currentData, oldData, oldDataYear);

// 	// Reduce old data down to just the desired year (at the time of this writing: 2016);
// 	let filteredOldData = filter(oldData, o => o.Year == oldDataYear.toString()), 
// 		retval={};

// 	// Sum the months for each data data
// 	[currentData, filteredOldData].forEach(dataset => {
// 		// Grab the year from the first item in the array so we can dilineate the datasets in the retval.
// 		const retvalKey = dataset[0]['Year'];

// 		// Group data by month
// 		const shootingsByMonth = groupBy(dataset, o => o.Month);

// 		// Get the keys for the object, which are, in this case, the months in numberic form
// 		const keys = Object.keys(shootingsByMonth);
		
// 		retval[retvalKey] = []
// 		// Sum each month
// 		keys.forEach(key => {	
// 			// Sum each month
// 			retval[retvalKey].push(sumBy(shootingsByMonth[key], o => parseInt(o.num_of_shootings)));
// 		})
// 	})

// 	return retval
// }

class CrimeSite{

	// This custom class will handle the three (or maybe four) 
	// chart forms which combine to be the band-aid crime site.
	// Each of the forms will be constructed using their own
	// custom classes, but whatever data transforms are needed
	// will be handled by this master class.


	constructor(options){
		const 	app = this; // bind this
				// dataQueue = queue(); // create our d3-queue queue for downloading the data
		
		app.options = options; // The options object as app attribute

		// These are the three datasets we'll need to make the CrimeSite go.
		// const dataSets = [
		// 	{
		// 		id: "thisYear",
		// 		url:`http://${ app.options.ROOT_URL }/frisco_brisco/shootings_2017_onwards.csv`,
		// 	},
		// 	{
		// 		id: "previousYears",
		// 		url:`http://${ app.options.ROOT_URL }/frisco_brisco/shootings_upUntil_2016.csv`,
		// 	},
		// 	{
		// 		id: "geoData",
		// 		url:`http://${ app.options.ROOT_URL }/frisco_brisco/geocodes_2017_onwards.csv`,
		// 	}
		// ]


		// Define the download queue
		// dataSets.forEach( dataset => {
		// 	dataQueue.defer(csv, dataset.url);
		// })    

		// Activate the downloads
		// dataQueue.awaitAll(function(error, files) { 
			// Files is, essentially, the dataSets variable, but it's just an array
			// of the downloaded datasets in order.
			// if (error) throw error;

			// Build that YOY month 
			json(`http://${ app.options.ROOT_URL }/data/monthly.json`, (err, barData) =>{
				
				// This marginLeft variable will sync the chart position with the table while 
				// letting me control both with a single css

				const monthly = new GroupedBarChart({
					container: app.options.monthly,
					data:barData,
			        innerMargins:{top:10,right:0,bottom:20,left:50},
					currentColor: app.options.currentColor,
					otherColor: app.options.otherColor
				});

			});

			// Activate the YTD line chart
			csv(`http://${ app.options.ROOT_URL }/data/raw-data.csv`,function(d, i, columns) {
  				// This coerces the data into numbers
  				for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
	  				return d;
				}, (err, dailyData) => {

				const cumulativeChart = new MultilineChart({
					container: app.options.ytd,
					data: groupBy(dailyData, d=> d.Year),
			        innerMargins:{top:10,right:0,bottom:20,left:50},
					currentColor: app.options.currentColor,
					otherColor: app.options.otherColor

				});

			})
		// });

		
	}
}


module.exports = CrimeSite;