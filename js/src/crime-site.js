import {csv, json} from 'd3';
import groupBy from 'lodash.groupby';
import GroupedBarChart from './grouped-bar-chart.js';
import MultilineChart from './multiline-chart.js';
import ShootingsMap from './shootings-map.js';

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


		// Build that YOY by month chart
		json(`http://${ app.options.ROOT_URL }/data/monthly.json`, (err, barData) =>{
			
			// This marginLeft variable will sync the chart position with the table while 
			// letting me control both with a single css

			const monthly = new GroupedBarChart({
				container: app.options.monthly,
				data:barData,
		        innerMargins:{ top:10,right:0,bottom:20,left:50 },
				currentColor: app.options.currentColor,
				otherColor: app.options.otherColor
			});

		});

		// Activate the YTD line chart
		csv(`http://${ app.options.ROOT_URL }/data/raw-dates.csv`,function(d, i, columns) {
				// This coerces the data into numbers
				for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
  				return d;
			}, (err, dailyData) => {

			const cumulativeChart = new MultilineChart({
				container: app.options.ytd,
				data: groupBy(dailyData, d=> d.Year), // seperate the rows into year groups
		        innerMargins:{ top:10,right:0,bottom:20,left:50 },
				currentColor: app.options.currentColor,
				otherColor: app.options.otherColor
			});
		});

		json(`http://${ app.options.ROOT_URL }/data/current-year-victims.json`,(err, mapData) => {
			// Build a map
			const map = new ShootingsMap({
				container: app.options.map,
				data:mapData,
				currentColor: app.options.currentColor
			});
		})
	}
}


module.exports = CrimeSite;