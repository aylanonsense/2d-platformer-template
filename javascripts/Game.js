define([
	'Global',
	'display/Draw',
	'entity/Entity'
], function(
	Global,
	Draw,
	Entity
) {
	function Game() {
		this.entities = [
			new Entity({ x: 400, y: 500, width: 700, height: 50, stability: 3 }),
			new Entity({ x: 700, y: 400, width: 100, height: 100, gravityY: 100, stability: 2, velX: -100 }),
			new Entity({ x: 287, y: 150, width: 25, height: 25, gravityY: 100, stability: 1 }),
			new Entity({ x: 310, y: 200, width: 25, height: 25, gravityY: 100, stability: 1 }),
			new Entity({ x: 330, y: 250, width: 25, height: 25, gravityY: 100, stability: 1 }),
			new Entity({ x: 320, y: 300, width: 25, height: 25, gravityY: 100, stability: 1 }),
			new Entity({ x: 342, y: 350, width: 25, height: 25, gravityY: 100, stability: 1 }),
			new Entity({ x: 342, y: 350, width: 25, height: 25, gravityY: 100, stability: 1 }),
			new Entity({ x: 200, y: 50, width: 25, height: 25, gravityY: 100, stability: 1, velX: 200 }),
			new Entity({ x: 600, y: 50, width: 25, height: 25, gravityY: 100, stability: 1, velX: -200 }),
		];
	}
	Game.prototype.update = function(t) {
		for(var i = 0; i < this.entities.length; i++) {
			this.entities[i].startOfFrame(t);
		}

		//move entities in steps
		var timeLeft = t;
		var numStepsLeft = Math.max.apply(Math, this.entities.map(function(entity) {
			return entity.getNumMoveSteps(timeLeft);
		}));
		var numStepsTaken = 0;
		while(numStepsLeft > 0 && timeLeft > 0 && numStepsTaken < 100) {
			var timeThisStep = timeLeft / numStepsLeft;
			if(numStepsLeft === 1) {
				timeLeft = 0;
			}
			else {
				timeLeft -= timeThisStep;
			}

			//move entities one step
			for(i = 0; i < this.entities.length; i++) {
				this.entities[i].move(timeThisStep);
			}

			//check for collisions
			this._checkForEntityCollisions();

			//figure out how many steps are left
			numStepsLeft = Math.max.apply(Math, this.entities.map(function(entity) {
				return entity.getNumMoveSteps(timeLeft);
			}));
			numStepsTaken++;
		}
		if(numStepsTaken >= 100) {
			throw new Error("Max steps taken in single frame (100)");
		}
		else if(Global.LOG_MOVE_STEPS_ABOVE !== null && numStepsTaken > Global.LOG_MOVE_STEPS_ABOVE) {
			console.log(numStepsTaken + (numStepsTaken === 1 ? " step" : " steps") + " taken in single frame");
		}
	};
	Game.prototype._checkForEntityCollisions = function() {
		var i, j;
		var maxHorizontalStability = Math.max.apply(Math, this.entities.map(function(entity) {
			return entity.horizontalStability;
		}));
		var maxVerticalStability = Math.max.apply(Math, this.entities.map(function(entity) {
			return entity.verticalStability;
		}));

		while(maxHorizontalStability > 0 || maxVerticalStability > 0) {
			var stabilityVar, maxStability, method;
			if(maxHorizontalStability >= maxVerticalStability) {
				stabilityVar = 'horizontalStability';
				method = 'checkForHorizontalCollision';
				maxStability = maxHorizontalStability;
				maxHorizontalStability--;
			}
			else {
				stabilityVar = 'verticalStability';
				method = 'checkForVerticalCollision';
				maxStability = maxVerticalStability;
				maxVerticalStability--;
			}

			var entitiesToCheck = this.entities.filter(function(entity) {
				return entity[stabilityVar] === maxStability;
			});
			for(i = 0; i < entitiesToCheck.length; i++) {
				for(j = 0; j < this.entities.length; j++) {
					if(!entitiesToCheck[i].sameAs(this.entities[j]) &&
						this.entities[j][stabilityVar] <= maxStability) {
						var result = entitiesToCheck[i][method](this.entities[j]);
						if(result && result.prevStability < maxStability &&
							result.currStability === maxStability) {
							entitiesToCheck.push(this.entities[j]);
						}
					}
				}
			}

		}
	};
	Game.prototype.render = function() {
		Draw.rect(0, 0, Global.CANVAS_WIDTH, Global.CANVAS_HEIGHT, { fill: '#000' });
		for(var i = 0; i < this.entities.length; i++) {
			this.entities[i].render();
		}
	};
	return Game;
});