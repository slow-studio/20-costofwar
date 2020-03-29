let FRAMERATE = 15
let lightOn = "red"
let lightOff = "#fafafa"

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
	startingWeek = parseInt(random(week.getColumnCount()))
	slider = createSlider(0, week.getColumnCount(), startingWeek)
	slider.parent("weekSliderContainer")
	slider.addClass("slider")
	slider.style('background-color', lightOff)
}

function draw() {
	let currentWeek_notNormalised = startingWeek + parseInt(frameCount / (FRAMERATE*7) )
	print("total weeks done so far = " + currentWeek_notNormalised )
	let currentWeek = currentWeek_notNormalised % week.getColumnCount()
	print("current week = " + currentWeek)
	document.getElementById("week").innerHTML = week.get(0,currentWeek)
	let fractionWeeksDone = 100*(currentWeek/week.getColumnCount())
	print("fractionWeeksDone = " + currentWeek + "/" + week.getColumnCount() + " = " + parseInt(fractionWeeksDone) + "%")
	slider.value(fractionWeeksDone)
	let totalFrames = frameCount
	print("total frames = " + totalFrames)
	let framesPassedInThisWeek = frameCount % (FRAMERATE*7)
	print("framesPassedInThisWeek = " + framesPassedInThisWeek)
	let ckillsInThisWeek = ckills.get(0,currentWeek)
	if (ckillsInThisWeek >= (FRAMERATE*7)/2 ) 
		ckillsInThisWeek = (FRAMERATE*7)/2
	print("ckillsInThisWeek = " + ckillsInThisWeek)
	if (framesPassedInThisWeek % (parseInt( 7 * (FRAMERATE) / ckillsInThisWeek )) === 0)
		tubelights[0].style('background-color', lightOn)
	else
		tubelights[0].style('background-color', lightOff)
	let tkillsInThisWeek = tkills.get(0,currentWeek)
	if (tkillsInThisWeek >= (FRAMERATE*7)/2 ) 
		tkillsInThisWeek = (FRAMERATE*7)/2
	print("tkillsInThisWeek = " + tkillsInThisWeek)
	if (framesPassedInThisWeek % (parseInt( 7 * (FRAMERATE) / tkillsInThisWeek )) === 0)
		tubelights[1].style('background-color', lightOn)
	else
		tubelights[1].style('background-color', lightOff)
}