define([
	'Global',
	'display/Draw',
	'util/now',
	'entity/Entity'
], function(
	Global,
	Draw,
	now,
	Entity
) {
	function Game() {
		this.entities = [
			new Entity({ x: 490, y: 565, width: 600, height: 50, stability: 4, velY: -10 }),
			new Entity({ x: 90, y: 700, width: 150, height: 40, stability: 3, velY: -50 }),
			new Entity({ x: 780, y: 410, width: 25, height: 250, stability: 2, velX: -50, velY: -10 })
		];
		for(var i = 0; i < 70; i++) {
			this.entities.push(new Entity({
				x: 150 + 500 * Math.random(),
				y: 50 + 350 * Math.random(),
				width: 10 + 100 * Math.random() * Math.random(),
				height: 10 + 100 * Math.random() * Math.random(),
				gravityY: 150,
				stability: 1
			}));
		}
		this.fps = Global.FRAMES_PER_SECOND || 60;
		this._framesInLastSecond = 0;
		this._startTimeOfLastFPSPoll = now();
	}
	Game.prototype.update = function(t) {
		for(var i = 0; i < this.entities.length; i++) {
			this.entities[i].startOfMovement(t);
		}

		//move entities in steps
		var timeLeft = t;
		var numStepsLeft;
		if(Global.FORCE_NUM_MOVE_STEPS !== null) {
			numStepsLeft = Global.FORCE_NUM_MOVE_STEPS;
		}
		else {
			numStepsLeft = Math.max.apply(Math, this.entities.map(function(entity) {
				return entity.getNumMoveSteps(timeLeft);
			}));
		}
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
			if(Global.FORCE_NUM_MOVE_STEPS !== null) {
				numStepsLeft = Math.max.apply(Math, this.entities.map(function(entity) {
					return entity.getNumMoveSteps(timeLeft);
				}));
			}
			numStepsTaken++;
		}
		if(numStepsTaken >= 100) {
			throw new Error("Max steps taken in single frame (100)");
		}
		else if(Global.LOG_MOVE_STEPS_ABOVE !== null && numStepsTaken > Global.LOG_MOVE_STEPS_ABOVE) {
			console.log(numStepsTaken + (numStepsTaken === 1 ? " step" : " steps") + " taken in single frame");
		}

		for(var i = 0; i < this.entities.length; i++) {
			this.entities[i].endOfMovement(t);
		}

		//keep track of frame rate
		var time = now();
		this._framesInLastSecond++;
		if(time - this._startTimeOfLastFPSPoll >= 1000) {
			this.fps = this._framesInLastSecond;
			this._framesInLastSecond = 0;
			this._startTimeOfLastFPSPoll = time;
			console.log(this.fps);
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
			//find highest stability entities
			var stabilityVar, method, maxStability;
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

			//check to see if any entities with that as their NATURAL stability are colliding any others
			var entitiesWithMaxStability = [];
			for(i = 0; i < this.entities.length; i++) {
				if(this.entities[i][stabilityVar] === maxStability && this.entities[i].stability === maxStability) {
					entitiesWithMaxStability.push(this.entities[i]);
					for(j = i + 1; j < this.entities.length; j++) {
						if(this.entities[j][stabilityVar] === maxStability && this.entities[j].stability === maxStability) {
							//both entities are naturally the highest stability, check to see if they collide (and move them apart)
							this.entities[i][method](this.entities[j]);
							this.entities[j][method](this.entities[i]);
						}
					}
				}
			}

			//now those entities are in their final place -- check to see if anything is colliding with them
			for(i = 0; i < entitiesWithMaxStability.length; i++) {
				for(j = 0; j < this.entities.length; j++) {
					if(this.entities[j][stabilityVar] < maxStability) {
						var result = this.entities[j][method](entitiesWithMaxStability[i]);
						if(result && result.prevStability < maxStability && result.currStability === maxStability) {
							entitiesWithMaxStability.push(this.entities[j]);
						}
					}
				}
			}
		}
	};
	Game.prototype._checkForCollisionsWithEntity = function() {

	};
	Game.prototype.render = function() {
		Draw.rect(0, 0, Global.CANVAS_WIDTH, Global.CANVAS_HEIGHT, { fill: '#000' });
		for(var i = 0; i < this.entities.length; i++) {
			this.entities[i].render();
		}
	};
	return Game;
});