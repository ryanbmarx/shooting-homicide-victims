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

		const shootingMarkers = L.layerGroup();

		data.forEach(shooting => {
			
			const 	isFatal = parseInt(shooting['isFatal']) == 1 ? true : false,
					// victimFill = isFatal ? options.fatalColor : options.currentColor,
					victimFill = "yellow",
					victimOpacity = isFatal ? .7 : .2;

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
					fillOpacity: isFatal ? .7 : .2
				})
				// .bindPopup(customPopup(shooting));
	
	
				shootingMarker.addTo(shootingMarkers)
			}
		})
		shootingMarkers.addTo(map);
	}
}

module.exports = ShootingsMap;


/*
var myIcon = L.divIcon({className: 'shooting-icon'});

//COMMUNITY AREA STYLING
var commStyle = {
    "fillColor": "#FFF",
    "color": "#222222",
    "weight": 3,
    "opacity": 0.5
};

//SETS UP MAP
var map = L.map('map', {scrollWheelZoom: false}).setView([41.838299, -87.706953],11);



//FUNCTION FETCHES COMMUNITY AREAS. CAN ALSO USE TO FETCH OTHER POLYGON DATA
function getShapeGeoJson(url){
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      L.geoJson( data, {
        style: commStyle
      }).addTo(map);
    } else {
    }
  };

  request.onerror = function() {
  };

  request.send();
};

//MAPS LAYERS
getPointGeoJson("http://" + window.ROOT_URL + "/data/locations.geojson");
getShapeGeoJson('http://' + window.ROOT_URL + '/data/commareas.geojson');
*/