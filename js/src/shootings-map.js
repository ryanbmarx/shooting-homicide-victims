import * as L from 'leaflet';
import "leaflet-providers";
import {timeParse, timeFormat} from 'd3';
require('waypoints/lib/noframework.waypoints.min');


function setShootingMarkerOpacity(markerOpacity, app){	
	const markerGroups = [app.fatalShootingMarkers, app.nonFatalShootingMarkers];
	markerGroups.forEach(group =>{
		group.eachLayer( l => {
			l.setStyle({fillOpacity:markerOpacity});
		});	
	})
	
}

class ShootingsMap{
	constructor(options){
		const 	app = this, 
				container = options.container,
				data = options.data,
				iconColor = options.currentColor,
				width = 10;
		
		app.options = options;

		//SETS UP MAP
		app.map =  L.map(container,{
			center: [41.838299, -87.706953],
			zoom: 10,
			scrollWheelZoom:false,
			maxZoom:16,
		    renderer: L.canvas({padding:.05})

		});

		// This is using an npm plugin. Can be adjusted for many map types.
		// https://leaflet-extras.github.io/leaflet-providers/preview/

		L.tileLayer.provider('Stamen.TonerBackground').addTo(app.map);

		// ADDS CITY MASK
		L.tileLayer( "http://media.apps.chicagotribune.com/maptiles/chicago-mask/{z}/{x}/{y}.png", { 
			maxZoom: 16, 
			minZoom: 10, 
			opacity: 0.5 
		}).addTo(app.map);

		app.fatalShootingMarkers = L.layerGroup();
		app.nonFatalShootingMarkers = L.layerGroup();
		// app.highlightedShootings = L.layerGroup(); // Using a layer group, we easily can locate/remove highlighted shootings 
		data.forEach(shooting => {
			
			const 	isFatal = parseInt(shooting['IS_FATAL']) == 1 ? true : false;

			if(shooting['LAT'] && shooting['LNG']){
				const shootingMarker = L.circleMarker({
					lat:parseFloat(shooting['LAT']),
					lng:parseFloat(shooting['LNG'])
				},{
					radius: 5,
					stroke:false,
					fill: true,
					fillColor: isFatal ? options.fatalColor : options.currentColor,
					fillOpacity: isFatal ? .4 : .2
				}).on('click', function(e, shooting){
					console.log(e.target.shootingID, document.querySelector(`[data-shooting-id="${e.target.shootingID}"]`));
					
					const 	selectedVictim = document.querySelector(`[data-shooting-id="${e.target.shootingID}"]`);

					// The list of victims only is fatal shootings. Similarly, the querySelector will return null 
					// if a nonfatal shooting is picked. We don't want to error out in that case, so check first 
					// before highlighting a shooting.
					
					if (selectedVictim != null){

						// Select the victim list <li> with the intended victim ID. Also get that offsetTop
						 const selectedVictimTop = selectedVictim.offsetTop - 30; // This offset centers the <li> on the triangle.

						// Scroll the list/s parent div to the desired victim, which should trigger the map
						// to highlight the victim using the waypoints code.
						document.querySelector('#map-victims').scrollTop = selectedVictimTop;
					}
				});
	
				shootingMarker.shootingID = parseInt(shooting['ID']);

				if (isFatal){ 
					shootingMarker.addTo(app.fatalShootingMarkers);
				} else {
					shootingMarker.addTo(app.nonFatalShootingMarkers);	
				}
				
			}
		})
		app.nonFatalShootingMarkers.addTo(app.map);
		app.fatalShootingMarkers.addTo(app.map);
		
		// We want to tweak the opacity of the markers. By default they are 20% opaque, making
		// them easier to read in larger bunches, but when we zoom in, and there is more space 
		// between them, we can make them darker, which is easier to read in smaller groups.

		app.map.on('zoomend', e => {
			const currentZoom = app.map.getZoom();
			if (currentZoom > 12){
				setShootingMarkerOpacity(.55, app)
			} else {
				setShootingMarkerOpacity(.2, app)
			}
		})

		// init the highlight event listener if the window is not mobile or tablet.
		if (window.innerWidth >= 850){
			const victims = options.victimList.querySelectorAll('ul li');
			for (let i = 0; i < victims.length; i++) {
				const victim = victims[i];

				// Set the waypoint for scrolling down	
				new Waypoint({
					element: victim,
					handler: function(direction){
						if (direction == "down"){
							const shootingID = parseInt(this.element.dataset.shootingId);
							
							app.highlightShooting(shootingID);
		
							// Toggle highlight classes on the list, so the current one is shown.
							const highlightedVictim = document.querySelector('li.victim.victim--highlight');
							if (highlightedVictim != null) highlightedVictim.classList.remove('victim--highlight');
							this.element.classList.add('victim--highlight');
						}	
					},
					context: options.victimList,
					offset: 80
				});

				// Need a new offset, thus a new waypoint, for scrolling back up the list.
				new Waypoint({
					element: victim,
					handler: function(direction){
						if (direction == "up"){
							const shootingID = parseInt(this.element.dataset.shootingId);
							
							app.highlightShooting(shootingID);
		
							// Toggle highlight classes on the list, so the current one is shown.
							const highlightedVictim = document.querySelector('li.victim.victim--highlight');
							if (highlightedVictim != null) highlightedVictim.classList.remove('victim--highlight');
							this.element.classList.add('victim--highlight');
						}	
					},
					context: options.victimList,
					offset: 20
				});

			}
		}

		// Init the legend/buttons

		const legendButtons = options.legendButtons;
		for (let i=0; i < legendButtons.length; i++){
			// using for() loop here sted .forEach() because of stupid IE11
			const button = legendButtons[i];
			button.addEventListener('click', function(e) {
				this.classList.toggle('map-legend__button--checked');

				const showMe = this.dataset.toggle;
				
				if (app.map.hasLayer(app[showMe])){
					app[showMe].removeFrom(app.map);
				} else {
					app[showMe].addTo(app.map);
				}

				// Make sure the highlighted shooting, if there is one, sits atop all the map layers.
				if (app.shootingHighlightIcon != undefined) app.shootingHighlightIcon.bringToFront();
			});
		}
	}

	highlightShooting(shootingID){
		const 	app = this; 

		app.fatalShootingMarkers.eachLayer( l => {
			if (l['shootingID'] == shootingID) {
				// First, remove the highlighted shooting, if it exists
				if (app.shootingHighlightIcon != undefined) app.shootingHighlightIcon.removeFrom(app.map);

				// Give it the highlighted style and add it to the highlighted LayerGroup()
				app.shootingHighlightIcon = L.circleMarker(l.getLatLng(),{
					radius: 10,
					stroke:true,
					strokeWidth:1,
					color:'black',
					fill: true,
					fillColor: app.options.fatalColor,
					fillOpacity: .8
				}).addTo(app.map);

				// Make sure the map is showing the marker
				app.map.panTo(l.getLatLng());
			}
		});
	}
}

module.exports = ShootingsMap;