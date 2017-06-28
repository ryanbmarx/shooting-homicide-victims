const 	d3 = require('d3'),
		fs = require('fs'),
		minify = require('html-minifier').minify;


fs.readFile('data/monthly.json', 'utf-8', (err, rawData) => {
	if (err) throw err;

	// Parse data string into JSON
	const data = JSON.parse(rawData)

	// Pull the two years from the data
	const 	years = data.columns.slice(1,data.columns.length),
			shootings = data.data;
	
	let rowLast = `<tr><td>${years[0]}</td>`,
		rowCurrent=`<tr><td>${years[1]}</td>`;

	shootings.forEach(month => {
		rowLast += `<td>${month.totalLastYear}</td>`;
		rowCurrent += month.totalCurrentYear > 0 ? `<td>${month.totalCurrentYear}</td>` : '<td></td>';
	})

	const tableString =  minify(`<table>${rowCurrent}${rowLast}</table>`,{
		collapseWhitespace:true,
		collapseInlineTagWhitespace:true
	});

	fs.writeFile('subtemplates/_monthly-table.html', tableString, err =>{
		if (err) throw err;
	})

	const legendString = minify(`<dl class='legend'>
	<dt>
		<span class='legend__dot legend__dot--last-year'></span>
	</dt>
	<dd>${years[0]}</dd>
	<dt>
		<span class='legend__dot legend__dot--current-year'></span>
	</dt>
	<dd>${years[1]}</dd></dl>`,{
		collapseWhitespace:true,
		collapseInlineTagWhitespace:true
	});

	fs.writeFile('subtemplates/_monthly-legend.html', legendString, err =>{
		if (err) throw err;
	})
});

/*



*/