define([
	'display/Draw',
	'util/geom/Vector',
	'util/geom/Rect'
], function(
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
	Entity.prototype.startOfFrame = function(t) {
		this._tempHorizontalStability = null;
		this._tempVerticalStability = null;
	}
	Entity.prototype.move = function(t) {
		this.vel.addMult(this.gravity, t); //TODO might not be quite right, t * t?
		this.pos.addMult(this.vel, t);
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
		//check to see if other's side is colliding with this's platform
		//assume other CAN'T be more stable than this
		var dir = side === 'left' || side === 'top' ? -1 : 1;
		var axis = side === 'left' || side === 'right' ? 'x' : 'y';
		var oppositeSide = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' }[side];
		var stabilityVar = axis === 'x' ? 'horizontalStability' : 'verticalStability';
		var overlap = this.platformBox.isOverlapping(other.collisionBoxes[side]);
		if(overlap) {
			//this is more stable than other, no changes will be made to this
			if(this[stabilityVar] > other[stabilityVar] || this.stability > other.stability) {
				other[side] = overlap[oppositeSide];
				if(dir * other.vel[axis] > dir * this.vel[axis]) {
					other.vel[axis] = this.vel[axis];
				}
			}
			//this and other are equally stable, they will both receive changes
			else {
				var change = overlap[oppositeSide] - other[side];
				other[side] += change / 2;
				this[oppositeSide] -= change / 2;
				if(dir * other.vel[axis] > dir * this.vel[axis]) {
					other.vel[axis] = (other.vel[axis] + this.vel[axis]) / 2;
					this.vel[axis] = other.vel[axis];
				}
			}
			var prevStability = other[stabilityVar];
			other[stabilityVar] = this[stabilityVar];
			return {
				prevStability: prevStability,
				currStability: other[stabilityVar]
			};
		}
		else {
			return false;
		}
	};
	Entity.prototype.render = function() {
		Draw.rect(this.platformBox, { fill: 'rgba(255, 255, 255, 1)' });
		Draw.rect(this.collisionBoxes.left, { fill: 'rgba(255, 0, 0, 0.4)' });
		Draw.rect(this.collisionBoxes.right, { fill: 'rgba(0, 255, 0, 0.4)' });
		Draw.rect(this.collisionBoxes.top, { fill: 'rgba(0, 0, 255, 0.4)' });
		Draw.rect(this.collisionBoxes.bottom, { fill: 'rgba(255, 255, 0, 0.4)' });
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