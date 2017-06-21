function monthFormatter(month){

	// takes a month as number and returns AP style abbreviation. If the window width is too small, then it returns an even shorter version.
	
	const months = {
		1:{ap: "Jan.", short:"J"},
		2:{ap: "Feb.", short:"F"},
		3:{ap: "March", short:"M"},
		4:{ap: "April", short:"A"},
		5:{ap: "May", short:"M"},
		6:{ap: "June", short:"J"},
		7:{ap: "July", short:"J"},
		8:{ap: "Aug.", short:"A"},
		9:{ap: "Sept.", short:"S"},
		10:{ap: "Oct.", short:"O"},
		11:{ap: "Nov.", short:"N"},
		12:{ap: "Dec.", short:"D"}
	}

	try{
		return window.innerWidth > 850 ? months[month]['ap'] : months[month]['short'];
	}

	catch(TypeError){
		console.log('no month 13')
	}
}

module.exports = monthFormatter;