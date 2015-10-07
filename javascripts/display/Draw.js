define([
	'Global',
	'display/Camera'
], function(
	Global,
	Camera
) {
	var CTX = Global.CANVAS.getContext("2d");

	function applyDrawOptions(opts) {
		if(opts && opts.fill) {
			CTX.fillStyle = opts.fill;
			return true;
		}
		else {
			CTX.strokeStyle = opts && opts.stroke || '#fff';
			CTX.lineWidth = opts && (opts.thickness || opts.thickness === 0) ? opts.thickness : 1;
			return false;
		}
	}

	return {
		rect: function(x, y, width, height, opts) {
			//(Rect) or (Rect, opts)
			if(arguments.length < 3) {
				opts = y; height = x.height; width = x.width; y = x.top; x = x.left;
			}
			if(applyDrawOptions(opts)) {
				CTX.fillRect(x - Camera.pos.x, y - Camera.pos.y, width, height);
			}
			else {
				CTX.strokeRect(x - Camera.pos.x, y - Camera.pos.y, width, height);
			}
		},
		line: function(x1, y1, x2, y2, opts) {
			//(Vector, Vector) or (Vector, Vector, opts)
			if(arguments.length < 4) {
				//TODO
			}
			if(opts && opts.fill) {
				applyDrawOptions({ stroke: opts.fill });
			}
			else {
				applyDrawOptions(opts);
			}
			CTX.beginPath();
			CTX.moveTo(x1, y1);
			CTX.lineTo(x2, y2);
			CTX.stroke();
		},
		poly: function(/* x1, y1, x2, y2, ..., */ opts) {
			//TODO
		}
	};
});