const FRAMERATE = 10

function preload() {
	incidents = loadTable('data/ibc-incidents-2020-3-29-modified.csv', 'csv', 'header');
	individuals = loadTable('data/ibc-individuals-2020-3-29-modified.csv', 'csv', 'header');
}

function setup() {
	noCanvas()
	frameRate(FRAMERATE)

	/*	print to console, to check if the data loaded correctly. */
	// print(incidents)
	// printTableAsArray(incidents)
	
	totalIncidents = incidents.getRowCount()
	print("total incidents = " + totalIncidents)
	print("total deaths (minimum) = " + countTotalOfAllCellsInColumn(incidents, "Reported Minimum"))
	print("total deaths (maximum) = " + countTotalOfAllCellsInColumn(incidents, "Reported Maximum"))
}

function draw() {
	incidentCounter = frameCount % totalIncidents 
	irect(incidents, incidentCounter)
	select("#date").html(incidents.get(frameCount,"End Date"))
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
	i.attribute('title', deaths_toPrint + " killed")
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