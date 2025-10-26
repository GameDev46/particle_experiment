import { piCollide } from "./piCollide.js";

// Setup scene
piCollide.setupScene("#131313");

let gravitationalConstant = 0.1;

// Read from right to left and top to bottom

// Green Yellow Purple Blue Red
// Red
// Blue
// Purple
// Yellow
// Green

let attractions = [[1, 1, 1, 1, -1], [-0.5, 1, 0, 1, -0.5], [0, 0, 1, -1, 1], [-1, 0, 0, 1, 0], [-0.5, 1, 0, -1, 1]];

let startAttractions = [
	[
		[1, 1, 1, 1, -1],
		[-0.5, 1, 0, 1, -0.5],
		[0, 0, 1, -1, 1],
		[-1, 0, 0, 1, 0],
		[-0.5, 1, 0, -1, 1]
	],
	[
		[-0.9, -0.901, 0.251, -0.462, 0.458],
		[0.992, -0.163, -0.501, 0.816, 0.951],
		[0.417, -0.134, 0.784, 0.522, -0.152],
		[-0.561, 0.714, 0, -0.541, 0.862],
		[-0.025, 0.1216, -0.796, -0.673, -0.698]
	],
	[
		[1, 0.5, -0.25, -0.25, -0.25],
		[-0.25, 1, 0.5, -0.25, -0.25],
		[-0.25, -0.25, 1, 0.5, -0.25],
		[-0.25, -0.25, -0.25, 1, 0.5],
		[0.5, -0.25, -0.25, -0.25, 1]
	],
	[
		[-0.5, 1.5, -1, -1, 1.5],
		[1.5, -0.5, 1.5, -1, -1],
		[-1, 1.5, -0.5, 1.5, -1],
		[-1, -1, 1.5, -0.5, 1.5],
		[1.5, -1, -1, 1.5, -0.5]
	]
];

let masses = [1, 1, 1, 1, 1];

let selectedAttractionMatrix = 0;

let gameIsPaused = true;

// Listeners
let particleTypeToAttract = -1

document.getElementById("attractionSelector").addEventListener("change", e => {
	particleTypeToAttract = Number(document.getElementById("attractionSelector").value);
})

document.getElementById("graviConst").addEventListener("change", e => {
	gravitationalConstant = Number(document.getElementById("graviConst").value);
})

document.getElementById("drag").addEventListener("change", e => {
	piCollide.drag = Number(document.getElementById("drag").value);
})

document.getElementById("gravity").addEventListener("change", e => {
	piCollide.gravity = Number(document.getElementById("gravity").value);
})

document.getElementById("openMatrix").addEventListener("click", e => {

	if (document.getElementById("matrix").style.transform == "scale(1)") {
		document.getElementById("matrix").style.transform = "scale(0)";
		document.getElementById("openMatrix").innerText = "Open Matrix";
	} else {
		document.getElementById("matrix").style.transform = "scale(1)";
		document.getElementById("openMatrix").innerText = "Close Matrix";
	}
})

document.getElementById("matrixSelector").addEventListener("change", e => {
	selectedAttractionMatrix = Number(document.getElementById("matrixSelector").value);
	resetMatrix("load");
})

document.getElementById("resetMatrix").addEventListener("click", e => {
	resetMatrix("load");
})

document.getElementById("clearMatrix").addEventListener("click", e => {
	resetMatrix("clear");
})

document.getElementById("randomiseMatrix").addEventListener("click", e => {
	resetMatrix("randomise");
})

document.getElementById("pause").addEventListener("click", e => {
	gameIsPaused = !gameIsPaused;
	
	document.getElementById("pause").innerHTML = '<i data-feather="pause"></i>';
	if (gameIsPaused) document.getElementById("pause").innerHTML = '<i data-feather="play"></i>';

	feather.replace();
})

document.getElementById("reset").addEventListener("click", e => {
	gameIsPaused = true;

	document.getElementById("pause").innerHTML = '<i data-feather="play"></i>';
	feather.replace();

	loadScene();
})

// Particle matrix
let matrixColours = [piCollide.rgbaToString(245, 97, 58, 1), piCollide.rgbaToString(75, 199, 236, 1), piCollide.rgbaToString(190, 0, 190, 1), piCollide.rgbaToString(190, 190, 0, 1), piCollide.rgbaToString(0, 190, 0, 1)]

let attractMatrixItems = document.querySelectorAll(".attractMatItem");
let massMatrixItems = document.querySelectorAll(".massMatItem");

function resetMatrix(clearType) {

	for (let i = 0; i < attractMatrixItems.length; i++) {
		// Set default values
		let secClass = attractMatrixItems[i].classList[1]
		secClass = secClass.split("-")

		if (clearType == "clear") {
			attractions[Number(secClass[0])][Number(secClass[1])] = 0;
		} else if (clearType == "load") {
			attractions[Number(secClass[0])][Number(secClass[1])] = startAttractions[selectedAttractionMatrix][Number(secClass[0])][Number(secClass[1])];
		} else {
			attractions[Number(secClass[0])][Number(secClass[1])] = (Math.random() * 2) - 1;
		}

		attractMatrixItems[i].value = attractions[Number(secClass[0])][Number(secClass[1])]

		// Colour matrix
		attractMatrixItems[i].style.borderColor = matrixColours[Number(secClass[0])];

		// Setup listeners
		attractMatrixItems[i].addEventListener("change", e => {
			let val = Number(attractMatrixItems[i].value)

			let secClass = attractMatrixItems[i].classList[1]
			secClass = secClass.split("-")

			attractions[Number(secClass[0])][Number(secClass[1])] = val
		});

	}

	for (let i = 0; i < massMatrixItems.length; i++) {

		// Set default values
		let secClass = massMatrixItems[i].classList[1]
		massMatrixItems[i].value = masses[Number(secClass[0])]

		// Setup listeners
		massMatrixItems[i].addEventListener("change", e => {
			let val = Number(massMatrixItems[i].value)

			let secClass = massMatrixItems[i].classList[1]
			masses[Number(secClass[0])] = val

			updateMasses()
		});

	}

}

resetMatrix("load");

function updateMasses() {
	for (let x = 0; x < piCollide.objects.length; x++) {
		piCollide.objects[x].mass = masses[piCollide.objects[x].particleType];
		//piCollide.objects[x].radius = masses[piCollide.objects[x].particleType] / 30;
	}
}

// Movement
function processMovement(delta) {
	let speed = 1000;

	if (piCollide.keyboard["W"]) piCollide.camera.position.y -= speed * delta;
	if (piCollide.keyboard["S"]) piCollide.camera.position.y += speed * delta;

	if (piCollide.keyboard["A"]) piCollide.camera.position.x -= speed * delta;
	if (piCollide.keyboard["D"]) piCollide.camera.position.x += speed * delta;
}

function effectCircles(delta) {
	if (piCollide.mouse.isDown[0]) {
		for (let x = 0; x < piCollide.objects.length; x++) {
			if (piCollide.objects[x].particleType == particleTypeToAttract || particleTypeToAttract == -1) {
				worldCenter.position.set(piCollide.mouse.position.x, piCollide.mouse.position.y);
				piCollide.attract(worldCenter, piCollide.objects[x], 8, delta * 100);
			}
		}
	}

	if (piCollide.mouse.isDown[2]) {
		for (let x = 0; x < piCollide.objects.length; x++) {
			if (piCollide.objects[x].particleType == particleTypeToAttract || particleTypeToAttract == -1) {
				worldCenter.position.set(piCollide.mouse.position.x, piCollide.mouse.position.y);
				piCollide.attract(worldCenter, piCollide.objects[x], -8, delta * 100);
			}
		}
	}

}

function loadScene() {

	// Clear the objects
	piCollide.objects = [];

	// Planet formation simulation
	piCollide.gravity = 0;
	piCollide.drag = 4;

	piCollide.colourBasedOnPressure = false;
	piCollide.colourBasedOnVelocity = false;

	let size = 25;
	let maxVel = 60;
	let spacing = 20

	let centerPos = {
		x: piCollide.canvas.width / 2,
		y: piCollide.canvas.height / 2
	}

	for (let x = 0; x < size; x++) {
		for (let y = 0; y < size; y++) {

			let r = 1

			let circleObject = piCollide.circleGeometry({
				radius: r,
				mass: 1,
				colour: piCollide.rgba(255, 255, 255, 1),
				bounce: 1,
				effects: {
					bloom: {
						strength: 0.1,
						diffuse: 1
					}
				}
			});

			circleObject.position.set((x * spacing) + centerPos.x - (size * spacing * 0.5), (y * spacing) + centerPos.y - (size * spacing * 0.5));
			circleObject.velocity.set((Math.random() * maxVel * 2) - maxVel, (Math.random() * maxVel * 2) - maxVel);

			circleObject.minDistance = 3;

			let randomChance = Math.random()
			//let randomChance = x / size

			if (randomChance > 0.8) {
				circleObject.particleType = 0
				circleObject.colour = piCollide.rgba(245, 97, 58, 1)
			} else if (randomChance > 0.6) {
				circleObject.particleType = 1
				circleObject.colour = piCollide.rgba(75, 199, 236, 1)
			} else if (randomChance > 0.4) {
				circleObject.particleType = 2
				circleObject.colour = piCollide.rgba(190, 0, 190, 1)
			} else if (randomChance > 0.2) {
				circleObject.particleType = 3
				circleObject.colour = piCollide.rgba(190, 190, 0, 1)
			} else {
				circleObject.particleType = 4
				circleObject.colour = piCollide.rgba(0, 190, 0, 1)
			}

			// Add a bounding box
			circleObject.boundingBox = {
				active: true,
				center: {
					x: 0,
					y: 0
				},
				scale: {
					x: piCollide.canvas.width,
					y: piCollide.canvas.height
				}
			}

			piCollide.addObject(circleObject);
		}
	}

}

function scenePhysics(delta) {
	for (let x = 0; x < piCollide.objects.length; x++) {
		for (let y = 0; y < piCollide.objects.length; y++) {
			if (x == y) continue;

			let firstPart = piCollide.objects[x].particleType;
			let secondType = piCollide.objects[y].particleType;

			piCollide.attractOne(piCollide.objects[x], piCollide.objects[y], gravitationalConstant * attractions[firstPart][secondType], delta);
		}
	}
}

// Game loop
loadScene()

piCollide.camera.position.set(0, 0);

let worldCenter = piCollide.emptyObject();

worldCenter.position.set(300, 300);
worldCenter.minDistance = 5;
worldCenter.mass = 100;

let physicsSubSteps = 1;

function worldUpdate() {

	let delta = piCollide.calculateDelta();
	delta = delta / physicsSubSteps;

	processMovement(delta)
	effectCircles(delta);

	piCollide.clock.isPaused = gameIsPaused;

	for (let i = 0; i < physicsSubSteps; i++) {
		scenePhysics(delta);

		piCollide.updatePhysics(delta);
		piCollide.updatePositions(delta);

	}

	piCollide.renderScene();

	requestAnimationFrame(worldUpdate);
}

requestAnimationFrame(worldUpdate);

