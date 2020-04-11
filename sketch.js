// fetch('data/combined-dataset.json')
// .then(response => {
// 	const reader = response.body.getReader();

// 	const processChunk = ({ done, value }) => {
// 		console.log({ value, done });

// 		if(done){
// 			console.log('finished reading');
// 			return;
// 		}

// 		return reader.read().then(processChunk);
// 	}

// 	reader.read()
// 	.then(process);
// })

let jsondata = [];
let totalIncidents = 0;

oboe('data/combined-dataset.json')
.node('events.*', function( event ){
	jsondata.push(event);
})  
.done(function(events){
	// count total incidents.
	// note: this is the total number of incident-rectangles we'll draw in our visualisation
	totalIncidents = events.length;
});

// function preload() {
// 	jsondata = loadJSON('data/combined-dataset.json')
// }

function setup() {
	noCanvas()

	// before we begin drawing, let's empty this div of any text
	select("#visualisation").html("") 
}

function draw() {
	console.log({ totalIncidents, frameCount });

	// every time the draw() loop runs, draw one incident-rectangle.
	if(frameCount<totalIncidents) { 
		irect(jsondata, frameCount)
		select("#date").html(jsondata[frameCount]["d"])
	} 
	else if (totalIncidents > 0){
		console.log('finished');
		noLoop()
	}
}

/* make a rectangle that shows an incident */

function irect (dataset, incidentCounter) {
	i = createDiv().parent('#visualisation').addClass('incidentDeathsRectangle')
	minDeaths = parseInt(dataset[incidentCounter]["K"])
	maxDeaths = parseInt(dataset[incidentCounter]["k"])
	avgDeaths = (minDeaths+maxDeaths)/2
	i.style("width", avgDeaths+"px")
	i.attribute('incidentIndex', incidentCounter)

	// we will now have created an incident-rectangle, which may look something like this:
	// <div class="incidentDeathsRectangle" incidentindex="1" style="width: 2px;"></div>

	// for incidents in which we have civilian names ... give those rectangles a slightly different colour, to make them stand out a bit
	if(dataset[incidentCounter]["n"].length>0) i.style("backgroundColor", colour_darkred)

}

/* for interacting with incident-rectangles (using the mouse) */

colour_red = 'rgb(255,0,0)'
colour_green = 'rgb(0,255,0)'
colour_verydarkred = 'rgb(127,0,0)'
colour_darkred = 'rgb(200,0,0)'
colour_black = 'rgb(0,0,0)'

document.getElementById("visualisation").onmouseover = function (e) {
	e = e || window.event;
	var element = e.target ? e.target : e.srcElement;
	if(element.parentElement.id === "visualisation") {

		incidentRowNumber = element.getAttribute("incidentIndex")
		incidentCode = jsondata[incidentRowNumber]["i"]

		print("mouseover on # " + incidentCode)

		element.style.backgroundColor = colour_verydarkred

		enddate = jsondata[incidentRowNumber]["d"]
		loc_info = jsondata[incidentRowNumber]["l"]
		target_info = jsondata[incidentRowNumber]["t"]
		minDeaths = jsondata[incidentRowNumber]["k"]
		maxDeaths = jsondata[incidentRowNumber]["K"]
		deaths_toPrint = (minDeaths===maxDeaths)?maxDeaths:[minDeaths,maxDeaths].join('–')
		names = jsondata[incidentRowNumber]["n"]
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
}

document.getElementById("visualisation").onmousedown = function (e) {
	e = e || window.event;
	var element = e.target ? e.target : e.srcElement;
	if(element.parentElement.id === "visualisation") {

		// print("mouse-key pressed on # " + element.getAttribute("incidentCode"))

		element.style.backgroundColor = colour_darkred		
	}
}

document.getElementById("visualisation").onclick = function (e) {
	e = e || window.event;
	var element = e.target ? e.target : e.srcElement;
	if(element.parentElement.id === "visualisation") {

		// print("mouse clicked # " + element.getAttribute("incidentCode"))

		element.style.backgroundColor = colour_verydarkred
	}
}

document.getElementById("visualisation").onmouseout = function (e) {
	e = e || window.event;
	var element = e.target ? e.target : e.srcElement;
	if(element.parentElement.id === "visualisation") {
		// print("mouse left # " + element.getAttribute("incidentCode"))

		element.style.backgroundColor = colour_red

		/* delete any-and-all child elements (i.e., the popups) */
		while (element.firstChild) {
	    	element.removeChild(element.firstChild);
		}
	}
}