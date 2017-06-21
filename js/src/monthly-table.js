import orderBy from 'lodash.orderby';

class MonthlyTable{
	// Takes two day-by-day data sets and converts it into a little monthly comparison table.
	constructor(options){
		const 	app = this, 
				data = options.data,
				years = orderBy(Object.keys(data), y => parseInt(y), 'desc');
		app.options = options;


		let tableString = "<table>";

		years.forEach(year => {
			tableString += `<tr><td><strong>${year}</strong></td>`;
			data[year].forEach(n => {
				tableString += `<td>${n}</td>`
			})
			tableString += `</tr>`;
		})
		tableString += "</table>";

		app.options.container.innerHTML = tableString;


	}
}

module.exports = MonthlyTable;