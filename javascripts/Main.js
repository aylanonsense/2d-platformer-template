define([
	'Global',
	'Game',
	'util/now'
], function(
	Global,
	Game,
	now
) {
	return function() {
		//set up the canvas
		Global.CANVAS.setAttribute("width", Global.CANVAS_WIDTH);
		Global.CANVAS.setAttribute("height", Global.CANVAS_HEIGHT);

		//create new game
		var game = new Game();

		//kick off the game loop
		var prevTime = performance.now();
		function loop() {
			var time = now();

			//calculate time between frames
			var t;
			var framesPerSecond = Global.FRAMES_PER_SECOND || 60;
			if(Global.CONSTANT_TIME_PER_FRAME) {
				t = 1 / framesPerSecond;
			}
			else {
				t = Math.min((time - prevTime) / 1000, 3 / framesPerSecond);
			}
			t *= Global.TIME_SCALE;

			//updae the game
			game.update(t);
			game.render();

			//schedule the next loop
			prevTime = time;
			scheduleLoop();
		}
		function scheduleLoop() {
			if(!Global.FRAMES_PER_SECOND) {
				requestAnimationFrame(loop);
			}
			else {
				setTimeout(loop, 1000 / Global.FRAMES_PER_SECOND);
			}
		}
		scheduleLoop();
	};
});