/// <reference path="math.js" />

class Color {
	static get BLACK() { return new Color(0, 0, 0); }
	static get GRAY25() { return new Color(63, 63, 63); }
	static get GRAY33() { return new Color(85, 85, 85); }
	static get GRAY50() { return new Color(127, 127, 127); }
	static get GRAY66() { return new Color(170, 170, 170); }
	static get GRAY75() { return new Color(191, 191, 191); }
	static get WHITE() { return new Color(255, 255, 255); }
	static get RED() { return new Color(211, 0, 0); }
	static get GREEN() { return new Color(0, 167, 0); }
	static get BLUE() { return new Color(0, 0, 255); }
	static get MAGENTA() { return new Color(228, 0, 127); }
	static get YELLOW() { return new Color(255, 255, 0); }
	static get CYAN() { return new Color(0, 161, 233); }

	#array = new Float32Array(4);

	get r() { return this.#array[0]; }
	get g() { return this.#array[1]; }
	get b() { return this.#array[2]; }
	get a() { return this.#array[3]; }

	/**
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @param {number} a
	 */
	constructor(r, g, b, a=1) {
		this.#array[0] = r;
		this.#array[1] = g;
		this.#array[2] = b;
		this.#array[3] = a;
	}

	/**
	 * @param {number} alpha
	 * @returns {Color}
	 */
	transparent(alpha) {
		return new Color(
			this.#array[0],
			this.#array[1],
			this.#array[2],
			alpha
		);
	}
}

class Drawer {
	static FRAME_RATE = 60;

	static #FONT_NAME = "Cambria Math";
	/** @type {number} */
	static #CURSOR_DIV = 2;

	get Width() { return this.#element.width; }
	get Height() { return this.#element.height; }
	get IsDrag() { return this.#isDrag; }
	get PressRight() { return this.#pressRight; }
	Cursor = new vec();

	/** @type {HTMLCanvasElement} */
	#element;
	/** @type {CanvasRenderingContext2D} */
	#ctx;
	#offset = new vec();
	#isDrag = false;
	#pressRight = false;

	/**
	 * @param {string} canvasId
	 * @param {number} width
	 * @param {number} height
	 */
	constructor(canvasId, width, height) {
		this.#element = document.getElementById(canvasId);
		this.#element.width = width;
		this.#element.height = height;

		this.#offset = new vec(width/2, height/2);

		let self = this;
		this.#element.addEventListener("mousemove", function(ev) {
			self.#roundCursor(ev.offsetX, ev.offsetY);
		});
		this.#element.addEventListener("touchmove", function(ev) {
			ev.preventDefault();
			let rect = self.#element.getBoundingClientRect();
			let x = ev.changedTouches[0].pageX - rect.left;
			let y = ev.changedTouches[0].pageY - rect.top;
			self.#roundCursor(x, y);
		});
		this.#element.addEventListener("mousedown", function(ev) {
			switch (ev.button) {
			case 0:
				self.#isDrag = true;
				break;
			case 2:
				self.#isDrag = true;
				self.#pressRight = true;
				break;
			}
		});
		this.#element.addEventListener("mouseup", function(ev) {
			switch (ev.button) {
			case 0:
				self.#isDrag = false;
				break;
			case 2:
				self.#isDrag = false;
				self.#pressRight = false;
				break;
			}
		});
		this.#element.addEventListener("touchstart", function(ev) {
			ev.preventDefault();
			self.#isDrag = true;
		});
		this.#element.addEventListener("touchend", function(ev) {
			ev.preventDefault();
			self.#isDrag = false;
		});

		this.#ctx = this.#element.getContext("2d");
		this.#ctx.scale(1, 1);

		window.requestNextAnimationFrame = (function () {
			var originalWebkitRequestAnimationFrame = undefined;
			var wrapper = undefined;
			var callback = undefined;
			var self = this;

			// Workaround for Chrome 10 bug where Chrome
			// does not pass the time to the animation function
			if (window.webkitRequestAnimationFrame) {
				// Define the wrapper
				wrapper = function (time) {
					if (time === undefined) {
						time = +new Date();
					}
					self.callback(time);
				};

				// Make the switch
				originalWebkitRequestAnimationFrame = window.webkitRequestAnimationFrame;
				window.webkitRequestAnimationFrame = function (callback, element) {
					self.callback = callback;
					// Browser calls the wrapper and wrapper calls the callback
					originalWebkitRequestAnimationFrame(wrapper, element);
				}
			}

			return window.requestAnimationFrame    ||
				window.webkitRequestAnimationFrame ||
				window.oRequestAnimationFrame      ||
				window.msRequestAnimationFrame     ||
				function (callback, element) {
					var start, finish;
					window.setTimeout( function () {
						start = +new Date();
						callback(start);
						finish = +new Date();
						self.timeout = 1000 / Drawer.FRAME_RATE - (finish - start);
					}, self.timeout);
				}
			;
		})();
	}

	clear() {
		var w = this.#element.width;
		var h = this.#element.height;
		this.#ctx.clearRect(0, 0, w, h);
	}

	/**
	 * @param {vec} a
	 * @param {vec} b
	 * @param {Color} color
	 * @param {number} width
	 */
	drawLine(a, b, color = Color.BLACK, width = 1) {
		this.drawLineXY(a.x, a.y, b.x, b.y, color, width);
	}

	/**
	 * @param {number} ax
	 * @param {number} ay
	 * @param {number} bx
	 * @param {number} by
	 * @param {Color} color
	 * @param {number} width
	 */
	drawLineXY(ax, ay, bx, by, color = Color.BLACK, width = 1) {
		let x1 = this.#offset.x + ax;
		let y1 = this.#offset.y - ay;
		let x2 = this.#offset.x + bx;
		let y2 = this.#offset.y - by;
		this.#ctx.beginPath();
		this.#ctx.strokeStyle = "rgba("
			+ color.r + ","
			+ color.g + ","
			+ color.b + ","
			+ color.a + ")";
		this.#ctx.lineWidth = width;
		this.#ctx.moveTo(x1, y1);
		this.#ctx.lineTo(x2, y2);
		this.#ctx.setLineDash([]);
		this.#ctx.stroke();
	}

	/**
	 * @param {vec} center
	 * @param {number} radius
	 * @param {Color} color
	 * @param {number} begin
	 * @param {number} elapse
	 * @param {number} width
	 */
	drawArc(center, radius, color = Color.BLACK, begin = 0, elapse = 2 * Math.PI, width = 1) {
		this.drawArcXY(center.x, center.y, radius, color, begin, elapse, width)
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} radius
	 * @param {Color} color
	 * @param {number} begin
	 * @param {number} elapse
	 * @param {number} width
	 */
	drawArcXY(x, y, radius, color = Color.BLACK, begin = 0, elapse = 2 * Math.PI, width = 1) {
		this.#ctx.beginPath();
		this.#ctx.arc(
			this.#offset.x + x,
			this.#offset.y - y,
			radius,
			-begin,
			-elapse,
			true
		);
		this.#ctx.strokeStyle = "rgba("
			+ color.r + ","
			+ color.g + ","
			+ color.b + ","
			+ color.a + ")";
		this.#ctx.lineWidth = width;
		this.#ctx.setLineDash([]);
		this.#ctx.stroke();
	}

	/**
	 * @param {vec} center
	 * @param {number} radius
	 * @param {Color} color
	 * @param {number} begin
	 * @param {number} elapse
	 */
	fillPie(center, radius, color = Color.BLACK, begin = 0, elapse = 2 * Math.PI) {
		this.fillPieXY(center.x, center.y, radius, color, begin, elapse);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} radius
	 * @param {Color} color
	 * @param {number} begin
	 * @param {number} elapse
	 */
	fillPieXY(x, y, radius, color = Color.BLACK, begin = 0, elapse = 2 * Math.PI) {
		this.#ctx.beginPath();
		this.#ctx.arc(
			this.#offset.x + x,
			this.#offset.y - y,
			radius,
			-begin,
			-elapse,
			true
		);
		this.#ctx.fillStyle = "rgba("
			+ color.r + ","
			+ color.g + ","
			+ color.b + ","
			+ color.a + ")";
		this.#ctx.fill();
	}

	/**
	 * @param {Array<vec>} points
	 * @param {Color} color
	 * @param {number} width
	 */
	drawPolygon(points, color = Color.BLACK, width = 1) {
		this.#ctx.beginPath();
		this.#ctx.moveTo(this.#offset.x + points[0].x, this.#offset.y - points[0].y);
		for (let i=1; i<points.length; i++) {
			this.#ctx.lineTo(this.#offset.x + points[i].x, this.#offset.y - points[i].y);
		}
		this.#ctx.lineWidth = width;
		this.#ctx.strokeStyle = "rgba("
			+ color.r + ","
			+ color.g + ","
			+ color.b + ","
			+ color.a + ")";
		this.#ctx.setLineDash([]);
		this.#ctx.stroke();
	}

	/**
	 * @param {Array<vec>} points
	 * @param {Color} color
	 */
	fillPolygon(points, color = Color.BLACK) {
		this.#ctx.beginPath();
		this.#ctx.moveTo(this.#offset.x+points[0].x, this.#offset.y-points[0].y);
		for (let i=1; i<points.length; i++) {
			this.#ctx.lineTo(this.#offset.x+points[i].x, this.#offset.y-points[i].y);
		}
		this.#ctx.fillStyle = "rgba("
			+ color.r + ","
			+ color.g + ","
			+ color.b + ","
			+ color.a + ")";
		this.#ctx.fill();
	}

	/**
	 * @param {string} value
	 * @param {vec} p
	 * @param {number} size
	 * @param {Color} color
	 */
	drawString(value, p, size = 11, color = Color.BLACK) {
		this.drawStringXY(value, p.x, p.y, size, color);
	}

	/**
	 * @param {string} value
	 * @param {number} x
	 * @param {number} y
	 * @param {number} size
	 * @param {Color} color
	 */
	drawStringXY(value, x, y, size = 11, color = Color.BLACK) {
		this.#ctx.font = size + "px " + Drawer.#FONT_NAME;
		this.#ctx.fillStyle = "rgba("
			+ color.r + ","
			+ color.g + ","
			+ color.b + ","
			+ color.a + ")";
		this.#ctx.translate(x, y);
		let sz = this.#ctx.measureText(value);
		this.#ctx.fillText(value, -sz.width*0.5, 0);
		this.#ctx.translate(-x, -y);
	}

	/**
	 * @param {string} value
	 * @param {vec} p
	 * @param {number} size
	 * @param {Color} color
	 */
	drawStringC(value, p, size = 11, color = Color.BLACK) {
		this.drawStringCXY(value, p.x, p.y, size, color);
	}

	/**
	 * @param {string} value
	 * @param {number} x
	 * @param {number} y
	 * @param {number} size
	 * @param {Color} color
	 */
	drawStringCXY(value, x, y, size = 11, color = Color.BLACK) {
		this.#ctx.font = size + "px " + Drawer.#FONT_NAME;
		this.#ctx.fillStyle = "rgba("
			+ color.r + ","
			+ color.g + ","
			+ color.b + ","
			+ color.a + ")";
		let lines = value.split("\n");
		let px = this.#offset.x + x;
		let py = this.#offset.y - y + size / 2;
		for(let i=0; i<lines.length; i++) {
			let met = this.#ctx.measureText(lines[i]);
			this.#ctx.fillText(lines[i], px - met.width / 2, py);
			py += size;
		}
	}

	/**
	 * @param {string} value
	 * @param {number} size
	 * @return {number}
	 */
	getTextWidth(value, size = 11) {
		this.#ctx.font = size + "px " + Drawer.#FONT_NAME;
		return this.#ctx.measureText(value).width;
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 */
	#roundCursor(x, y) {
		this.Cursor.x = parseInt(x / Drawer.#CURSOR_DIV + Math.sign(x) * 0.5) * Drawer.#CURSOR_DIV - this.#offset.x;
		this.Cursor.y = this.#offset.y - parseInt(y / Drawer.#CURSOR_DIV + Math.sign(x) * 0.5) * Drawer.#CURSOR_DIV;
	}
}
