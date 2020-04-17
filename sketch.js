var data = []
// each element in data is itself an array, that holds one year's incidents
for(i=0 ; i<2017-2002 ; ++i) 
	data[i] = [] 

var dataLoadedCompletely = false
var totalIncidents = 0
var totalDeaths = 0

// read data stream (asynchronously), 
// so that the visualisation can begin drawing before all the data is downloaded.
oboe('data/combined-dataset.json')
.node('incidents.*', function( incident ){
	++totalIncidents;
	totalDeaths+=parseInt(incident.K)
	sortDataYearwise(incident)
})  
.done(function(events){
	dataLoadedCompletely = true
	// count total incidents.
	// note: this is the total number of incident-rectangles we'll draw in our visualisation
	totalIncidents = events.incidents.length;
	console.log(`finished downloading dataset! ${totalIncidents} incidents fetched. ${totalDeaths} deaths noted.`)
});

var drawViz = []
var incidentsDrawSoFar = []

function sortDataYearwise (incident) {
	DD = new Date(incident.d)
	year = DD.getFullYear()
	YEAR = year-2003 
	data[YEAR].push(incident) // so, data[0] holds incidents for year 2003, and data[14] holds incidents for year 2003+14 = 2017.
	// if we just put the first incident into this year's list,
	if(data[YEAR].length === 1) { 
		// then
		// make a new div to present this year's data...
		viz = document.getElementById("visualisation")
		yearDiv = document.createElement("div")
		yearDiv.setAttribute("id", (YEAR+2003))
		yearDiv.setAttribute("class", "year")
		viz.appendChild(yearDiv)
		yearDate = document.createElement("p")
		yearDiv.appendChild(yearDate)
		yearDate.setAttribute("class", "date")
		yearDate.innerHTML = "<strong>" + (YEAR+2003) + "</strong>"
		yearViz = document.createElement("div")
		yearDiv.appendChild(yearViz)
		yearViz.setAttribute("id", "viz-"+(YEAR+2003))
		yearViz.setAttribute("class", "viz")
		// divider = document.createElement("hr")
		// viz.appendChild(divider)
		// ...and start drawing the data
		incidentsDrawSoFar[YEAR] = 0
		drawViz[YEAR] = setInterval(draw, 0, YEAR)
	}
}

function draw(YEAR) {

	// kill the loop (i.e., stop drawing) if you've finished drawing all the data
	if(
		dataLoadedCompletely
		||
		(
			data[YEAR+1] // that element exists
			&&
			data[YEAR+1].length>0 // the dataset for the next year exists, i.e. the data for the current year has downloaded completely
		)
	) {
		if(incidentsDrawSoFar[YEAR] >= data[YEAR].length) { // i.e., we have finished drawing all the data
			clearInterval(drawViz[YEAR])
		}
	}
	
	if(incidentsDrawSoFar[YEAR] < data[YEAR].length) { // need to check this while the data is loading, because sometimes not enough incidents' data has been downloaded yet (on slower internet connections)
		let parentElementId = String("viz-"+(parseInt(YEAR)+2003))
		// console.log(parentElementId)
		if(document.getElementById(parentElementId)) {
			irect(data[YEAR], parentElementId, incidentsDrawSoFar[YEAR])
		}
		else console.log("sadness.")
	} 


	incidentsDrawSoFar[YEAR]++
}


/* make a rectangle that shows an incident */

function irect (dataset, parentElementId, incidentCounter) {
	i = document.createElement("div")
	vizParent = document.getElementById(parentElementId) ; vizParent.appendChild(i) ;
	i.setAttribute("class", "incidentDeathsRectangle")
	i.setAttribute("incidentIndex", incidentCounter)
	minDeaths = parseInt(dataset[incidentCounter]["K"])
	maxDeaths = parseInt(dataset[incidentCounter]["k"])
	avgDeaths = (minDeaths+maxDeaths)/2
	 // every box starts off with a 1px width, and then expands (using setTimeout() and the css-transition proprty.)
	i.style.height = "1px" ; var changeHeight = setTimeout(heighten, 100, i, avgDeaths) ;

	// we will now have created an incident-rectangle, which may look something like this:
	// <div class="incidentDeathsRectangle" incidentindex="1" style="width: 2px;"></div>

	// for incidents in which we have civilian names ... give those rectangles a slightly different colour, to make them stand out a bit
	if(dataset[incidentCounter]["n"].length>0) 
		i.style.backgroundColor = colour_darkred

}

function heighten(i, newHeight) {
	i.style.height = newHeight+"px"
	// note: css transitions ensure that this change in width animates gracefully.
}

/* for interacting with incident-rectangles (using the mouse) */

const colour_red = 'rgb(255,0,0)'
const colour_green = 'rgb(0,255,0)'
const colour_verydarkred = 'rgb(127,0,0)'
const colour_darkred = 'rgb(200,0,0)'
const colour_black = 'rgb(0,0,0)'

document.getElementById("visualisation").onmouseover = function (e) {
	e = e || window.event;
	var element = e.target ? e.target : e.srcElement;
	
	var year = element.parentElement.parentElement.id
	var YEAR = year-2003

	if(element.classList.contains("incidentDeathsRectangle")) {

		incidentRowNumber = element.getAttribute("incidentIndex")
		incidentCode = data[YEAR][incidentRowNumber]["i"]

		console.log(`mouseover on # ${incidentCode}`)

		element.style.backgroundColor = colour_verydarkred

		enddate = data[YEAR][incidentRowNumber]["d"]
		loc_info = data[YEAR][incidentRowNumber]["l"]
		target_info = data[YEAR][incidentRowNumber]["t"]
		minDeaths = data[YEAR][incidentRowNumber]["k"]
		maxDeaths = data[YEAR][incidentRowNumber]["K"]
		deaths_toPrint = (minDeaths===maxDeaths)?maxDeaths:[minDeaths,maxDeaths].join('–')
		names = data[YEAR][incidentRowNumber]["n"]
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

		popup = document.createElement("div")
		popup.innerHTML = poptext
		element.appendChild(popup)
		popup.setAttribute("class", "popup")
		popup.style.top = String((element.offsetHeight+1)+"px")

		// make sure the popup doesn't go too far to the right
		nudgeLeft = 0
		bleed = (popup.offsetLeft + popup.offsetWidth) - (document.getElementById("visualisation").offsetLeft + document.getElementById("visualisation").offsetWidth)
		if(bleed>0) {
			// nudgeLeft -= (document.getElementById("visualisation").offsetWidth/15)
			nudgeLeft = -bleed
			popup.style.left = nudgeLeft+"px"
		}

	}
}

document.getElementById("visualisation").onmousedown = function (e) {
	e = e || window.event;
	var element = e.target ? e.target : e.srcElement;
	if(element.classList.contains("incidentDeathsRectangle")) {

		// console.log("mouse-key pressed on # " + element.getAttribute("incidentCode"))

		element.style.backgroundColor = colour_darkred		
	}
}

document.getElementById("visualisation").onclick = function (e) {
	e = e || window.event;
	var element = e.target ? e.target : e.srcElement;
	if(element.classList.contains("incidentDeathsRectangle")) {

		// console.log("mouse clicked # " + element.getAttribute("incidentCode"))

		element.style.backgroundColor = colour_verydarkred
	}
}

document.getElementById("visualisation").onmouseout = function (e) {
	e = e || window.event;
	var element = e.target ? e.target : e.srcElement;
	
	var year = element.parentElement.parentElement.id
	var YEAR = year-2003

	if(element.classList.contains("incidentDeathsRectangle")) {
		// console.log("mouse left # " + element.getAttribute("incidentCode"))

		incidentRowNumber = element.getAttribute("incidentIndex")

		/* delete any-and-all child elements (i.e., the popups) */
		while (element.firstChild) {
	    	element.removeChild(element.firstChild);
		}

		if(data[YEAR][incidentRowNumber]["n"].length>0) {
			element.style.backgroundColor = colour_darkred
		} else {
			element.style.backgroundColor = colour_red
		}
	}
}


/* otherstuff */

setInterval( function () {
		scrolledPixels = document.documentElement.scrollTop-document.getElementById("visualisation").offsetTop
		scroller = document.getElementById("scroller")
		if(scrolledPixels > 0) {
			count = 0
			for(i=0 ; i<15 ; i++) {
				yearDiv = document.getElementById(String(i+2003))
				H = yearDiv.offsetHeight
				if(H>scrolledPixels) {
					// console.log(`${parseInt(2003+i)} has been passed.`)
					count+=scrolledPixels
				} else {
					count+=H
				}
			}
			scroller.innerHTML = `↑ scrolled past approx ${(((count * (totalDeaths/(totalDeaths+totalIncidents)))/1000).toFixed(0))*1000} deaths.`
			scroller.style.display = "block";
		} else {
			scroller.style.display = "none";
		}
},1000 )