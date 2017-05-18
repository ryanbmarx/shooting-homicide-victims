//This makes jquery work. 
var $ = require('jQuery');

//Sets class for shootings marker div
var myIcon = L.divIcon({className: 'shooting-icon'});

//Style for community areas
var commStyle = {
    "fillColor": "#FFF",
    "color": "#222222",
    "weight": 3,
    "opacity": 0.5
};

// Sets up map and sets view and initial zoom
var map = L.map('map').setView([41.838299, -87.706953],11);

// Sets up baselayer using older custom Trib tiles
L.tileLayer(
  'http://{s}.tribapps.com/chicago-print/{z}/{x}/{y}.png', {
    subdomains: ['maps1'],
    attribution: 'Map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 16,
    minZoom: 9
  }).addTo(map);

//adds city mask
L.tileLayer(
  "http://media.apps.chicagotribune.com/maptiles/chicago-mask/{z}/{x}/{y}.png",
  { maxZoom: 16, minZoom: 9, opacity: 0.5 }).addTo(map);

//FOLLOWING CODE USES JQUERY TO LOAD GEOJSON
//load GeoJSON from an external file using jquery
// $.getJSON("data/commareas.geojson",function(hoodData){
// 	L.geoJson( hoodData, {
// 		style: commStyle
// 	}).addTo(map);
// });

// $.getJSON("data/locations.geojson",function(data){
// 	// add GeoJSON layer to the map once the file is loaded
// 	L.geoJson(data,{
// 	      pointToLayer: function(feature,latlng){
// 	        var marker = L.marker(latlng,{icon: myIcon});
// 	        marker.bindPopup(feature.properties.Location + '<br/>' + feature.properties.Date);
// 	        return marker;
// 	      }
// 	}).addTo(map);
// });

//THIS CODE USES VANILLA JAVASCRIPT TO LOAD THE GEOJSON
function getGeoJson(url){
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      var data = JSON.parse(request.responseText);
      L.geoJson(data,{
        pointToLayer: function(feature,latlng){
          var marker = L.marker(latlng,{icon: myIcon});
          marker.bindPopup(feature.properties.Location + '<br/>' + feature.properties.Date);
          return marker;
        }
      }).addTo(map);
    } else {
      // We reached our target server, but it returned an error
    }
  };

  request.onerror = function() {
    // There was a connection error of some sort
  };

  request.send();
};

//THIS WORKS IN BETA NOT IN P2P
//getGeoJson('data/locations.geojson');
//getGeoJson('data/commareas.geojson');


getGeoJson("http://" + window.ROOT_URL + "/data/locations.geojson");
getGeoJson('http://' + window.ROOT_URL + '/data/commareas.geojson');


