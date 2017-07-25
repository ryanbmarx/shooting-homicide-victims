// import * as L from 'leaflet';
import getTribColor from './getTribColors.js';
import CrimeSite from './crime-site.js';
// import {csv} from 'd3';
// import countBy from 'lodash.countby';


window.addEventListener('load', e => {

  const crimeSite = new CrimeSite({
    ytd: document.querySelector('#ytd'),
    monthly: document.querySelector('#monthly'),
    map:document.querySelector('#map'),
    victimList: document.querySelector('#map-victims'),
    mapLegendButtons:document.querySelectorAll('.map-legend__button'),
    ROOT_URL: window.ROOT_URL,
    currentColor: getTribColor('trib-blue2'),
    otherColor: getTribColor('trib-gray4'),
    fatalColor: getTribColor('trib-red2')
  })
})

