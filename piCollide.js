/*
╔═══╗             ╔╗       ╔╗    ╔══╗          ╔═══╗             ╔═══╗        ╔╗ ╔╗╔═══╗
║╔═╗║            ╔╝╚╗      ║║    ║╔╗║          ║╔═╗║             ╚╗╔╗║        ║║ ║║║╔══╝
║║ ╚╝╔═╗╔══╗╔══╗ ╚╗╔╝╔══╗╔═╝║    ║╚╝╚╗╔╗ ╔╗    ║║ ╚╝╔══╗ ╔╗╔╗╔══╗ ║║║║╔══╗╔╗╔╗║╚═╝║║╚══╗
║║ ╔╗║╔╝║╔╗║╚ ╗║  ║║ ║╔╗║║╔╗║    ║╔═╗║║║ ║║    ║║╔═╗╚ ╗║ ║╚╝║║╔╗║ ║║║║║╔╗║║╚╝║╚══╗║║╔═╗║
║╚═╝║║║ ║║═╣║╚╝╚╗ ║╚╗║║═╣║╚╝║    ║╚═╝║║╚═╝║    ║╚╩═║║╚╝╚╗║║║║║║═╣╔╝╚╝║║║═╣╚╗╔╝   ║║║╚═╝║
╚═══╝╚╝ ╚══╝╚═══╝ ╚═╝╚══╝╚══╝    ╚═══╝╚═╗╔╝    ╚═══╝╚═══╝╚╩╩╝╚══╝╚═══╝╚══╝ ╚╝    ╚╝╚═══╝
																			╔═╝║                                              
																			╚══╝                                              


*/

/* 2D ball physics engine -- copyright of GameDev46 */
/* https://replit.com/@GameDev46 */

/* Please do not remove these comments from the file */

/* ------------------------------------ */

let piCollide = {
	objects: [],
	gravity: 9.81,
	drag: 0.99,
	ctx: null,
	canvas: null,
	keyboard: {},
	collisions: {},
	physicsGridSize: 0,
	ID: 0,
	colourBasedOnPressure: false,
	colourBasedOnVelocity: false,
	background: "#ffffff",
	camera: {
		position: {
			x: 0,
			y: 0,
			set: function(newX, newY) {
				this.x = newX;
				this.y = newY;
			}
		}
	},
	clock: {
		lastUpdate: Date.now(),
		FPS: 0,
		isPaused: false
	},
	mouse: {
		position: { x: 300, y: 300 },
		localPosition: { x: 300, y: 300 },
		isDown: [false, false, false]
	},
	addObject: function(object) {
		this.objects.push(object);
	},
	setupScene: function(backgroundColour) {
		// Get reference to canvas

		this.background = backgroundColour;

		this.canvas = document.getElementById("scene");

		this.ctx = this.canvas.getContext("2d");

		window.addEventListener("resize", e => {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
		})

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		// Add mouse event listeners - Computer

		this.canvas.addEventListener("contextmenu", e => {
			e.preventDefault();
		})

		this.canvas.addEventListener("mousedown", e => {
			e.preventDefault();

			this.mouse.isDown[e.button] = true;

			this.mouse.localPosition = { x: e.pageX, y: e.pageY };
			this.mouse.position = { x: e.pageX + this.camera.position.x, y: e.pageY + this.camera.position.y };
		})

		this.canvas.addEventListener("mousemove", e => {
			e.preventDefault();

			this.mouse.localPosition = { x: e.pageX, y: e.pageY }
			this.mouse.position = { x: e.pageX + this.camera.position.x, y: e.pageY + this.camera.position.y };
		})

		this.canvas.addEventListener("mouseup", e => {
			e.preventDefault();

			this.mouse.isDown[e.button] = false;

			this.mouse.localPosition = { x: e.pageX, y: e.pageY }
			this.mouse.position = { x: e.pageX + this.camera.position.x, y: e.pageY + this.camera.position.y };
		})

		// Add touch event listeners - mobile

		this.canvas.addEventListener("touchstart", e => {
			this.mouse.isDown[0] = true;

			this.mouse.localPosition = { x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY }
			this.mouse.position = { x: e.changedTouches[0].pageX + this.camera.position.x, y: e.changedTouches[0].pageY + this.camera.position.y };
		})

		this.canvas.addEventListener("touchmove", e => {
			this.mouse.localPosition = { x: e.touches[0].pageX, y: e.touches[0].pageY }
			this.mouse.position = { x: e.changedTouches[0].pageX + this.camera.position.x, y: e.changedTouches[0].pageY + this.camera.position.y };
		})

		this.canvas.addEventListener("touchend", e => {
			this.mouse.isDown[0] = false;
			this.mouse.localPosition = { x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY }
			this.mouse.position = { x: e.changedTouches[0].pageX + this.camera.position.x, y: e.changedTouches[0].pageY + this.camera.position.y };
		})

		// Add key press event listeners

		window.addEventListener("keydown", e => {
			this.keyboard[e.key.toUpperCase()] = true;
		})

		window.addEventListener("keyup", e => {
			this.keyboard[e.key.toUpperCase()] = false;
		})

	},
	degreesToRadians: function(degrees) {
		let pi = Math.PI;
		return degrees * (pi / 180);
	},
	distance: function(obj1, obj2) {
		// Calculate the distance between 2 objects
		let xSquare = (obj2.position.x - obj1.position.x) * (obj2.position.x - obj1.position.x)
		let ySquare = (obj2.position.y - obj1.position.y) * (obj2.position.y - obj1.position.y)

		return Math.sqrt(xSquare + ySquare)
	},
	computeOverlap: function(obj1, obj2) {
		// Calculate if the objects are overllapping

		let overlap = 99999;

		// Only compute distance if object is next to object in grid

		if (obj1.grid.x == obj2.grid.x || obj1.grid.x - 1 == obj2.grid.x || obj1.grid.x + 1 == obj2.grid.x) {
			if (obj1.grid.y == obj2.grid.y || obj1.grid.y - 1 == obj2.grid.y || obj1.grid.y + 1 == obj2.grid.y) {

				// Computer overlap distance
				overlap = this.distance(obj1, obj2) - (obj1.radius + obj2.radius)

			}
		}

		if (overlap < 0) {
			// Objects are overlapping

			let radians = Math.atan2(obj2.position.y - obj1.position.y, obj2.position.x - obj1.position.x)

			if (obj1.isKinematic || obj2.isKinematic) overlap *= 2;

			if (!obj1.isKinematic) {
				obj1.position.x += overlap * Math.cos(radians) * 0.5;
				obj1.position.y += overlap * Math.sin(radians) * 0.5;
			}

			if (!obj2.isKinematic) {
				obj2.position.x -= overlap * Math.cos(radians) * 0.5;
				obj2.position.y -= overlap * Math.sin(radians) * 0.5;
			}

			return { result: true, angle: radians };
		}

		return { result: false, angle: null };

	},
	updatePhysics: function(delta) {
		// Calculate the physics for each object in the scene

		if (this.clock.isPaused) {
			return;
		}

		this.collisions = {};

		for (let x = 0; x < this.objects.length; x++) {

			// Apply gravity to object

			this.objects[x].velocity.y += this.gravity * this.objects[x].mass * delta;

			// Add on drag to velocities

			for (let y = 0; y < this.objects.length; y++) {

				if (x == y) {
					continue;
				}

				let overlapCheckResult = this.computeOverlap(this.objects[x], this.objects[y]);

				if (overlapCheckResult.result) {
					// Objects were overlapping

					// Store each objects collision count

					if (this.collisions[this.objects[y].ID] == null) {
						this.collisions[this.objects[y].ID] = 0;
					}

					if (this.collisions[this.objects[x].ID] == null) {
						this.collisions[this.objects[x].ID] = 0;
					}

					this.collisions[this.objects[y].ID] += 1;
					this.collisions[this.objects[x].ID] += 1;

					// Caculate and apply momentum to each object

					let obj1Vel = { x: this.objects[y].velocity.x * (this.objects[y].mass / this.objects[x].mass), y: this.objects[y].velocity.y * (this.objects[y].mass / this.objects[x].mass) };

					let obj2Vel = { x: this.objects[x].velocity.x * (this.objects[x].mass / this.objects[y].mass), y: this.objects[x].velocity.y * (this.objects[x].mass / this.objects[y].mass) };

					this.objects[x].velocity.x = obj1Vel.x * this.objects[x].bounce;
					this.objects[x].velocity.y = obj1Vel.y * this.objects[x].bounce;

					this.objects[y].velocity.x = obj2Vel.x * this.objects[y].bounce;
					this.objects[y].velocity.y = obj2Vel.y * this.objects[y].bounce;
				}

			}
		}

	},
	attract: function(obj1, obj2, gravitationalConst, delta) {
		// Attract objects to a certain position

		if (this.clock.isPaused) {
			return;
		}

		let radians = Math.atan2(obj1.position.y - obj2.position.y, obj1.position.x - obj2.position.x);

		let attractionForce = (gravitationalConst * ((obj2.mass * obj1.mass) / Math.max((obj1.minDistance || 0.01), this.distance(obj1, obj2) ^ 2))) * delta

		obj1.velocity.x += Math.cos(radians) * (-attractionForce / obj1.mass);
		obj1.velocity.y += Math.sin(radians) * (-attractionForce / obj1.mass);

		obj2.velocity.x += Math.cos(radians) * (attractionForce / obj2.mass);
		obj2.velocity.y += Math.sin(radians) * (attractionForce / obj2.mass);

	},
	attractOne: function(obj1, obj2, gravitationalConst, delta) {
		// Attract objects to a certain position

		if (this.clock.isPaused) {
			return;
		}

		if (gravitationalConst != 0) {

			let radians = Math.atan2(obj1.position.y - obj2.position.y, obj1.position.x - obj2.position.x);

			let closestDistance = 20;
			let largestAttractionDist = 65;

			let dist = this.distance(obj1, obj2) ^ 2;
			dist *= 2;

			let getUpdwardLineEquation = xPos => { return (gravitationalConst * 10 * (xPos - closestDistance)); }

			let upwardLineEquation = getUpdwardLineEquation(dist);
			let meetingPoint = getUpdwardLineEquation(largestAttractionDist);

			if (dist > largestAttractionDist) upwardLineEquation = (gravitationalConst * -30 * (dist - largestAttractionDist)) + meetingPoint;

			let furthestAttractionDist = (-meetingPoint / (gravitationalConst * -30)) + largestAttractionDist;

			if (dist > furthestAttractionDist) upwardLineEquation = 0;

			if (dist < closestDistance) upwardLineEquation = 10 * (dist - closestDistance);

			let attractionForce = (obj2.mass * obj1.mass) * upwardLineEquation * delta

			obj1.velocity.x += Math.cos(radians) * (-attractionForce / obj1.mass);
			obj1.velocity.y += Math.sin(radians) * (-attractionForce / obj1.mass);

		}

	},
	distanceJoint: function(obj1, obj2, power, delta) {
		// Add a distance joint between the 2 objects

		if (this.clock.isPaused) {
			return;
		}

		let tempDrag = 0.99;

		let currentDistance = (this.distance(obj1, obj2) - obj1.radius) - obj2.radius;
		currentDistance = currentDistance / 2;

		let radians = Math.atan2(obj1.position.y - obj2.position.y, obj1.position.x - obj2.position.x);

		if (!obj1.isKinematic) {
			obj1.position.x += Math.cos(radians) * -currentDistance * power;
			obj1.position.y += Math.sin(radians) * -currentDistance * power;

			obj1.velocity.x = obj1.velocity.x * tempDrag;
			obj1.velocity.y = obj1.velocity.y * tempDrag;
		}

		if (!obj2.isKinematic) {
			obj2.position.x += Math.cos(radians) * currentDistance * power;
			obj2.position.y += Math.sin(radians) * currentDistance * power;

			obj2.velocity.x = obj2.velocity.x * tempDrag;
			obj2.velocity.y = obj2.velocity.y * tempDrag;
		}

	},
	updatePositions: function(delta) {
		// Update the objects positions in the scene

		if (this.clock.isPaused) {
			return;
		}

		for (let x = 0; x < this.objects.length; x++) {

			this.objects[x].velocity.x -= this.objects[x].velocity.x * delta * this.drag;
			this.objects[x].velocity.y -= this.objects[x].velocity.y * delta * this.drag;

			if (this.objects[x].isKinematic) {
				this.objects[x].velocity.x = 0;
				this.objects[x].velocity.y = 0;
			}

			this.objects[x].position.x += this.objects[x].velocity.x * delta;
			this.objects[x].position.y += this.objects[x].velocity.y * delta;

			// Check if object is in a bounding box

			let boundingData = this.objects[x].boundingBox;

			if (boundingData.active == true) {
				// Keep object in bounding box

				this.objects[x].position.x = Math.max(this.objects[x].position.x, boundingData.center.x);
				this.objects[x].position.x = Math.min(this.objects[x].position.x, boundingData.center.x + boundingData.scale.x);

				this.objects[x].position.y = Math.max(this.objects[x].position.y, boundingData.center.y);
				this.objects[x].position.y = Math.min(this.objects[x].position.y, boundingData.center.y + boundingData.scale.y);
			}

			this.objects[x].grid.x = Math.round(this.objects[x].position.x / this.physicsGridSize);
			this.objects[x].grid.y = Math.round(this.objects[x].position.y / this.physicsGridSize);

		}
	},
	renderScene: function() {
		// Draw all the objects in the scene to the screen

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.fillStyle = this.background
		this.ctx.fillRect(0, 0, this.canvas.width * 2, this.canvas.height * 2)

		for (let x = 0; x < this.objects.length; x++) {

			// Colour object based on velocity and pressure

			let totalVel = Math.abs(this.objects[x].velocity.x) + Math.abs(this.objects[x].velocity.y);
			let totalColl = this.collisions[this.objects[x].ID] || 0;

			if (this.colourBasedOnPressure || this.colourBasedOnVelocity) {
				this.objects[x].colour = this.rgba(255 - (totalColl * 15), 255 - ((totalColl * 15) + (totalVel * 1)), 255 - (totalVel * 1), 1);
			}

			// Apply bloom if set

			if (this.objects[x].effects != null) {
				this.ctx.fillStyle = this.rgbaToString(this.objects[x].colour.r, this.objects[x].colour.g, this.objects[x].colour.b, this.objects[x].effects.bloom.strength);

				this.ctx.beginPath();
				this.ctx.arc(this.objects[x].position.x - this.camera.position.x, this.objects[x].position.y - this.camera.position.y, this.objects[x].radius + this.objects[x].effects.bloom.diffuse, 0, 2 * Math.PI);
				this.ctx.fill();
			}

			this.ctx.fillStyle = this.rgbaToString(this.objects[x].colour.r, this.objects[x].colour.g, this.objects[x].colour.b, this.objects[x].colour.a);

			this.ctx.beginPath();
			this.ctx.arc(this.objects[x].position.x - this.camera.position.x, this.objects[x].position.y - this.camera.position.y, this.objects[x].radius, 0, 2 * Math.PI);
			this.ctx.fill();

		}
	},
	createBridge: function(ropeData) {

		let ropePieces = [];

		let radians = this.degreesToRadians(ropeData.angle);

		for (let i = 0; i < ropeData.length; i++) {

			let bridgeChunk = this.circleGeometry({
				radius: ropeData.piece.radius,
				mass: ropeData.piece.mass,
				colour: ropeData.piece.colour,
				bounce: ropeData.piece.bounce,
				effects: ropeData.piece.effects || null
			});

			if (i == 0 || i == ropeData.length - 1) {
				// Set end points to be static
				bridgeChunk.isKinematic = true;

				if (i == 0) {
					bridgeChunk.position.set(ropeData.startPosition.x, ropeData.startPosition.y);
				}
				else {
					bridgeChunk.position.set(Math.cos(radians) * ropeData.length * ropeData.spacing, Math.sin(radians) * ropeData.length * ropeData.spacing);
				}
			}

			bridgeChunk.position.set(ropeData.startPosition.x + (i * ropeData.spacing * Math.cos(radians)), ropeData.startPosition.y + (i * ropeData.spacing * Math.sin(radians)));

			this.addObject(bridgeChunk);

			ropePieces.push(bridgeChunk);
		}

		return ropePieces;

	},
	createRope: function(ropeData) {
		let ropePieces = [];

		let radians = this.degreesToRadians(ropeData.angle);

		for (let i = 0; i < ropeData.length; i++) {

			let ropeChunk = this.circleGeometry({
				radius: ropeData.piece.radius,
				mass: ropeData.piece.mass,
				colour: ropeData.piece.colour,
				bounce: ropeData.piece.bounce,
				effects: ropeData.piece.effects || null
			});

			if (i == 0) {
				// Set end points to be static
				ropeChunk.isKinematic = true;
				ropeChunk.position.set(ropeData.startPosition.x, ropeData.startPosition.y);
			}

			ropeChunk.position.set(ropeData.startPosition.x + (i * ropeData.spacing * Math.cos(radians)), ropeData.startPosition.y + (i * ropeData.spacing * Math.sin(radians)));

			this.addObject(ropeChunk);

			ropePieces.push(ropeChunk);
		}

		return ropePieces;
	},
	calculateDelta: function() {
		// Use the last update to calculate the delta of the current frame

		let timeDifference = Date.now() - this.clock.lastUpdate;
		this.clock.lastUpdate = Date.now();
		this.clock.FPS = Math.floor(1 / (timeDifference / 1000));

		return timeDifference / 1000;
	},
	rgba: function(red, green, blue, alpha) {
		// Return in a string format
		return { r: red, g: green, b: blue, a: alpha }
	},
	rgbaToString: function(red, green, blue, alpha) {
		// Return in a string format
		return "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
	},
	circleGeometry: function(data) {
		// Create and add circle to the scene
		let obj = {
			radius: data.radius || 10,
			mass: data.mass || 40,
			colour: data.colour || 0x000000,
			position: {
				x: 0,
				y: 0,
				set: function(newX, newY) {
					this.x = newX;
					this.y = newY;
				}
			},
			velocity: {
				x: 0,
				y: 0,
				set: function(newX, newY) {
					this.x = newX;
					this.y = newY;
				}
			},
			boundingBox: data.boundingBox || {
				active: false,
				center: {
					x: 0,
					y: 0
				},
				scale: {
					x: 0,
					y: 0
				}
			},
			bounce: data.bounce || 0,
			ID: this.ID,
			grid: {
				x: 0,
				y: 0
			},
			isKinematic: data.isKinematic || false,
			effects: data.effects || null
		}

		this.ID += 1;

		// Check if physics grid is large enough

		if ((obj.radius * 2) + 5 > this.physicsGridSize) {
			this.physicsGridSize = (obj.radius * 2) + 5;
		}

		return obj;
	},
	emptyObject: function() {
		let obj = {
			position: {
				x: 0,
				y: 0,
				set: function(newX, newY) {
					this.x = newX;
					this.y = newY;
				}
			},
			velocity: {
				x: 0,
				y: 0,
				set: function(newX, newY) {
					this.x = newX;
					this.y = newY;
				}
			},
			ID: this.ID,
			grid: {
				x: 0,
				y: 0
			}
		}

		this.ID += 1;

		return obj;
	}
}

// Pause physics when user leaves tab

document.addEventListener('visibilitychange', function(e) {
	piCollide.clock.isPaused = document.hidden;
});

export { piCollide };