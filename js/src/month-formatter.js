function monthFormatter(month, version){

	// takes a month as number and returns AP style abbreviation. If the window width is too small, then it returns an even shorter version.
	
	const months = {
		0:{ap: "Jan.", short:"J", full:"January"},
		1:{ap: "Feb.", short:"F", full:"February"},
		2:{ap: "March", short:"M", full:"March"},
		3:{ap: "April", short:"A", full:"April"},
		4:{ap: "May", short:"M", full:"May"},
		5:{ap: "June", short:"J", full:"June"},
		6:{ap: "July", short:"J", full:"July"},
		7:{ap: "Aug.", short:"A", full:"August"},
		8:{ap: "Sept.", short:"S", full:"September"},
		9:{ap: "Oct.", short:"O", full:"October"},
		10:{ap: "Nov.", short:"N", full:"November"},
		11:{ap: "Dec.", short:"D", full:"December"}
	}

	try{
		if (version){
			// if the user has explicitly chosen a desired version,then return it.
			return months[month][version.toLowerCase()];
		} else {
			// If the user has not chosen a specific version, then give it your best guess.
			return window.innerWidth > 850 ? months[month]['ap'] : months[month]['short'];	
		}
		
	}

	catch(TypeError){
		console.log('no month 13')
	}
}

module.exports = monthFormatter;