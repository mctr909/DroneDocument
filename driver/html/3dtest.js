/// <reference path="math.js" />
/// <reference path="drawer.js" />
class Obj {
	/**
	 * @param {vec3[]} vert
	 * @param {Color} color
	 */
	constructor(vert, color) {
		/** @type {vec3[]} */
		this.vert = vert;
		/** @type {Color} */
		this.color = color;
		/** @type {mat4} */
		this.rot = new mat4();
		/** @type {mat4} */
		this.trans = new mat4();
	}
}

function display() {
	gDrawer.clear();
	let mvp = new mat4();
	let v = new vec3();
	for (let j=0; j<gObjs.length; j++) {
		let obj = gObjs[j];
		let vert = obj.vert;
		let color = obj.color;
		mat4.multiply(gMatP, gMatV, mvp);
		for (let i=0; i<vert.length; i++) {
			mat4.toVec(obj.rot, vert[i], v);
			mat4.toVec(obj.trans, v, v);
			mat4.toVec(mvp, v, v);
			gDrawer.fillCircleXY(v.X, v.Y, 2, color);
		}
	}
}

function init() {
	gDrawer.Offset = new vec3(gDrawer.Width/2, gDrawer.Height/2);
	mat4.perspective(45, 1, 10, 100, gMatP);
	{
		const PI2 = Math.atan(1)*8;
		let div = 48;
		gVerts.push([]);
		for (let j=1-div/4; j<div/4; j++) {
			let th = PI2 * j / div;
			for (let i=0; i<div; i++) {
				let ph = PI2 * i / div;
				let x = Math.cos(ph)*Math.cos(th);
				let y = Math.sin(th);
				let z = Math.sin(ph)*Math.cos(th);
				gVerts[0].push(new vec3(x, y, z));
			}
		}
	}
	gObjs.push(new Obj(gVerts[0], Color.BLUE));
	gObjs.push(new Obj(gVerts[0], Color.GREEN));
}

function loop() {
	let s = 60;
	let tx = Math.cos(th);
	let ty = Math.sin(th);
	th += Math.PI/180;
	gObjs[0].rot.set([
		tx, ty, 0, 0,
		-ty, tx, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	gObjs[0].trans.set([
		s, 0, 0, 0,
		0, s, 0, 0,
		0, 0, s, 0,
		0, 0, 0, 1
	]);
	gObjs[1].rot.set([
		tx, 0, ty, 0,
		0, 1, 0, 0,
		-ty, 0, tx, 0,
		0, 0, 0, 1
	]);
	gObjs[1].trans.set([
		s, 0, 0, 0,
		0, s, 0, 0,
		0, 0, s, 0,
		tx*s, -ty*s, 0, 1
	]);
	mat4.lookAt(
		new vec3(0.0, 1.0, 2.0),
		new vec3(0.0, 0.0, 0.0),
		new vec3(0.0, 1.0, 0.0),
		gMatV
	);
	display();
	requestAnimationFrame(loop);
}

let gDrawer = new Drawer("disp", 450, 400);
/** @type {vec3[][]} */
let gVerts = [];
/** @type {Obj[]} */
let gObjs = [];
/** @type {mat4} */
let gMatP = new mat4();
/** @type {mat4} */
let gMatV = new mat4();
let th = 0;
init();
requestAnimationFrame(loop);
