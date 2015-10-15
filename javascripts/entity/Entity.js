define([
	'Global',
	'display/Draw',
	'util/geom/Vector',
	'util/geom/Rect'
], function(
	Global,
	Draw,
	Vector,
	Rect
) {
	var NEXT_ID = 0;
	function Entity(params) {
		params = params || {};
		this._id = NEXT_ID++;
		this.pos = new Vector(params.x || 0, params.y || 0);
		this.vel = new Vector(params.velX || 0, params.velY || 0);
		this.gravity = new Vector(params.gravityX || 0, params.gravityY || 0);
		this.friction = typeof params.friction === 'number' ? params.friction : 0.5;
		this._frictionToApply = [];
		this.stability = params.stability || 1;
		this._tempHorizontalStability = null;
		this._tempVerticalStability = null;
		var width = Math.max(3, params.width || 0);
		var height = Math.max(3, params.height || 0);
		var insetX = Math.max(1, Math.min(width / 2 - 1, 5));
		var insetY = Math.max(1, Math.min(height / 2 - 1, 5));
		this.collisionBoxes = {
			left: new Rect(this, -width / 2, -height / 2 + insetY, width / 2, height - 2 * insetY),
			right: new Rect(this, 0, -height / 2 + insetY, width / 2, height - 2 * insetY),
			top: new Rect(this, -width / 2 + insetX, -height / 2, width - 2 * insetX, height / 2),
			bottom: new Rect(this, -width / 2 + insetX, 0, width - 2 * insetX, height / 2),
		};
		this.platformBox = new Rect(this, -width / 2, -height / 2, width, height);
	}
	Entity.prototype.sameAs = function(other) {
		return other && this._id === other._id;
	};
	Entity.prototype.startOfMovement = function(t) {
		this._tempHorizontalStability = null;
		this._tempVerticalStability = null;
	};
	Entity.prototype.move = function(t) {
		this.vel.addMult(this.gravity, t); //TODO think about this
		this.pos.addMult(this.vel, t);
	};
	Entity.prototype.endOfMovement = function(t) {
		//take the weighted average of this thing's velocity with
		// the things it collided with, and apply that velocity to this
		var c = Math.pow(2, this.friction * 4) - 1;
		var percentUnchanged = 1 / Math.pow(Math.E, c * t);
		if(this.friction === 1) {
			percentUnchanged = 0;
		}
		for(var i = 0; i < this._frictionToApply.length; i++) {
			var axis = this._frictionToApply[i].axis;
			this.vel[axis] = percentUnchanged * this.vel[axis] +
				(1 - percentUnchanged) * this._frictionToApply[i].entity.vel[axis];
		}
		this._frictionToApply = [];
	};
	Entity.prototype.getNumMoveSteps = function(t) {
		return t > 0 ? 1 : 0; //TODO
	};
	Entity.prototype.checkForHorizontalCollision = function(other) {
		var result = this._checkForCollisionAlongSide(other, 'left');
		if(!result) {
			result = this._checkForCollisionAlongSide(other, 'right');
		}
		return result;
	};
	Entity.prototype.checkForVerticalCollision = function(other) {
		var result = this._checkForCollisionAlongSide(other, 'bottom');
		if(!result) {
			result = this._checkForCollisionAlongSide(other, 'top');
		}
		return result;
	};
	Entity.prototype._checkForCollisionAlongSide = function(other, side) {
		//check to see if this's side is colliding with other's platform
		//assume this CAN'T be more stable than other
		var dir = side === 'left' || side === 'top' ? -1 : 1;
		var axis = side === 'left' || side === 'right' ? 'x' : 'y';
		var oppositeAxis = axis === 'x' ? 'y' : 'x';
		var oppositeSide = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' }[side];
		var stabilityVar = axis === 'x' ? 'horizontalStability' : 'verticalStability';
		var overlap = other.platformBox.isOverlapping(this.collisionBoxes[side]);
		if(overlap) {
			//other is more stable than this, no changes will be made to other
			if(other[stabilityVar] > this[stabilityVar] || other.stability > this.stability) {
				this[side] = overlap[oppositeSide];
				if(dir * this.vel[axis] > dir * other.vel[axis]) {
					this.vel[axis] = other.vel[axis];
				}
				this._frictionToApply.push({ entity: other, axis: oppositeAxis });
			}
			//other and this are equally stable, they will both receive changes
			else {
				var change = overlap[oppositeSide] - this[side];
				this[side] += change / 2;
				other[oppositeSide] -= change / 2;
				if(dir * this.vel[axis] > dir * other.vel[axis]) {
					this.vel[axis] = (this.vel[axis] + other.vel[axis]) / 2;
					other.vel[axis] = this.vel[axis];
				}
			}
			var prevStability = this[stabilityVar];
			this[stabilityVar] = other[stabilityVar];
			return {
				prevStability: prevStability,
				currStability: this[stabilityVar]
			};
		}
		else {
			return false;
		}
	};
	Entity.prototype.render = function() {
		if(Global.ENTITY_DRAW_MODE === 'stability') {
			Draw.rect(this.left, this.top, this.right - this.left, this.bottom - this.top, { color: '#fff', thickness: 1 });
			Draw.line(this.left, this.pos.y, this.right, this.pos.y, {
				stroke: Global.STABILITY_COLORS[Math.min(Math.max(0, this.horizontalStability), Global.STABILITY_COLORS.length - 1)],
				thickness: 2
			});
			Draw.line(this.pos.x, this.top, this.pos.x, this.bottom, {
				stroke: Global.STABILITY_COLORS[Math.min(Math.max(0, this.verticalStability), Global.STABILITY_COLORS.length - 1)],
				thickness: 2
			});
		}
		else if(Global.ENTITY_DRAW_MODE === 'collision') {
			Draw.rect(this.platformBox, { fill: 'rgba(255, 255, 255, 1)' });
			Draw.rect(this.collisionBoxes.left, { fill: 'rgba(255, 0, 0, 0.42	)' });
			Draw.rect(this.collisionBoxes.right, { fill: 'rgba(0, 255, 0, 0.4)' });
			Draw.rect(this.collisionBoxes.top, { fill: 'rgba(0, 0, 255, 0.22)' });
			Draw.rect(this.collisionBoxes.bottom, { fill: 'rgba(255, 255, 0, 0.55)' });
		}
		else if(Global.ENTITY_DRAW_MODE === 'outline') {
			Draw.rect(this.left, this.top, this.right - this.left, this.bottom - this.top, { color: '#fff', thickness: 2 });
			Draw.rect(this.left, this.top, 6, 6, { color: '#fff', thickness: 0.5 });
			Draw.rect(this.right - 6, this.top, 6, 6, { color: '#fff', thickness: 0.5 });
			Draw.rect(this.right - 6, this.bottom - 6, 6, 6, { color: '#fff', thickness: 0.5 });
			Draw.rect(this.left, this.bottom - 6, 6, 6, { color: '#fff', thickness: 0.5 });
			Draw.line(this.pos.x - 4, this.pos.y, this.pos.x + 4, this.pos.y, { color: '#fff', thickness: 0.5 });
			Draw.line(this.pos.x, this.pos.y - 4, this.pos.x, this.pos.y + 4, { color: '#fff', thickness: 0.5 });
		}
		/*Draw.rect(this.platformBox, { fill: 'rgba(255, 255, 255, 1)' });
		Draw.rect(this.collisionBoxes.left, { fill: 'rgba(255, 0, 0, 0.4)' });
		Draw.rect(this.collisionBoxes.right, { fill: 'rgba(0, 255, 0, 0.4)' });
		Draw.rect(this.collisionBoxes.top, { fill: 'rgba(0, 0, 255, 0.4)' });
		Draw.rect(this.collisionBoxes.bottom, { fill: 'rgba(255, 255, 0, 0.4)' });
		Draw.poly(this.left, this.top, this.right, this.top, this.right, this.bottom, this.left, this.bottom, { stroke: '#f00', close: false, thickness: 10, close: true });*/
	};
	Object.defineProperties(Entity.prototype, {
		horizontalStability: {
			get: function() { return this._tempHorizontalStability === null ? this.stability : this._tempHorizontalStability; },
			set: function(stability) { this._tempHorizontalStability = stability; }
		},
		verticalStability: {
			get: function() { return this._tempVerticalStability === null ? this.stability : this._tempVerticalStability; },
			set: function(stability) { this._tempVerticalStability = stability; }
		},
		left: {
			get: function() { return this.collisionBoxes.left.left; },
			set: function(left) { this.pos.x = left + this.collisionBoxes.left.width; }
		},
		right: {
			get: function() { return this.collisionBoxes.right.right; },
			set: function(right) { this.pos.x = right - this.collisionBoxes.right.width; }
		},
		top: {
			get: function() { return this.collisionBoxes.top.top; },
			set: function(top) { this.pos.y = top + this.collisionBoxes.top.height; }
		},
		bottom: {
			get: function() { return this.collisionBoxes.bottom.bottom; },
			set: function(bottom) { this.pos.y = bottom - this.collisionBoxes.bottom.height; }
		}
	});
	return Entity;
});