/// <reference path="math.js"/>
/// <reference path="drawer.js"/>

class ViewPad {
	/** @type {Drawer} */
	#cv = null;
	#d = 100;
	#p = new vec(0, -15);
	#r = new vec(0, 0);
	#t = new vec(0, 0);
	#pDrag = false;
	#rDrag = false;
	#tDrag = false;

	position = [0, 0, 0];
	eye = [0, 0, this.#d];
	upDirection = [0, 1, 0];
	rotation = 0;

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

		if (!(this.#pDrag || this.#rDrag || this.#tDrag)) {
			return;
		}

		if (this.#pDrag) {
			if (this.#cv.PressRight) {
				this.#p.x = 0;
				this.#p.y = -15;
			} else {
				this.#cv.Cursor.copyTo(this.#p);
			}
			let x = this.#p.x/2;
			let y = this.#p.y/2;
			this.position = [x, y, 0];
		}
		if (this.#rDrag) {
			if (this.#cv.PressRight) {
				this.#r.x = 0;
				this.#r.y = 0;
			} else {
				this.#cv.Cursor.copyTo(this.#r);
			}
			let nx = this.#r.x / this.#cv.Width;
			let ny = this.#r.y / this.#cv.Height;
			if (ny < -0.5) {
				ny = -0.5;
			} else if (ny > 0.5) {
				ny = 0.5;
			}
			this.rotation = 4 * Math.PI * nx;
			let t = Math.PI * ny;
			this.eye = [0, this.#d*Math.sin(t), this.#d*Math.cos(t)];
		}
		if (this.#tDrag) {
			if (this.#cv.PressRight) {
				this.#t.x = 0;
				this.#t.y = 0;
			} else {
				this.#cv.Cursor.copyTo(this.#t);
			}
			this.#t.y = this.#cv.Height/2 - 10;
			let t = Math.PI * this.#t.x / this.#cv.Width;
			this.upDirection = [-Math.sin(t), Math.cos(t), 0];
		}
		this.#draw();
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
		this.#cv.fillPie(this.#r, 8, Color.Transparent(Color.GREEN, 0.5));
		this.#cv.fillPie(this.#p, 8, Color.Transparent(Color.BLUE, 0.5));
		this.#cv.fillPie(this.#t, 8, Color.Transparent(Color.GRAY66, 0.7));
	}
}