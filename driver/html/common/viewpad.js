/// <reference path="math.js"/>
/// <reference path="drawer.js"/>

class ViewPad {
	/** @type {Drawer} */
	#cv = null;
	#p = new vec(0, -15);
	#r = new vec(0, 0);
	#t = new vec(0, 0);
	#pDrag = false;
	#rDrag = false;
	#tDrag = false;
	#elevation = 0;
	#tilte = 0;

	position = [0, 0, 0];
	azimuth = 0;
	get elevation() { return this.#elevation; }
	get tilte() { return this.#tilte; }

	/**
	 * @param {string} id
	 * @param {number} width
	 * @param {number} height
	 */
	constructor(id, width, height) {
		this.#cv = new Drawer(id, width, height);
		this.#t = new vec(0, height/2 - 10);
		this.#draw();
	}

	setElevation(deg) {
		let rad = Math.PI * deg / 180;
		this.#elevation = rad;
		this.#r.y = this.#cv.Height * deg / 180;
		this.#draw();
	}

	setTilte(deg) {
		let rad = Math.PI * deg / 180;
		this.#tilte = rad;
		this.#t.x = -this.#cv.Width * deg / 180;
		this.#draw();
	}

	update() {
		if (this.#cv.IsDrag) {
			if (!(this.#tDrag || this.#rDrag) && vec.distance(this.#p, this.#cv.Cursor) < 8) {
				this.#pDrag = true;
			}
			if (!(this.#tDrag || this.#pDrag) && vec.distance(this.#r, this.#cv.Cursor) < 8) {
				this.#rDrag = true;
			}
			if (!(this.#rDrag || this.#pDrag) && vec.distance(this.#t, this.#cv.Cursor) < 8) {
				this.#tDrag = true;
			}
		} else {
			this.#pDrag = false;
			this.#rDrag = false;
			this.#tDrag = false;
		}

		if (this.#pDrag) {
			if (this.#cv.PressRight) {
				this.#p.x = 0;
				this.#p.y = -15;
			} else {
				this.#cv.Cursor.copyTo(this.#p);
			}
			let x = this.#p.x;
			let y = this.#p.y;
			this.position = [x, y, 0];
		}

		if (this.#rDrag) {
			if (this.#cv.PressRight) {
				this.#r.x = 0;
				this.#r.y = this.#cv.Height / 4;
			} else {
				this.#cv.Cursor.copyTo(this.#r);
			}
			this.azimuth = 4 * Math.PI * this.#r.x / this.#cv.Width;
			let y = this.#r.y / this.#cv.Height;
			if (y < -0.5) {
				y = -0.5;
			} else if (y > 0.5) {
				y = 0.5;
			}
			this.#elevation = Math.PI * y;
		}

		if (this.#tDrag) {
			if (this.#cv.PressRight) {
				this.#t.x = 0;
			} else {
				this.#cv.Cursor.copyTo(this.#t);
			}
			this.#t.y = this.#cv.Height/2 - 10;
			this.#tilte = -Math.PI * this.#t.x / this.#cv.Width;
		}

		if (this.#pDrag || this.#rDrag || this.#tDrag) {
			this.#draw();
		}
	}

	#draw() {
		let l = this.#cv.Width/2;
		let r = -l;
		let t = this.#cv.Height/2;
		let b = -t;
		this.#cv.clear();
		this.#cv.drawLineXY(l, t, r, t, Color.BLACK, 2);
		this.#cv.drawLineXY(l, b, r, b, Color.BLACK, 2);
		this.#cv.drawLineXY(l, t, l, b, Color.BLACK, 2);
		this.#cv.drawLineXY(r, t, r, b, Color.BLACK, 2);
		this.#cv.drawLineXY(l, 0, r, 0, Color.GREEN, 2);
		this.#cv.drawLineXY(0, t, 0, b, Color.GREEN, 2);
		this.#cv.drawLineXY(l, this.#t.y, r, this.#t.y, Color.GRAY66, 2);
		this.#cv.fillPie(this.#r, 8, Color.GREEN.transparent(0.5));
		this.#cv.fillPie(this.#p, 8, Color.BLUE.transparent(0.5));
		this.#cv.fillPie(this.#t, 8, Color.GRAY66.transparent(0.7));
	}
}
