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

//FUNCTION FETCHES SHOOTING LOCATIONS
function getPointGeoJson(url){
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      L.geoJson(data,{
        pointToLayer: function(feature,latlng){
          var marker = L.marker(latlng,{icon: myIcon});
          marker.bindPopup(feature.properties.Location + '<br/>' + feature.properties.Date);
          return marker;
        }
      }).addTo(map);
    } else {
    }
  };

  request.onerror = function() {
  };

  request.send();
};

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

getPointGeoJson("http://" + window.ROOT_URL + "/data/locations.geojson");
getShapeGeoJson('http://' + window.ROOT_URL + '/data/commareas.geojson');


