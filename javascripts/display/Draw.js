define([
	'Global',
	'display/Camera'
], function(
	Global,
	Camera
) {
	var CTX = Global.CANVAS.getContext("2d");

	function applyDrawOptions(opts) {
		var result = { shouldFill: false, shouldStroke: false };
		if(!opts || !opts.fill || opts.stroke) {
			result.shouldStroke = true;
			CTX.strokeStyle = opts && opts.stroke || '#fff';
			CTX.lineWidth = opts && (opts.thickness || opts.thickness === 0) ? opts.thickness : 1;
		}
		if(opts && opts.fill) {
			result.shouldFill = true;
			CTX.fillStyle = opts.fill;
			result.shouldFill = true;
		}
		return result;
	}

	return {
		rect: function(x, y, width, height, opts) {
			//(Rect) or (Rect, opts)
			if(arguments.length < 3) {
				opts = y; height = x.height; width = x.width; y = x.top; x = x.left;
			}
			var result = applyDrawOptions(opts);
			if(result.shouldFill) {
				CTX.fillRect(x - Camera.pos.x, y - Camera.pos.y, width, height);
			}
			if(result.shouldStroke) {
				CTX.strokeRect(x - Camera.pos.x, y - Camera.pos.y, width, height);
			}
		},
		line: function(x1, y1, x2, y2, opts) {
			//(Vector, Vector) or (Vector, Vector, opts)
			if(arguments.length < 4) {
				opts = x2; y2 = y1.y; x2 = y1.x; y1 = x1.y; x1 = x1.x;
			}
			var result = applyDrawOptions(opts);
			if(result.shouldStroke) {
				CTX.beginPath();
				CTX.moveTo(x1, y1);
				CTX.lineTo(x2, y2);
				CTX.stroke();
			}
		},
		poly: function(/* x1, y1, x2, y2, ..., */ opts) {
			CTX.beginPath();
			CTX.moveTo(arguments[0], arguments[1]);
			for(var i = 2; i < arguments.length - 1; i += 2) {
				CTX.lineTo(arguments[i], arguments[i + 1]);
			}
			//this function assumes opts is given...
			opts = arguments[arguments.length - 1];
			if(opts && opts.close) {
				CTX.closePath();
			}
			var result = applyDrawOptions(opts);
			if(result.shouldFill) {
				CTX.fill();
			}
			if(result.shouldStroke) {
				CTX.stroke();
			}
		}
	};
});