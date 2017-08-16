import * as d3 from 'd3'


class TreeMap{
	constructor(options){
		const app = this;
		app.options = options;

		const 	data = options.data,
				container = d3.select(app.options.container),
				bbox = app.options.container.getBoundingClientRect(),
				width = bbox.width,
				height = bbox.height,
				margin = app.options.innerMargins,
				innerHeight = height - margin.top - margin.bottom,
				innerWidth = width - margin.right - margin.left;

		console.log(data);

		

		const treemap = d3.treemap()
			.tile(d3.treemapResquarify)
			.size([innerWidth, innerHeight])
			.round(true)
			.paddingInner(1);


	}
}

module.exports = TreeMap;