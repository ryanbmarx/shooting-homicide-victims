import * as d3 from 'd3'
import getTribColor from '../utils/getTribColors.js';
import getTextColor from '../utils/get-text-color.js';


class TreeMap{
	constructor(options){
		const app = this;
		app.options = options;

		const 	data = options.data,
				container = d3.select(app.options.container),
				legendWidth = 150,
				bbox = app.options.container.getBoundingClientRect(),
				width = bbox.width - legendWidth,
				height = bbox.height,
				margin = app.options.innerMargins,
				innerHeight = height - margin.top - margin.bottom,
				innerWidth = width - margin.right - margin.left,
				colors = [
					getTribColor('trib_blue2'),
					getTribColor('trib_blue3'),
					getTribColor('trib_blue5'),
					getTribColor('trib_blue_gray'),
					getTribColor('trib_blue1'),
					getTribColor('trib_blue4'),
					getTribColor('trib_green2'),
					getTribColor('trib_green4'),
				];
		


	/*	
	My data for the treemap ends up looking like this:

	{
		name: "violence", 
		children:[
			{x: "Stabbing", y: 18}
			{x: "Unknown", y: 21}
			{x: "Shot", y: 405}
			{x: "Other", y: 12, causes: Array(7)}
		]
	}

	When I created the data, I chose to use attributes `x` (data labels, or "x axis") and `y` (data values, or "y axis")

	*/

		const colorScale = d3.scaleOrdinal()
			.range(colors)

		/*
		Then, the two main pieces of D3 code for treemaps. This is the generator, 
		same as you might make a line generator for a fever chart or an arc generator 
		for a pie chart.
		*/

		const treemap = d3.treemap()
			// .tile(d3.treemapResquarify)
			.size([innerWidth, innerHeight]) // This 2-item array carries the dimensions of each chart's container.
			.round(true)
			.paddingInner(2) // The space between nodes. Gives the look of a border```

		// Also, you need to create a hierarchy object, which translates your data into a d3-readable order
		const rt = d3.hierarchy(data, d => d.children)
			.sum(d => d.y)
			.sort((a,b) => {
				/*

					This lets you control the order in which the boxes are rendered. 
					At present, the code will make the largest box last, on the right.
					
					From the d3 docs:
 					The specified function is passed two nodes a and b to compare. If a should be 
 					before b, the function must return a value less than zero; if b should be before 
 					a, the function must return a value greater than zero; otherwise, the relative 
 					order of a and b are not specified
				*/
				return a.data.y - b.data.y;
			});

		// Combine the two treemap elements into D3's treemap object.
		const violenceTree = treemap(rt);
		

		// This is pretty vanilla d3 stuff ... take the container, append the SVG, etc.
		const svg = container
			.append('svg')
			.attr('width', width)
			.attr('height', height);

		const chartInner = svg
			.append('g')
			.classed('chart-inner', true)
			.attr('width', innerWidth)
			.attr('height', innerHeight)
			.attr('transform', `translate(${margin.left}, ${margin.top})`);

		const legend = container.insert('dl')
			.classed('causes-legend', true);


		// We're going to cheat the order a little bit. Our root node has ordered the 
		// nodes and given them coordinates already, but because we are building the 
		// legend, too, we want that to have a different (inverted) order. So we'll flip it
		// and do the data join on that array.

		const cell = chartInner.selectAll('g')
			.data(violenceTree.leaves().reverse())
			.enter()
			.append('g')
	      	.attr("transform", function(d) { 
	      		// The coordinates of each node in the treemap are calculated by d3 
	      		// and stashed in the data. We're creating a <g> for each node/rect
	      		// And moving them into position with a transform:translate()
	      		return "translate(" + d.x0 + "," + d.y0 + ")"; 
	      	});

	    // This puts a rect inside each <g>
		cell.append('rect')
			.attr("width", function(d) { return d.x1 - d.x0; }) // Coordinates math to calc width
			.attr("height", function(d) { return d.y1 - d.y0; }) // Coordinates math to calc height
			.attr("fill", d => colorScale(d['data']['x'])) // D3 stores original data in d.data, and we've made a scale using the label categories, correlating them with colors.
			.each(d => {

				// We're building the legend here, versus using a seperate function,
				// because the scale has more colors than we need, and we only want to
				// output the colors we are using. For each node, append a <dt>, <dd> combo 
				// for each one. See colorScale above about accessing our original data 

				legend.append('dt')
					.append('span')
					.classed('causes-legend__box', true)
					.style('background-color', colorScale(d['data']['x']));
				legend.append('dd')
					.text(`${d['data']['x']} (${d['data']['y']})`);

			});

		// Add a label for each node/rect
		cell.append('text')
			.classed('tree-label', true)
			.attr('x', d => (d.x1 - d.x0)/2) // center the label horiz
			.attr('y', d => (d.y1 - d.y0)/2) // center the label vert
			.attr('dy', ".35em") // Shift the text along the baseline
			.attr('text-anchor', 'middle')
			.style('fill', d => getTextColor(colorScale(d['data']['x']), true)) // This is a nifty function that picks whichever text color is more readable on the rect fill (white/black). See the comments in the function for more. 
			.text(d => d.data.y)
			.each( function(d, i) {
				// This is for aesthetic cleanup, but if the node/box is either
				// too skinny or too short to fit the label, then remove the label.
				// The raw #s are in the legend, anyhow.
				const 	textWidth = this.getBBox().width, 
						textHeight = this.getBBox().height,
						nodeWidth = d.x1 - d.x0,
						nodeHeight= d.y1 - d.y0;
				if (nodeWidth < textWidth || nodeHeight < textHeight) this.remove();
			})

		// Update the note, explaining what others includes.
		d3.select(container.node().parentNode)
			.append('p')
			.classed('note', true)
			.text(getOtherNoteText(data));


	}

}

function getOtherNoteText(data) {
	
	const other = data.children.find(function(el){
		// Pull the "other" violence type from our chart data. 
		// We've stashed a list of the "other" crimes in there.
		return el.x == "Other";
	})

	let noteString = `Note: "Other" collects categories representing less than 1 percent each of total homicides. This incldues `;

	other.causes.forEach((cause, index) => {
		// Iterate over the "other"	causes of death and concat a note to readers.
		noteString += cause.toLowerCase();
		if (index <= other.causes.length - 3) {
			// add a comma after each item, unless it is the second-to-last or final item
			noteString += ", ";
		} else if (index == other.causes.length - 2) {
			// add an and if it is the second-to-last item in the list. 
			// This makes our serial list grammatically correct. And
			// we'll use an Oxford comma because nobody is watching us here.
			noteString += ", and ";
		};
	})

	return noteString + ".";
}

module.exports = TreeMap;