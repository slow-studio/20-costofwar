function preload() {
	ckills = loadTable('data/coalition-kills.csv', 'csv');
	tkills = loadTable('data/terrorist-kills.csv', 'csv');
	week = loadTable('data/killDates.csv', 'csv');
}

function setup() {
	noCanvas()
	print("ckills = " + ckills.getColumnCount() )
	print("tkills = " + tkills.getColumnCount() )
	print("weeks = " + week.getColumnCount() )
}

function draw() {
}