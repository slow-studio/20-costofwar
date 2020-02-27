function preload() {
}

function setup() {
	let myCanvas = createCanvas(600, 300);
	myCanvas.parent("parent_to_p5_canvas");
}

function draw() {
	fill(0);
	rect(0,0,300,300);
	fill(255);
	rect(300,0,300,300);
}