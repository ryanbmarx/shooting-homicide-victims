'use strict'

const 	d3 = require('d3'),
		fs = require('fs'),
		minify = require('html-minifier').minify;


function monthFormatter(month, dataAttribute){

	// takes a month as number and returns AP style abbreviation. If the window width is too small, then it returns an even shorter version.
	
	const months = {
		0:{ap: "Jan.", short:"J", full:"January"},
		1:{ap: "Feb.", short:"F", full:"February"},
		2:{ap: "March", short:"M", full:"March"},
		3:{ap: "April", short:"A", full:"April"},
		4:{ap: "May", short:"M", full:"May"},
		5:{ap: "June", short:"J", full:"June"},
		6:{ap: "July", short:"J", full:"July"},
		7:{ap: "Aug.", short:"A", full:"August"},
		8:{ap: "Sept.", short:"S", full:"September"},
		9:{ap: "Oct.", short:"O", full:"October"},
		10:{ap: "Nov.", short:"N", full:"November"},
		11:{ap: "Dec.", short:"D", full:"December"}
	}
	if (dataAttribute){
		return months[month]['full'];
	}
	return `<span class='date date--ap'>${months[month]['ap']}</span><span class='date date--short'>${months[month]['short']}</span>`;
	

}

function formatDifference(difference){
	// Adds a plus sign to positive numbers, to emphasize that it is a change
	return difference > 0 ? `+${difference}` : difference;
}

fs.readFile('data/monthly.json', 'utf-8', (err, rawData) => {
	if (err) throw err;

	// Parse data string into JSON
	const data = JSON.parse(rawData)

	// Pull the two years from the data, leaving the month behind.
	const 	years = data.columns.slice(1,data.columns.length - 1),
			shootings = data.data;

	// Now create a variable for each row in our table, and seed it with the markup needed	
	let rowMonth = `<tr class='month-table__month'><td></td>`, 
		rowLast = `<tr class='month-table__current-year'><td>${years[0]}</td>`,
		rowCurrent=`<tr class='month-table__last-year'><td>${years[1]}</td>`,
		rowDifference = `<tr class='month-table__difference'><td></td>`;

	shootings.forEach(month => {
		// Add the totals for each year's month into their respective variable homes
		rowLast += `<td data-title="${years[1]}">${month.totalLastYear}</td>`;
		rowCurrent += month.totalCurrentYear > 0 ? `<td data-title="${years[0]}">${month.totalCurrentYear}</td>` : '<td  data-title="${years[0]}"></td>';
		rowMonth += `<td>${ monthFormatter(parseInt(month.month), false) }</td>`
		if (month.difference != undefined){
			// if there is a difference, add a cell with a bar and label;
			const 	difference = month.difference,
					diffClass = difference > 0 ? 'diff diff--negative' : 'diff diff--positive';
			
			rowDifference += `<td class='bar-wrapper'  data-title='Difference'>
				<span class='${diffClass}'>${ formatDifference(difference) }</span>
			</td>`;

		} else {

			// if there is no difference, just skip it by adding an empty cell
			rowDifference += `<td data-title='Difference'></td>`;
		}
	
	})

	const tableStringDesktop = `<table class='month-table month-table--desktop'>
		<thead>${rowMonth}</tr></thead>
		<tbody>
			${rowCurrent}</tr>
			${rowLast}</tr>
			${rowDifference}</tr>
		</tbody>
	</table>`;

	let tableStringMobile = `<table class='month-table month-table--mobile'><thead></thead><tbody>`;


	shootings.forEach(month => {
		const 	difference = month.difference != undefined ? month.difference : "",
				currentYearCell = month.difference != undefined ? month.totalCurrentYear : "n/a";

				let rowClass = "row";

				if (month.difference != undefined){
					// Only color the month if real data exists for it. Color it red for increase and green for decrease
					rowClass =  month.difference < 0 ? 'row row--negative' : 'row row--positive';
				}

		tableStringMobile += `
		<tr class='${rowClass}'>
			<td data-title="month">${ monthFormatter(parseInt(month.month), true) }</td>
			<td data-title="${years[0]}">${month.totalLastYear}</td>
			<td data-title="${years[1]}">${currentYearCell}</td>
			<td data-title="Difference">${formatDifference(difference)}</td>
		</tr>`;
	});

	tableStringMobile += "</tbody></table>";


	const tableString =  minify(`${tableStringDesktop}${tableStringMobile}`,{
		collapseWhitespace:true,
		collapseInlineTagWhitespace:true
	});

	fs.writeFile('subtemplates/_monthly-table.html', tableString, err =>{
		if (err) throw err;
	})


	// Also, kick out a small sub to be a legend
	// const legendString = minify(`<dl class='legend'>
	// <dt>
	// 	<span class='legend__dot legend__dot--last-year'></span>
	// </dt>
	// <dd>${years[0]}</dd>
	// <dt>
	// 	<span class='legend__dot legend__dot--current-year'></span>
	// </dt>
	// <dd>${years[1]}</dd></dl>`,{
	// 	collapseWhitespace:true,
	// 	collapseInlineTagWhitespace:true
	// });

	// fs.writeFile('subtemplates/_monthly-legend.html', legendString, err =>{
	// 	if (err) throw err;
	// })
});

/*



*/