function setup() {
	let myCanvas = createCanvas(600, 400);
	myCanvas.parent("parent_to_p5_canvas");
}

function draw() {
	if(mouseIsPressed) {
		fill(0);
	} else {
		fill(255);
	}
  	ellipse(mouseX,mouseY,80,80);
}