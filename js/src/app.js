import getTribColor from './utils/getTribColors.js';
import CrimeSite from './crime-site.js';

window.addEventListener('load', e => {

  const crimeSite = new CrimeSite({
    ROOT_URL: window.ROOT_URL,
    currentColor: getTribColor('trib-blue2'),
    otherColor: getTribColor('trib-gray4'),
    fatalColor: getTribColor('trib-red2'),
    version: window.version
  })
})

