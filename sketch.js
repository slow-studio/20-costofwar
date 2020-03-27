let FRAMERATE = 30

function preload() {
	ckills = loadTable('data/coalition-kills.csv', 'csv');
	tkills = loadTable('data/terrorist-kills.csv', 'csv');
	week = loadTable('data/killDates.csv', 'csv');
}

function setup() {
	noCanvas()
	frameRate(FRAMERATE)
	print("ckills = " + ckills.getColumnCount() )
	print("tkills = " + tkills.getColumnCount() )
	print("weeks = " + week.getColumnCount() )
	tubelights = selectAll(".tubelight")
}

function draw() {
	print("total weeks done so far = " + parseInt(frameCount / (FRAMERATE*7 ))) 
	let currentWeek = (parseInt(frameCount / (FRAMERATE*7) ) % week.getColumnCount())
	print("current week = " + currentWeek)
	document.getElementById("week").innerHTML = week.get(0,currentWeek)
	let totalFrames = frameCount
	print("total frames = " + totalFrames)
	let framesPassedInThisWeek = frameCount % (FRAMERATE*7)
	print("framesPassedInThisWeek = " + framesPassedInThisWeek)
	let ckillsInThisWeek = ckills.get(0,currentWeek)
	if (ckillsInThisWeek >= (FRAMERATE*7)/2 ) 
		ckillsInThisWeek = (FRAMERATE*7)/2
	print("ckillsInThisWeek = " + ckillsInThisWeek)
	if (framesPassedInThisWeek % (parseInt( 7 * (FRAMERATE) / ckillsInThisWeek )) === 0)
		tubelights[0].style('background-color', "black")
	else
		tubelights[0].style('background-color', "#fafafa")
	let tkillsInThisWeek = tkills.get(0,currentWeek)
	if (tkillsInThisWeek >= (FRAMERATE*7)/2 ) 
		tkillsInThisWeek = (FRAMERATE*7)/2
	print("tkillsInThisWeek = " + tkillsInThisWeek)
	if (framesPassedInThisWeek % (parseInt( 7 * (FRAMERATE) / tkillsInThisWeek )) === 0)
		tubelights[1].style('background-color', "black")
	else
		tubelights[1].style('background-color', "#fafafa")
}