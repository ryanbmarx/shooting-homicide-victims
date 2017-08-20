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
					getTribColor('trib_red2'),
					getTribColor('trib_orange'),
					getTribColor('trib_yellow1'),
					getTribColor('trib_blue2'),
					getTribColor('trib_blue3'),
					getTribColor('trib_blue5'),
					getTribColor('trib_green2'),
					getTribColor('trib_green4'),
					getTribColor('trib_blue_gray')
				];
		
		const colorScale = d3.scaleOrdinal()
			.range(colors)

		const treemap = d3.treemap()
			// .tile(d3.treemapResquarify)
			.size([innerWidth, innerHeight])
			.round(true)
			.paddingInner(2)

		const rt = d3.hierarchy(data, d => d.children)
			.sum(d => d.y)
			.sort((a,b) => {
				/*
					From the d3 docs:
 					The specified function is passed two nodes a and b to compare. If a should be 
 					before b, the function must return a value less than zero; if b should be before 
 					a, the function must return a value greater than zero; otherwise, the relative 
 					order of a and b are not specified
				*/
				return a.data.y - b.data.y;
			});

		const violenceTree = treemap(rt);
		
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
	      		return "translate(" + d.x0 + "," + d.y0 + ")"; 
	      	});

		cell.append('rect')
			.attr("width", function(d) { return d.x1 - d.x0; })
			.attr("height", function(d) { return d.y1 - d.y0; })
			.attr("fill", d => colorScale(d['data']['x']))
			.each(d => {
				// We're building the legend here, versus using a seperate function,
				// because the scale has more colors than we need, and we only want to
				// output the colors we are using.

				legend.append('dt')
					.append('span')
					.classed('causes-legend__box', true)
					.style('background-color', colorScale(d['data']['x']));
				legend.append('dd')
					.text(`${d['data']['x']} (${d['data']['y']})`);

			});

		cell.append('text')
			.classed('tree-label', true)
			.attr('x', d => (d.x1 - d.x0)/2)
			.attr('y', d => (d.y1 - d.y0)/2)
			.attr('dy', ".35em")
			.attr('text-anchor', 'middle')
			.style('fill', d => getTextColor(colorScale(d['data']['x']), true))
			.text(d => d.data.y)
			.each( function(d, i) {
				// This is for aesthetic cleanup, but if the node/box is either
				// too skinny or too short to fit the label, then remove the label.
				// The raw #s are in the legend, anyhow.
				const 	textWidth = this.getBBox().widthz, 
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

	let noteString = "Note: Other includes ";

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