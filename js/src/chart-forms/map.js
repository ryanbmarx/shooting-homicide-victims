import * as L from 'leaflet';
import "leaflet-providers";
// require('leaflet.markercluster');
import {timeParse, timeFormat} from 'd3';
import validateCoordinates from '../utils/validate-coordinates.js'

// require('waypoints/lib/noframework.waypoints.min');

function formatSex(s){
	// We have room in here to accomadate others. If not specified, will return supplied value.
	if (s.length > 0){
		if (s.toUpperCase() == "M") return "male";
		if (s.toUpperCase() == "F") return "female";
		return s;
	}
	// If it is blank, skip it.
	return false;
}

function formatAge(a){
	if (a > 0) return `${a}-year-old`;
	if (a == 0) return 'Baby';
	return false;
}

function makePopupText(incident){
	const 	dateTimeParser = timeParse('%Y-%m-%d %H:%M:%S'),
			dateFormatter = timeFormat('%b %e'), // For when we don't know time
			dateTimeFormatter = timeFormat('%-I:%M %p, %b %e'), // For when we know time.
			inputDate = incident['HOUR'].length > 0 ? dateTimeParser(`${incident['DATE']} ${incident['HOUR']}`) : dateTimeParser(`${incident['DATE']} 00:01:00`),
			outputDate = incident['HOUR'].length > 0 ? dateTimeFormatter(inputDate) : dateFormatter(inputDate),
			sex = formatSex(incident['SEX']),
			age = formatAge(incident['AGE']);
			
	let victimString = "";
			
	victimString += `<p class='victim__date'>${outputDate}</p>`		

	if (age && sex) {
		victimString += `<p class='victim__desc'>${age} ${sex}</p>`;
	} else if (age && !sex){
		victimString += `<p class='victim__desc'>${age}</p>`;
	}  else if (!age && sex){
		victimString += `<p class='victim__desc'>${sex}</p>`;
	}
	
	return victimString;
}

function setIncidentMarkerOpacity(markerOpacity, app){	
	const markerGroups = [app.fatalIncidentMarkers, app.nonFatalIncidentMarkers];
	markerGroups.forEach(group =>{
		group.eachLayer( l => {
			l.setStyle({fillOpacity:markerOpacity});
		});	
	})
	
}

class ViolenceMap{
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

		app.fatalIncidentMarkers = L.layerGroup();
		app.nonFatalIncidentMarkers = L.layerGroup();
		
		data.forEach(incident => {
			// console.log(incident);

			const isFatal = parseInt(incident['IS_FATAL']) == 1 ? true : false;

			if(validateCoordinates(incident['LAT']) && validateCoordinates(incident['LNG'])){
				// Only proceed if we have valid coordinates

				const incidentMarker = L.circleMarker({
					lat:parseFloat(incident['LAT']),
					lng:parseFloat(incident['LNG'])
				},{
					radius: 5,
					stroke:false,
					fill: true,
					fillColor: isFatal ? options.fatalColor : options.currentColor,
					fillOpacity: isFatal ? .4 : .2
				});
	
				incidentMarker.incidentID = parseInt(incident['ID']);

				if (isFatal){ 
					incidentMarker.addTo(app.fatalIncidentMarkers);
				} else {
					incidentMarker.addTo(app.nonFatalIncidentMarkers);	
				}

				incidentMarker.bindPopup(makePopupText(incident));
				
			}
		})
		app.nonFatalIncidentMarkers.addTo(app.map);
		app.fatalIncidentMarkers.addTo(app.map);
		
		// We want to tweak the opacity of the markers. By default they are 20% opaque, making
		// them easier to read in larger bunches, but when we zoom in, and there is more space 
		// between them, we can make them darker, which is easier to read in smaller groups.

		app.map.on('zoomend', e => {
			const currentZoom = app.map.getZoom();
			if (currentZoom > 12){
				setIncidentMarkerOpacity(.55, app)
			} else {
				setIncidentMarkerOpacity(.2, app)
			}
		})

	

		// Init the legend/buttons, if there are any declared. If not, skip it.
		if (options.legendButtons){
			const legendButtons = options.legendButtons;
			for (let i=0; i < legendButtons.length; i++){
				// using for() loop here sted .forEach() because of stupid IE11
				const button = legendButtons[i];
				button.addEventListener('click', function(e) {
					// this.classList.toggle('map__legend-button--checked');
					this.dataset.checked = this.dataset.checked == "true" ? "false" : "true";


					const showMe = this.dataset.toggle;
					
					if (app.map.hasLayer(app[showMe])){
						app[showMe].removeFrom(app.map);
					} else {
						app[showMe].addTo(app.map);
					}
				});
			}
		}
	}
}

module.exports = ViolenceMap;