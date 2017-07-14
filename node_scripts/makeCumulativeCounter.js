/*
	This script outputs a small HTML partial for the shootins template. It pulls the current cumulative
	total and last year's total for the same date. It's all dependent on the dates in the data, so it should
	adapt just fine as we cross into 2018. The resulting HTML is minified because why not?

	ASSUMPTION: Logic here breaks if there is no previous year entry. There should be an entry 
	for every data even if there were no shootings for that time.

*/

const 	fs = require('fs'),
		d3 = require('d3'),
		find = require('lodash.find'),
		minify = require('html-minifier').minify;

fs.readFile('data/raw-dates.csv', 'utf-8', (err, data) => {
	if (err) throw err;
	const 	shootings = d3.csvParse(data),
			currentEntry = shootings[shootings.length - 1], // This is the last/most current entry
			currentYear = currentEntry['YEAR'],
			lastYear = parseInt(currentYear) - 1,
			currentDate = new Date(currentEntry['YEAR'], (currentEntry['MONTH'] - 1), currentEntry['DAY']), // Current = last entry
			currentTotalShootings = parseInt(currentEntry['CUMULATIVE_SUM']),
			lastYearEntry = find(shootings, s => {
				return s['YEAR'] == lastYear && s['MONTH'] == currentEntry['MONTH'] && s['DAY'] == currentEntry['DAY'];
			}),
			lastYearTotalShootings = lastYearEntry['CUMULATIVE_SUM'],
			shootingsFormatter = d3.format(',');
	

	let lessMore;
	if (currentTotalShootings - lastYearTotalShootings > 0){
		lessMore = "more than";
	} else if (currentTotalShootings - lastYearTotalShootings < 0){
		lessMore = "fewer than";
	} else {
		lessMore = "the same as";
	}

	const htmlString = minify(`<h2 class='title__headline'>In Chicago, <strong class='title__current-year'>${shootingsFormatter(currentTotalShootings)} people</strong> have been shot this year. That is <strong class='title__last-year'>${shootingsFormatter(Math.abs(currentTotalShootings - lastYearTotalShootings))} ${lessMore}</strong> ${ lastYear }.</h2>
		<p class='title__subtitle'>Data through ${ d3.timeFormat('%A, %B %-d')(currentDate) }</p>`, {
			collapseWhitespace:true,
			collapseInlineTagWhitespace:false
		});

	fs.writeFile('subtemplates/_year-counter.html', htmlString, err =>{
		if (err) throw err;
	})
})