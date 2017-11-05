module.exports = function validateCoordinates(coord){
	// takes an array of [lat, lng] and returns true if they are valid coordinates. 
	// In this case, we're just looking for alpha characters. They should not be there.

    var reg = new RegExp(/[a-z]/i);
    if (reg.exec(coord[0]) == null && reg.exec(coord[1]) == null){
    	return true;
    }
	return false;
}