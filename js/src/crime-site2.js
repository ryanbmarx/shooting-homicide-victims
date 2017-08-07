import {csv, json} from 'd3';
import groupBy from 'lodash.groupby';
import sortBy from 'lodash.sortby';

import GroupedBarChart from './grouped-bar-chart.js';
import MultilineChart from './multiline-chart.js';
import ShootingsMap from './shootings-map.js';

import countBy from 'lodash.countby';
import RadialChart from './radial-chart.js';
import RadialBarChart from './radial-bar-chart.js';

import * as radialDataUtilities from './radial-data-utilities.js'


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


	const base_data_url = `http://${options.ROOT_URL}/data/${options.version}`;

	csv(`${base_data_url}/victims.csv`, (err, data) => {
		if (err) throw err;


		// -------------------
		// Load the radials
		// -------------------

		const radialMargins = {top:10,right:0,bottom:0,left:0};

		const timeRadial = new RadialBarChart({
			container: document.querySelector('#time'),
			data: radialDataUtilities.GetTimeData(data, "HOUR_HH"),
			innerMargins:radialMargins,
		});

		const dayRadial = new RadialBarChart({
			container: document.querySelector('#day'),
			data: radialDataUtilities.GetDayData(data),
			innerMargins:radialMargins,
		});

		const monthRadial = new RadialBarChart({
			container: document.querySelector('#month'),
			data: radialDataUtilities.GetMonthData(data),
			innerMargins:radialMargins,
		});


		// -------------------
		// Make a map
		// -------------------

		const map = new ShootingsMap({
			container: document.querySelector('#map'),
			data:data,
			currentColor: app.options.currentColor,
			fatalColor: app.options.fatalColor,
			legendButtons: document.querySelectorAll('.map-legend__button')
		});
	});

	csv(`${base_data_url}/days.csv`, (d,i,columns) => {
		// This coerces the data into numbers
		for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
		return d;

	}, (err, data) => {
		if (err) throw err;

		// -------------------------
		// Load the cumulative chart
		// -------------------------
		
		console.log(groupBy(data, d=> d['YEAR']));

		const cumulativeChart = new MultilineChart({
			container: document.querySelector('#cumulative'),
			data: groupBy(data, d=> d['YEAR']), // seperate the rows into year groups
	        innerMargins:{ top:7,right:0,bottom:20,left:50 },
			currentColor: app.options.currentColor,
			otherColor: app.options.otherColor
		});
	});


		// // Activate the YTD line chart
		// csv(`http://${ app.options.ROOT_URL }/data/raw-dates.csv`,function(d, i, columns) {
		// 		// This coerces the data into numbers
		// 		for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
  // 				return d;
		// 	}, (err, dailyData) => {

		// 	const cumulativeChart = new MultilineChart({
		// 		container: app.options.ytd,
		// 		data: groupBy(dailyData, d=> d['YEAR']), // seperate the rows into year groups
		//         innerMargins:{ top:7,right:0,bottom:20,left:50 },
		// 		currentColor: app.options.currentColor,
		// 		otherColor: app.options.otherColor
		// 	});
		// });

		// json(`http://${ app.options.ROOT_URL }/data/current-year-victims.json`,(err, mapData) => {
		// 	// Build a map
		// 	const map = new ShootingsMap({
		// 		container: app.options.map,
		// 	    victimList: app.options.victimList,
		// 		data:mapData,
		// 		currentColor: app.options.currentColor,
		// 		fatalColor: app.options.fatalColor,
		// 		legendButtons: app.options.mapLegendButtons
		// 	});
		// })
	}
}


module.exports = CrimeSite;