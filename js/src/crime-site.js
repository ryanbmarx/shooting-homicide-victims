import {csv} from 'd3';
import groupBy from 'lodash.groupby';

import GroupedBarChart from './chart-forms/grouped-bar-chart.js';
import MultilineChart from './chart-forms/multiline-chart.js';
import ViolenceMap from './chart-forms/map.js';
import RadialBarChart from './chart-forms/radial-bar-chart.js';
import TreeMap from './chart-forms/tree-map.js';
import LineChart from './chart-forms/line-chart.js';
import ListBarChart from './chart-forms/list-bar-chart.js';
import PieChart from './chart-forms/pie-chart.js';
import VictimsFilter from './victims-filter.js';
import * as dataUtilities from './utils/data-utilities.js'
import getTribColor from './utils/getTribColors.js';

// TODO: ADD INSIGHTS TO THE HEADER
// TODO: ADD DATA DOWNLOAD LINKS
// TODO: Test leap year, equal totals with page topper
// TODO: Test slider on mobile

class CrimeSite{

	// This custom class will handle the three (or maybe four) 
	// chart forms which combine to be the band-aid crime site.
	// Each of the forms will be constructed using their own
	// custom classes, but whatever data transforms are needed
	// will be handled by this master class.


	constructor(options){
		const 	app = this; // bind this
		
		app.options = options; // The options object as app attribute

	const base_data_url = `http://${options.ROOT_URL}/data/${options.version}`;
	
	// This is the last 365 data being downloaded.
	csv(`${base_data_url}/${options.version}_geocode_last365.csv`, (err, data) => {
		if (err) throw err;

		// This dataset will get used in a few different ways.
		const last365Data = data;

		// -------------------
		// Load the radials
		// -------------------

		const 	radialMargins = {top:10,right:0,bottom:0,left:0},
				radialContainerWidth = document.querySelector('#time').getBoundingClientRect().width, // This will determine the # of ticks.
				radialScaleGap = 130/360;
		const timeRadial = new RadialBarChart({
			container: document.querySelector('#time'),
			data: dataUtilities.GetTimeData(last365Data, "HOUR_HH"),
			innerMargins:radialMargins,
			labelKey: 'time',
			yTicks: radialContainerWidth > 200 ? 4 : 2,
			yScaleGap: radialScaleGap

		});

		const dayRadial = new RadialBarChart({
			container: document.querySelector('#day'),
			data: dataUtilities.GetDayData(last365Data),
			innerMargins:radialMargins,
			labelKey: 'day',
			yTicks: radialContainerWidth > 200 ? 4 : 2,
			yScaleGap: radialScaleGap

		});

		const monthRadial = new RadialBarChart({
			container: document.querySelector('#month'),
			data: dataUtilities.GetMonthData(last365Data),
			innerMargins:radialMargins,
			labelKey: 'month',
			yTicks: radialContainerWidth > 200 ? 4 : 2,
			yScaleGap: radialScaleGap
		});


		// -------------------
		// Make a map
		// -------------------


		const map = new ViolenceMap({
			container: document.querySelector('#map'),
			data:dataUtilities.GetCurrentYearData(data),
			currentColor: app.options.currentColor,
			fatalColor: app.options.fatalColor,
			legendButtons: document.querySelectorAll('.map__legend-button')
		});

		// ---------------------------------
		// Make a treemap of causes of death
		// ---------------------------------

		if (window.version == "homicides"){

			const victims = new VictimsFilter({
				buttons: document.querySelectorAll('.topic--victims .filter-button'),
				victims: document.querySelectorAll('.topic--victims .victim')
			});

			const causesOfDeath = new TreeMap({
				container: document.querySelector('#causes'),
				data: dataUtilities.getTreeMapData(last365Data),
		        innerMargins:{ top:0,right:0,bottom:0,left:20 }
			});

			const age = new LineChart({
		        filled:false, // Include a filled area under the line
		        curvyLine: true, // soften the angles of the line
		        container:document.querySelector('#age'),
		        dataset: dataUtilities.GetAgeData(last365Data), // Will be charted AS IS. All transforms, etc., should be done by now.
		        xAttribute:'x', // The key of the x attribute in the data set
		        yAttribute:'y', // The key of the y attribute in the data set
		        innerMargins:{ top:10,right:10,bottom:19,left:40 }, // This will inset the chart from the base container (which should be controlled by CSS)
		        strokeColor:app.options.currentColor, // must be a valid color syntax, #HEX, rgba(), etc.
		        strokeWidth:2, // no units. this is svg
		        areaFillColor: false, // Also must be a valid color syntax, #HEX, rgba(), etc. 
		        formatStrings: {
		        	// These strings will be used with d3.format(<string>)(<number>) on the axes 
		            yAxis: false,
		            xAxis: false
		        },
		        yMin:0, // Most charts should start at zero
		        maxYValue:false,
		        showYAxis:true,
		        maxXValue:false,
		        showXAxis:true,
		        ticks:{
		            yAxis:5,
		            xAxis:5
		        },
		        meta:{
		            headline:false,
		            xAxisLabel: false,
		            yAxisLabel: "Homicides",
		            sources: false,
		            credit: false
		        }
		    });

			const sexChart = new PieChart({
				container: document.querySelector('#sex'),
				data: dataUtilities.GetSexData(last365Data),
				innerMargins:{ top:0, right:0, bottom:0, left:0 },
				labelKey: 'sex',
				donutWidth: 35, // Set to "false" if you don't want a donut
				xKey: "x",
				yKey: "y",
				fillColor:app.options.currentColor,
				sliceSpacing: 0.03 // the angle, in radians, between elements. Suggested value < 0.1
			});

			const raceEthnicityChart = new ListBarChart({
				container: document.querySelector('#race-ethnicity'),
				data: dataUtilities.GetRaceEthnicityData(last365Data),
		        innerMargins:{ top:20,right:10,bottom:20,left:0 },
		        barColor: getTribColor('trib-blue3'),
		        xTicks: 5
			});
		}
	});

	// This is the cumulative chart data.
	csv(`${base_data_url}/${options.version}.csv`, (d,i,columns) => {
		// This coerces the data into numbers
		for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
		return d;

	}, (err, data) => {
		if (err) throw err;

		// -------------------------
		// Load the cumulative chart
		// -------------------------
		
		const cumulativeChart = new MultilineChart({
			container: document.querySelector('#cumulative'),
			data: groupBy(data, d=> d['YEAR']), // seperate the rows into year groups
	        innerMargins:{ top:7,right:0,bottom:20,left:40 },
			currentColor: app.options.currentColor,
			otherColor: app.options.otherColor
		});
	});

	}
}


module.exports = CrimeSite;