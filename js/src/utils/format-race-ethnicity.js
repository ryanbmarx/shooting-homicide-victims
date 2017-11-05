module.exports = function formatRaceEthnicity(str){

	// A simple little lookup which takes a race/ethnicity and 
	// returns a human-readable string
	switch (str){
		case "B":
			return "Black, not hispanic";
			break;
		case "W(H)":
			return "Hispanic";
			break;
		case "W":
			return "White, not hispanic"
			break;
		case "B(H)":
			return "Black, hispanic";
			break;
		case "A":
			return "Asian";
			break;
	}
	return str;
}
