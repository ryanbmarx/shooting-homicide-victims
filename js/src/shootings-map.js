import * as L from 'leaflet';
import "leaflet-providers";
import {timeParse, timeFormat} from 'd3';


// function getShootingMarkerIcon(shooting){

// 		return L.divIcon({
// 			className:'shooting-icon',
// 			iconSize:10
// 		})	
// }

// function customPopup(shooting){
// 	console.log(shooting);
// 	const 	location = shooting['Shooting Location'],
// 			gender = shooting['Sex'],
// 			time = d3.parseTime(),
// 			date = "",
// 			link = shootings['Link'];
// 	let popupContent = `
// 		<div class='victim'>
// 		TIME, DATE
// 		Age, gender
// 		location
// 		<a href='' ></a>
// 		</div>
// 	`;

// 	return popupContent;
// }

class ShootingsMap{
	constructor(options){
		const 	app = this, 
				container = options.container,
				data = options.data,
				iconColor = options.currentColor,
				width = 10;

		console.log(options)

		//SETS UP MAP

		const map =  L.map(container,{
			center: [41.838299, -87.706953],
			zoom: 11,
			scrollWheelZoom:false,
			maxZoom:16,
		    renderer: L.canvas({padding:.05})

		});

		// This is using an npm plugin. Can be adjusted for many map types.
		// https://leaflet-extras.github.io/leaflet-providers/preview/

		L.tileLayer.provider('Stamen.TonerBackground').addTo(map);

		//ADDS CITY MASK
		L.tileLayer( "http://media.apps.chicagotribune.com/maptiles/chicago-mask/{z}/{x}/{y}.png", { 
			maxZoom: 16, 
			minZoom: 10, 
			opacity: 0.5 
		}).addTo(map);

		app.fatalShootingMarkers = L.layerGroup();
		app.nonFatalShootingMarkers = L.layerGroup();
		app.highlightedShootings = L.layerGroup(); // Using a layer group, we easily can locate/remove highlighted shootings 
		data.forEach(shooting => {
			
			const 	isFatal = parseInt(shooting['isFatal']) == 1 ? true : false;

			// console.log(shooting, parseFloat(shooting.lat), parseFloat(shooting.long));
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
		app.nonFatalShootingMarkers.addTo(map);
		app.fatalShootingMarkers.addTo(map);
		app.highlightedShootings.addTo(map)

		app.highlightShooting(16856);
	}

	highlightShooting(shootingID){
		// 16856
		console.log('highlighting ', shootingID);
		const 	app = this; 

		// console.log(app.fatalShootingMarkers.getLayer())

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
				
			};
		})
	}
}

module.exports = ShootingsMap;