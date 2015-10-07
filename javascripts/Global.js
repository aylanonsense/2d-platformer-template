define({
	CANVAS: document.getElementById("canvas"),
	CANVAS_WIDTH: 800,
	CANVAS_HEIGHT: 600,

	//frame reate
	FRAMES_PER_SECOND: null, //null for requestAnimationFrame
	CONSTANT_TIME_PER_FRAME: false,
	TIME_SCALE: 1.0, //2.0 = double speed, 0.5 = half speed

	//input
	KEY_BINDINGS: {
		32: 'JUMP',					//space bar
		38: 'UP', 87: 'UP',			//up arrow / w key
		40: 'DOWN', 83: 'DOWN',		//down arrow / s key
		37: 'LEFT', 65: 'LEFT',		//left arrow / a key
		39: 'RIGHT', 68: 'RIGHT'	//right arrow / d key
	},

	//debugging
	LOG_MOVE_STEPS_ABOVE: null //null for no logging
});