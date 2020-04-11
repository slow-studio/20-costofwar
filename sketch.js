function preload() {
	data = loadJSON('data/combined-dataset.json')
}

let totalIncidents

function setup() {
	noCanvas()

	totalIncidents = Object.keys(data).length
	print(`total incidents = ${totalIncidents}`)

	select("#visualisation").html("")
}

function draw() {
	if(frameCount<totalIncidents) {
		incidentCounter = frameCount % totalIncidents 
		irect(data, incidentCounter)
		select("#date").html(data[frameCount]["d"])
	} 
	else noLoop()
}

/* make a rectangle that shows an incident */

function irect (dataset, incidentCounter) {
	i = createDiv()
	i.parent('#visualisation');
	i.addClass('incidentDeathsRectangle')
	minDeaths = parseInt(dataset[incidentCounter]["K"])
	maxDeaths = parseInt(dataset[incidentCounter]["k"])
	avgDeaths = (minDeaths+maxDeaths)/2
	i.style("width", avgDeaths + "px")
	deaths_toPrint = (minDeaths===maxDeaths)?maxDeaths:[minDeaths,maxDeaths].join('–')
	
	i.attribute('incidentIndex', incidentCounter)
	// i.attribute('incidentCode', dataset[incidentCounter]["i"])

	if(dataset[incidentCounter]["n"].length>0) i.style("backgroundColor", colour_darkred)

}

/* for interacting with incident-rectangles */

colour_red = 'rgb(255,0,0)'
colour_green = 'rgb(0,255,0)'
colour_verydarkred = 'rgb(127,0,0)'
colour_darkred = 'rgb(200,0,0)'
colour_black = 'rgb(0,0,0)'

function hoverOnIncident(element) {
	incidentRowNumber = element.getAttribute("incidentIndex")
	incidentCode = data[incidentRowNumber]["i"]

	print("mouseover on # " + incidentCode)

	element.style.backgroundColor = colour_verydarkred

	enddate = data[incidentRowNumber]["d"]
	loc_info = data[incidentRowNumber]["l"]
	target_info = data[incidentRowNumber]["t"]
	minDeaths = data[incidentRowNumber]["k"]
	maxDeaths = data[incidentRowNumber]["K"]
	deaths_toPrint = (minDeaths===maxDeaths)?maxDeaths:[minDeaths,maxDeaths].join('–')
	names = data[incidentRowNumber]["n"]
	anyNamesKnown = names.length?true:false

	let poptext = ""
	poptext += "<span class='red'>Date</span><br> " + enddate + "<br><br>"
	poptext += "<span class='red'>Location</span><br> " + loc_info + "<br><br>"
	poptext += target_info?"<span class='red'>Target:</span> <br>" + target_info + "<br><br>":""
	poptext += "<span class='red'>Civilians killed</span><br> " + deaths_toPrint + "<br><br>"
	poptext += anyNamesKnown?"<span class='red'>Civilians identified</span>":""
	for(let i=0 ; i<names.length ; ++i) {
		name = names[i]["n"]
		age = names[i]["a"]
		if(age === "unknown") age = ""
		poptext += "<br><strong>" + name + "</strong> <small>"+ age + "</small>"
	}

	popup = createDiv(poptext).parent(element).class('popup')

}

function mousedownOnIncident(element) {
	// print("mouse-key pressed on # " + element.getAttribute("incidentCode"))

	element.style.backgroundColor = colour_darkred
}

function clickOnIncident(element) {
	// print("mouse clicked # " + element.getAttribute("incidentCode"))

	element.style.backgroundColor = colour_verydarkred
}

function leaveIncident(element) {
	// print("mouse left # " + element.getAttribute("incidentCode"))

	element.style.backgroundColor = colour_red

	/* delete any-and-all child elements (i.e., the popups) */
	while (element.firstChild) {
    	element.removeChild(element.firstChild);
	}
}