define([
	'Global',
	'utils/EventHelper'
], function(
	Global,
	EventHelper
) {
	var events = new EventHelper([ 'mouse-event' ]);

	//add mouse handler
	function onMouseEvent(evt) {
		events.trigger('mouse-event', evt.type,
			evt.clientX - Global.CANVAS.offsetLeft + document.body.scrollLeft,
			evt.clientY - Global.CANVAS.offsetTop + document.body.scrollTop);
	}
	Global.CANVAS.onmousedown = onMouseEvent;
	document.onmouseup = onMouseEvent;
	document.onmousemove = onMouseEvent;

	return {
		on: function(eventName, callback) {
			events.on(eventName, callback);
		}
	};
});