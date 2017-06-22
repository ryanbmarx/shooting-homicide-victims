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

fs.readFile('data/raw-data.csv', 'utf-8', (err, data) => {
	if (err) throw err;
	const 	shootings = d3.csvParse(data),
			currentEntry = shootings[shootings.length - 1], // This is the last/most current entry
			currentYear = currentEntry['Year'],
			lastYear = parseInt(currentYear) - 1,
			currentDate = new Date(currentEntry['Year'], currentEntry['Month'], currentEntry['Day']), // Current = last entry
			currentTotalShootings = parseInt(currentEntry['cum_sum']),
			lastYearEntry = find(shootings, s => {
				return s.Year == lastYear && s['Month'] == currentEntry['Month'] && s['Day'] == currentEntry['Day'];
			}),
			lastYearTotalShootings = lastYearEntry['cum_sum'],
			shootingsFormatter = d3.format(',');


	const htmlString = minify(`
		<h2>Shooting victims through ${ d3.timeFormat('%A, %B %-d')(currentDate) }</h2>
		<div class="big-numbers">
			<dl class="number number--last-year">
				<dt>${ shootingsFormatter(lastYearTotalShootings) }</dt>
				<dd>${ lastYear }</dd>
			</dl>
			<dl class="number number--this-year">
				<dt>${ shootingsFormatter(currentTotalShootings) }</dt>
				<dd>${ currentYear }</dd>
			</dl>
		</div>`, {
			collapseWhitespace:true,
			collapseInlineTagWhitespace:true
		});

	fs.writeFile('subtemplates/_year-counter.html', htmlString, err =>{
		if (err) throw err;
	})
})