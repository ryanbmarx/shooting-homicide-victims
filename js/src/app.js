//This makes jquery work. 
var $ = require('jQuery');

//This sets the shootings marker. Style it using .shooting-icon in css.
var myIcon = L.divIcon({className: 'shooting-icon'});

// Sets up map and sets view and initial zoom
var map = L.map('map').setView([41.875103,-87.619271],11);

// Sets up baselayer using older custom Trib tiles
L.tileLayer(
  'http://{s}.tribapps.com/chicago-print/{z}/{x}/{y}.png', {
    subdomains: ['maps1', 'maps2', 'maps3', 'maps4'],
    attribution: 'Map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 16,
    minZoom: 9
}).addTo(map);



//load GeoJSON from an external file using jquery
$.getJSON("data/commareas.geojson",function(hoodData){
	L.geoJson( hoodData ).addTo(map);
});

$.getJSON("data/locations.geojson",function(data){
	// add GeoJSON layer to the map once the file is loaded
	L.geoJson(data,{
	      pointToLayer: function(feature,latlng){
	        var marker = L.marker(latlng,{icon: myIcon});
	        marker.bindPopup(feature.properties.Location + '<br/>' + feature.properties.Date);
	        return marker;
	      }
	}).addTo(map);
});


