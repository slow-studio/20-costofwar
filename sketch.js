const FRAMERATE = 10

function preload() {
	incidents = loadTable('data/ibc-incidents-2020-3-29-modified.csv', 'csv', 'header');
	individuals = loadTable('data/ibc-individuals-2020-3-29-modified.csv', 'csv', 'header');
}

function setup() {
	noCanvas()
	frameRate(FRAMERATE)
	
	totalIncidents = incidents.getRowCount()
	print("total incidents = " + totalIncidents)
	print("total deaths (minimum) = " + countTotalOfAllCellsInColumn(incidents, "Reported Minimum"))
	print("total deaths (maximum) = " + countTotalOfAllCellsInColumn(incidents, "Reported Maximum"))

	// find individuals
	incidents.addColumn('popuptext')
	for(i = 0 ; i < incidents.getRowCount() ; ++i) {
		if(i%1000==0 || i==(incidents.getRowCount()-1)) { print( "preparing data: " + parseInt(100*((i+1)/incidents.getRowCount())) + "% done." ) }
		iCode = incidents.get(i, 'IBC code')
		poptext = ""
		poptext += "<span class='red'>Date</span><br> " + incidents.get(i, 'End Date') + "<br><br>"
		poptext += "<span class='red'>Location</span><br> " + incidents.get(i, 'Location') + "<br><br>"
		if(incidents.get(i, 'Target')) {poptext += "<span class='red'>Target:</span> <br>" + incidents.get(i, 'Target') + "<br><br>"}
		minDeaths = parseInt(incidents.get(i, 'Reported Minimum'))
		maxDeaths = parseInt(incidents.get(i, 'Reported Maximum'))
		deaths_toPrint = (minDeaths===maxDeaths)?maxDeaths:[minDeaths,maxDeaths].join(/* an ndash, to represent 'to' */'–')
		poptext += "<span class='red'>Civilians killed</span><br> " + deaths_toPrint + "<br><br>"
		anyNamesKnown = false
		for(j = 0 ; j < individuals.getRowCount() ; ++j) {
			jCode = individuals.get(j, 'IBC code')
			if(jCode.startsWith(iCode)) { // i.e., we found an individual who'd been killed in that incident
				if(!anyNamesKnown) poptext += "<span class='red'>Civilians identified</span>"
				anyNamesKnown = true
				name = individuals.get(j,'Name or Identifying Details')
				name = "<strong>" + name + "</strong>"
				age = individuals.get(j,'Age')
				if(age === "unknown") age = ""
					else age = " <small>" + age + "</small>"
				addtext = name + age
				poptext = [poptext, addtext].join('<br>')
			}
		}
		incidents.set(i,'popuptext',poptext)
	}

	/*	print to console, to check if the data loaded correctly. */
	// print(incidents)
	// printTableAsArray(incidents)
}

function draw() {
	if(frameCount<totalIncidents) {
		incidentCounter = frameCount % totalIncidents 
		irect(incidents, incidentCounter)
		select("#date").html(incidents.get(frameCount,"End Date"))
	}
}

/* make a rectangle that shows an incident */

function irect (dataset, incidentCounter) {
	i = createDiv()
	i.parent('#visualisation');
	i.addClass('incidentDeathsRectangle')
	minDeaths = parseInt(dataset.getColumn("Reported Minimum")[incidentCounter])
	maxDeaths = parseInt(dataset.getColumn("Reported Maximum")[incidentCounter])
	avgDeaths = (minDeaths+maxDeaths)/2
	i.style("width", avgDeaths + "px")
	deaths_toPrint = (minDeaths===maxDeaths)?maxDeaths:[minDeaths,maxDeaths].join(/* an ndash, to represent 'to' */'–')
	
	i.attribute('incidentRowNumber', incidentCounter)
	i.attribute('incidentCode', dataset.getColumn("IBC code")[incidentCounter])
	i.attribute('onmouseover', "hoverOnIncident(this)")
	i.attribute('onmousedown', "mousedownOnIncident(this)")
	i.attribute('onclick', "clickOnIncident(this)")
	i.attribute('onmouseout', "leaveIncident(this)")

}

/* for interacting with incident-rectangles */

colour_red = 'rgb(255,0,0)'
colour_green = 'rgb(0,255,0)'
colour_verydarkred = 'rgb(127,0,0)'
colour_darkred = 'rgb(200,0,0)'
colour_black = 'rgb(0,0,0)'

function hoverOnIncident(element) {
	print("mouseover on # " + element.getAttribute("incidentCode"))

	element.style.backgroundColor = colour_verydarkred

	incidentCode = element.getAttribute("incidentCode")
	incidentRowNumber = element.getAttribute("incidentRowNumber")
	poptext = incidents.get(incidentRowNumber,'popuptext')
	popup = createElement('p', poptext)
	popup.parent(element)
	popup.class('popup')
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

/* other helper functions */

function printTableAsArray(table) {
	print(table.getArray())
}

function countTotalOfAllCellsInColumn(dataset, columnID) {
	total = 0
	arr = dataset.getColumn(columnID)
	for (let i = 0 ; i < arr.length ; ++i) { 
		total += parseInt(arr[i]) 
	}
	return total;
}