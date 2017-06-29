import * as L from 'leaflet';
import "leaflet-providers";
import {timeParse, timeFormat} from 'd3';
require('waypoints/lib/noframework.waypoints.min');


class ShootingsMap{
	constructor(options){
		const 	app = this, 
				container = options.container,
				data = options.data,
				iconColor = options.currentColor,
				width = 10;

		//SETS UP MAP

		app.map =  L.map(container,{
			center: [41.838299, -87.706953],
			zoom: 11,
			scrollWheelZoom:false,
			maxZoom:16,
		    renderer: L.canvas({padding:.05})

		});

		// This is using an npm plugin. Can be adjusted for many map types.
		// https://leaflet-extras.github.io/leaflet-providers/preview/

		L.tileLayer.provider('Stamen.TonerBackground').addTo(app.map);

		//ADDS CITY MASK
		L.tileLayer( "http://media.apps.chicagotribune.com/maptiles/chicago-mask/{z}/{x}/{y}.png", { 
			maxZoom: 16, 
			minZoom: 10, 
			opacity: 0.5 
		}).addTo(app.map);

		app.fatalShootingMarkers = L.layerGroup();
		app.nonFatalShootingMarkers = L.layerGroup();
		app.highlightedShootings = L.layerGroup(); // Using a layer group, we easily can locate/remove highlighted shootings 
		data.forEach(shooting => {
			
			const 	isFatal = parseInt(shooting['isFatal']) == 1 ? true : false;

			if(shooting.lat && shooting.long){
				const shootingMarker = L.circleMarker({
					lat:parseFloat(shooting.lat),
					lng:parseFloat(shooting.long)
				},{
					radius: 5,
					stroke:false,
					fill: true,
					fillColor: isFatal ? options.fatalColor : options.currentColor,
					fillOpacity: isFatal ? .4 : .2
				})
				// .bindPopup(customPopup(shooting));
	
				shootingMarker.shootingID = shooting.uniqueID;

				if (isFatal){
					shootingMarker.addTo(app.fatalShootingMarkers);
				} else {
					shootingMarker.addTo(app.nonFatalShootingMarkers);	
				}
				
			}
		})
		app.nonFatalShootingMarkers.addTo(app.map);
		app.fatalShootingMarkers.addTo(app.map);
		app.highlightedShootings.addTo(app.map)

		// app.highlightShooting(16856);

		// init the highlight event listener if the window is not mobile or tablet.

		if (window.innerWidth >= 850){
			const victims = options.victimList.querySelectorAll('ul li');
			
			for (let i = 0; i < victims.length; i++) {
				const victim = victims[i];
				new Waypoint({
					element: victim,
					handler: function(direction){
						const shootingID = this.element.dataset.shootingId;
						app.highlightShooting(shootingID);
	
						// Toggle highlight classes on the list, so the current one is shown.
						const highlightedVictim = document.querySelector('li.victim.victim--highlight');
						if (highlightedVictim != null) highlightedVictim.classList.remove('victim--highlight');
						this.element.classList.add('victim--highlight');
	
					},
					context: options.victimList,
					offset: "200px"
	
				});
			}
		}

		// Init the legend/buttons

		const legendButtons = options.legendButtons;
		legendButtons.forEach(button => {
			button.addEventListener('click', function(e) {
				this.classList.toggle('map-legend__button--checked');

				const showMe = this.dataset.toggle;
				
				if (app.map.hasLayer(app[showMe])){
					app[showMe].removeFrom(app.map);
				} else {
					app[showMe].addTo(app.map);
				}
			})
		})
	}

	highlightShooting(shootingID){

		const 	app = this; 

		app.fatalShootingMarkers.eachLayer( l => {
			if (parseInt(l.shootingID) == shootingID) {
				// First, remove all highlighted shootings
				app.highlightedShootings.clearLayers();
				
				// Then clone the desired layer.
				const newIcon = l;
				
				// Give it the highlighted style and add it to the highlighted LayerGroup()
				newIcon.setStyle({
					radius: 10,
					stroke:true,
					strokeWidth:1,
					color:'black',
					fill: true,
					fillOpacity: .8
				}).addTo(app.highlightedShootings);
				app.map.panTo(l.getLatLng());
			};
		})
	}
}

module.exports = ShootingsMap;