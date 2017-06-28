const 	d3 = require('d3'),
		fs = require('fs'),
		minify = require('html-minifier').minify;


function monthFormatter(month){

	// takes a month as number and returns AP style abbreviation. If the window width is too small, then it returns an even shorter version.
	
	const months = {
		0:{ap: "Jan.", short:"J"},
		1:{ap: "Feb.", short:"F"},
		2:{ap: "March", short:"M"},
		3:{ap: "April", short:"A"},
		4:{ap: "May", short:"M"},
		5:{ap: "June", short:"J"},
		6:{ap: "July", short:"J"},
		7:{ap: "Aug.", short:"A"},
		8:{ap: "Sept.", short:"S"},
		9:{ap: "Oct.", short:"O"},
		10:{ap: "Nov.", short:"N"},
		11:{ap: "Dec.", short:"D"}
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
		rowLast += `<td>${month.totalLastYear}</td>`;
		rowCurrent += month.totalCurrentYear > 0 ? `<td>${month.totalCurrentYear}</td>` : '<td></td>';
		rowMonth += `<td>${ monthFormatter(parseInt(month.month)) }</td>`
		if (month.difference != undefined){
			// if there is a difference, add a cell with a bar and label;
			const 	difference = month.difference,
					diffClass = difference > 0 ? 'diff diff--negative' : 'diff diff--positive';
			
			rowDifference += `<td class='bar-wrapper'>
				<span class='${diffClass}'>${ formatDifference(difference) }</span>
			</td>`;

		} else {

			// if there is no difference, just skip it by adding an empty cell
			rowDifference += `<td></td>`;
		}
	
	})

	const tableString =  minify(`<table class='month-table'>${rowMonth}</tr>${rowCurrent}</tr>${rowLast}</tr>${rowDifference}</tr></table>`,{
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