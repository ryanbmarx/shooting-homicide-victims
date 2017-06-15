// import {csv} from 'd3';
import * as L from 'leaflet';
import CrimeSite from './crime-site.js'
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

//ADDS TRIB BASELAYER
L.tileLayer(
  'http://{s}.tribapps.com/chicago-print/{z}/{x}/{y}.png', {
    subdomains: ['maps1'],
    attribution: 'Map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 16,
    minZoom: 10
  }).addTo(map);

//ADDS CITY MASK
L.tileLayer(
  "http://media.apps.chicagotribune.com/maptiles/chicago-mask/{z}/{x}/{y}.png",
  { maxZoom: 16, minZoom: 10, opacity: 0.5 }).addTo(map);

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
          //CREATES POPUP
          marker.bindPopup(feature.properties.Location + '<br/>' + 
            feature.properties.Date + '<br/>' +
            '<a href="' + feature.properties.Link + '" target="_blank">Read the story &raquo;</a>');
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

//MAPS LAYERS
getPointGeoJson("http://" + window.ROOT_URL + "/data/locations.geojson");
getShapeGeoJson('http://' + window.ROOT_URL + '/data/commareas.geojson');
*/

window.addEventListener('load', e => {
  console.log('loaded');

  const crimeSite = new CrimeSite({
    ytd: document.querySelector('#ytd'),
    monthly: document.querySelector('#monthly'),
    ROOT_URL: window.ROOT_URL
  })
  
})

