var jsondata = [];
var dataLoadedCompletely = false
var totalIncidents = 0;

// read data stream (asynchronously), 
// so that the visualisation can begin drawing before all the data is downloaded.
oboe('data/combined-dataset.json')
.node('incidents.*', function( incident ){
	++totalIncidents;
	jsondata.push(incident);
})  
.done(function(events){
	dataLoadedCompletely = true
	console.log("data downloaded.")
	// count total incidents.
	// note: this is the total number of incident-rectangles we'll draw in our visualisation
	totalIncidents = events.incidents.length; // ps. this is the same as saying totalIncidents = jsondata.length
	console.log(`dataset loaded in ${stuckFrames} frames! total incidents = ${totalIncidents}`)
});

// before we begin drawing, let's empty this div of any text
var viz = document.getElementById("visualisation")
viz.innerHTML = ""

var frameCount = 0
// to count how many frames we couldn't draw for (because the data hadn't downloaded yet)
var stuckFrames = 0 

var drawViz = setInterval(draw);

function draw() {
	let indexOfIncidentToDraw = frameCount - stuckFrames

	// if(totalIncidents>0)
	// 	if(indexOfIncidentToDraw === 0)
	// 		document.getElementById("fromDate").innerHTML = "from: <strong>" + jsondata[0]["d"] + "</strong>"

	// kill the loop (i.e., stop drawing) if you've finished drawing all the data
	if(dataLoadedCompletely) 
		if(indexOfIncidentToDraw >= totalIncidents) // i.e., we have finished drawing all the data
			clearInterval(drawViz)
	
	if(indexOfIncidentToDraw < totalIncidents) { // need to check this while the data is loading, because sometimes not enough incidents' data has been downloaded yet (on slower internet connections)
		let drawRect = setTimeout(irect, 3000, jsondata,indexOfIncidentToDraw)
		// document.getElementById("toDate").innerHTML = "to: <strong>" + jsondata[indexOfIncidentToDraw]["d"] + "</strong>"
	} else stuckFrames++

	frameCount++

}


/* colours */

const colour = {
	red0 : 'rgb(255,0,0)',
	red1 : 'rgb(200,0,0)',
	red2 : 'rgb(127,0,0)',
	green : 'rgb(0,255,0)',
	black : 'rgb(0,0,0)'
}


// to count total civilians killed (as we draw each incident box)
var totalCivilians = 0


/* make a rectangle that shows an incident */

function irect (dataset, incidentCounter) {
	let i = document.createElement("div")
	viz.appendChild(i)
	i.setAttribute("class", "incidentDeathsRectangle")
	i.setAttribute("incidentIndex", incidentCounter)
	let minDeaths = parseInt(dataset[incidentCounter]["k"])
	let maxDeaths = parseInt(dataset[incidentCounter]["K"])
	let avgDeaths = (minDeaths+maxDeaths)/2
	 // every box starts off with a 1px width, and then expands (using setTimeout() and the css-transition proprty.)
	i.style.width = "1px" ; let changeWidth = setTimeout(widen, 100, i, avgDeaths) ;

	// we will now have created an incident-rectangle, which may look something like this:
	// <div class="incidentDeathsRectangle" incidentindex="1" style="width: 2px;"></div>

	// for incidents in which we have civilian names ...
	if(dataset[incidentCounter]["n"].length>0) {
		// give those rectangles a slightly different colour, to make them stand out a bit
		i.style.backgroundColor = colour.red1
	}

	// record total deaths so far, since the start of the conflict
	totalCivilians += maxDeaths
	i.setAttribute("totalCivilians", totalCivilians)

}

function widen(i, newWidth) {
	i.style.width = newWidth+"px"
	// note: css transitions ensure that this change in width animates gracefully.
}


/* for interacting with incident-rectangles (using the mouse) */

document.getElementById("visualisation").onmouseover = function (e) {
	e = e || window.event;
	var element = e.target ? e.target : e.srcElement;
	// console.log(e.target)
	// console.log(e.relatedTarget)

	if(element.parentElement.id === "visualisation") {

		let incidentRowNumber = element.getAttribute("incidentIndex")
		let {
			i : incidentCode,
			d : enddate,
			l : loc_info,
			t : target_info,
			k : minDeaths,
			K : maxDeaths,
			n : names
		} = jsondata[incidentRowNumber]

		// console.log(`mouseover on # ${incidentCode}`)

		element.style.backgroundColor = colour.red2

		let deaths_toPrint = (minDeaths===maxDeaths) ? maxDeaths : [minDeaths,maxDeaths].join('–')
		let anyNamesKnown = names.length ? true : false

		let poptext = ""
		poptext += `<span class='red'>Date</span> <br> ${enddate} <br><br>`
		poptext += `<span class='red'>Location</span> <br> ${loc_info} <br><br>`
		poptext += target_info ? `<span class='red'>Target:</span> <br> ${target_info} <br><br>` : ""
		poptext += `<span class='red'>Civilians killed</span> <br> ${deaths_toPrint} <br><br>`
		poptext += anyNamesKnown ? `<span class='red'>Civilians identified</span>` : ""
		for(let i=0 ; i<names.length ; ++i) {
			let { 
				n : name, 
				a : age 
			} = names[i]
			if(age === "unknown") age = ""
			poptext += `<br> <strong>${name}</strong> <small>${age}</small>`
		}

		let popup = document.createElement("div")
		popup.innerHTML = poptext
		element.appendChild(popup)
		popup.setAttribute("class", "popup")

	}
}

document.getElementById("visualisation").onmousedown = function (e) {
	e = e || window.event;
	var element = e.target ? e.target : e.srcElement;
	if(element.parentElement.id === "visualisation") {

		// console.log("mouse-key pressed on # " + element.getAttribute("incidentCode"))

		element.style.backgroundColor = colour.black		
	}
}

document.getElementById("visualisation").onclick = function (e) {
	e = e || window.event;
	var element = e.target ? e.target : e.srcElement;
	if(element.parentElement.id === "visualisation") {

		// console.log("mouse clicked # " + element.getAttribute("incidentCode"))

		element.style.backgroundColor = colour.red2
	}
}

document.getElementById("visualisation").onmouseout = function (e) {
	e = e || window.event;
	var element = e.target ? e.target : e.srcElement;
	if(element.parentElement.id === "visualisation") {
		// console.log("mouse left # " + element.getAttribute("incidentCode"))

		let incidentRowNumber = element.getAttribute("incidentIndex")

		/* delete any-and-all child elements (i.e., the popups) */
		while (element.firstChild) {
	    	element.removeChild(element.firstChild);
		}

		if(jsondata[incidentRowNumber]["n"].length>0) {
			element.style.backgroundColor = colour.red1
		} else {
			element.style.backgroundColor = colour.red0
		}
	}
}


// count how many civilians the person has scrolled-past

const scroller = document.getElementById("scroller")
scroller.style.top = "-" + scroller.offsetHeight + "px"

setInterval( function () {
	
	viz = document.getElementById("visualisation")
	x = viz.offsetLeft
	y = scroller.offsetHeight
	let total = document.elementFromPoint(x, y + 1).getAttribute("totalCivilians")
	if(!total) total = document.elementFromPoint(x, y + 2).getAttribute("totalCivilians")
	if(total) 
		total = ((total/1000).toFixed(0))*1000
	if(total>0) {
		// console.log(total)
		scroller.innerHTML = `↑ scrolled past ${Number(total).toLocaleString()} civilians.`
		// scroller.style.display = "block";
		scroller.style.top = "0px";
	} else {
		// scroller.style.display = "none";
		scroller.style.top = "-" + scroller.offsetHeight + "px"
	}
},1000 )