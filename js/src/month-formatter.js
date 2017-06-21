function monthFormatter(month){

	// takes a month as number and returns AP style abbreviation. If the window width is too small, then it returns an even shorter version.
	
	const months = {
		0:{ap: "Jan.", short:"J"},
		1:{ap: "Feb.", short:"F"},
		2:{ap: "March", short:"M"},
		3:{ap: "April", short:"A"},
		4:{ap: "May", short:"M"},
		5:{ap: "June", short:"J"},
		6:{ap: "July", short:"J"},
		7:{ap: "Aug.", short:"A"},
		8:{ap: "Sept.", short:"S"},
		9:{ap: "Oct.", short:"O"},
		10:{ap: "Nov.", short:"N"},
		11:{ap: "Dec.", short:"D"}
	}

	try{
		return window.innerWidth > 850 ? months[month]['ap'] : months[month]['short'];
	}

	catch(TypeError){
		console.log('no month 13')
	}
}

module.exports = monthFormatter;