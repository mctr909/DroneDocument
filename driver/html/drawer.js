/// <reference path="math.js" />

class Color {
	static BLACK = new Color(0, 0, 0);
	static GRAY33 = new Color(85, 85, 85);
	static GRAY = new Color(127, 127, 127);
	static GRAY66 = new Color(170, 170, 170);
	static GRAY75 = new Color(191, 191, 191);
	static WHITE = new Color(255, 255, 255);
	static RED = new Color(211, 0, 0);
	static GREEN = new Color(0, 167, 0);
	static BLUE = new Color(0, 0, 255);
	static CYAN = new Color(0, 191, 191);
	static YELLOW = new Color(211, 211, 0);
	static MAGENTA = new Color(191, 0, 167);
	static #transparent = new Color();
	R = 0;
	G = 0;
	B = 0;
	A = 1;
	/**
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @param {number} a
	 */
	constructor(r, g, b, a=1) {
		this.R = r;
		this.G = g;
		this.B = b;
		this.A = a;
	}
	/**
	 * @param {Color} color
	 * @param {number} alpha
	 * @returns {Color}
	 */
	static Transparent(color, alpha) {
		this.#transparent.R = color.R;
		this.#transparent.G = color.G;
		this.#transparent.B = color.B;
		this.#transparent.A = alpha;
		return this.#transparent;
	}
}

class LineInfo {
	/** @type{vec3} */
	posA;
	/** @type{vec3} */
	posB;
	width = 1;
	isDot = false;
	isArrow = false;
	color = Color.BLACK;
	/**
	 * @param {number} ax
	 * @param {number} ay
	 * @param {number} bx
	 * @param {number} by
	 * @param {number} width
	 * @param {Color} color
	 * @param {boolean} isDot
	 * @param {boolean} isArrow
	 */
	constructor(ax, ay, bx, by, width=1, color=Color.BLACK, isDot=false, isArrow=false) {
		this.posA = new vec3(ax, ay);
		this.posB = new vec3(bx, by);
		this.width = width;
		this.color = color;
		this.isDot = isDot;
		this.isArrow = isArrow;
	}
	/**
	 * @param {Drawer} drawer
	 */
	draw(drawer) {
		if (this.isArrow) {
			if (this.isDot) {
				drawer.drawArrowD(this.posA, this.posB, this.color, this.width);
			} else {
				drawer.drawArrow(this.posA, this.posB, this.color, this.width);
			}
		} else {
			if (this.isDot) {
				drawer.drawLineD(this.posA, this.posB, this.color, this.width);
			} else {
				drawer.drawLine(this.posA, this.posB, this.color, this.width);
			}
		}
	}
}

class TextInfo {
	pos = new vec3();
	value = "";
	size = 9;
	center = true;
	color = Color.BLACK;
}

class Drawer {
	static #FONT_NAME = "Cambria Math";
	static FRAME_RATE = 60;

	/** @type {number} */
	static CursorDiv = 2;

	/** @type {CanvasRenderingContext2D} */
	#ctx;
	/** @type {HTMLCanvasElement} */
	#element;
	#offset = new vec3();
	/** @type {TextInfo[]} */
	#textList = [];

	cursor = new vec3();
	isDrag = false;

	/** @param {vec3} offset */
	set Offset(offset) { this.#offset = offset; }
	get Offset() { return this.#offset; }
	get Width() { return this.#element.width; }
	get Height() { return this.#element.height; }

	/**
	 * @param {string} canvasId
	 * @param {number} width
	 * @param {number} height
	 */
	constructor(canvasId, width, height) {
		this.#element = document.getElementById(canvasId);
		this.#element.width = width;
		this.#element.height = height;

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
			if (0 == ev.button) {
				self.isDrag = true;
			}
		});
		this.#element.addEventListener("touchstart", function(ev) {
			ev.preventDefault();
			self.isDrag = true;
		});
		this.#element.addEventListener("mouseup", function(ev) {
			if (0 == ev.button) {
				self.isDrag = false;
			}
		});
		this.#element.addEventListener("touchend", function(ev) {
			ev.preventDefault();
			self.isDrag = false;
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

	/**
	 * @param {number} ax
	 * @param {number} ay
	 * @param {number} bx
	 * @param {number} by
	 * @param {Color} color
	 * @param {number} width
	 */
	drawLineXY(ax, ay, bx, by, color = Color.BLACK, width = 1) {
		let x1 = this.#offset.X + ax;
		let y1 = this.#offset.Y - ay;
		let x2 = this.#offset.X + bx;
		let y2 = this.#offset.Y - by;
		this.#ctx.beginPath();
		this.#ctx.strokeStyle = "rgba("
			+ color.R + ","
			+ color.G + ","
			+ color.B + ","
			+ color.A + ")";
		this.#ctx.lineWidth = width;
		this.#ctx.moveTo(x1, y1);
		this.#ctx.lineTo(x2, y2);
		this.#ctx.setLineDash([]);
		this.#ctx.stroke();
	}

	/**
	 * @param {number} ax
	 * @param {number} ay
	 * @param {number} bx
	 * @param {number} by
	 * @param {Color} color
	 * @param {number} width
	 */
	drawLineXYD(ax, ay, bx, by, color = Color.BLACK, width = 1) {
		let x1 = this.#offset.X + ax;
		let y1 = this.#offset.Y - ay;
		let x2 = this.#offset.X + bx;
		let y2 = this.#offset.Y - by;
		this.#ctx.beginPath();
		this.#ctx.strokeStyle = "rgba("
			+ color.R + ","
			+ color.G + ","
			+ color.B + ","
			+ color.A + ")";
		this.#ctx.lineWidth = width;
		this.#ctx.moveTo(x1, y1);
		this.#ctx.lineTo(x2, y2);
		this.#ctx.setLineDash([3, 2]);
		this.#ctx.stroke();
	}

	/**
	 * @param {vec3} a
	 * @param {vec3} b
	 * @param {Color} color
	 * @param {number} width
	 */
	drawLine(a, b, color = Color.BLACK, width = 1) {
		this.drawLineXY(a.X, a.Y, b.X, b.Y, color, width);
	}

	/**
	 * @param {vec3} a
	 * @param {vec3} b
	 * @param {Color} color
	 * @param {number} width
	 */
	drawLineD(a, b, color = Color.BLACK, width = 1) {
		this.drawLineXYD(a.X, a.Y, b.X, b.Y, color, width);
	}

	/**
	 * @param {vec3} ax
	 * @param {vec3} ay
	 * @param {vec3} bx
	 * @param {vec3} by
	 * @param {Color} color
	 * @param {number} width
	 * @param {number} length
	 */
	drawArrowXY(ax, ay, bx, by, color = Color.BLACK, width = 1, length = 13) {
		var sx = bx - ax;
		var sy = by - ay;
		var th = Math.atan2(sy, sx);
		var r = Math.sqrt(sx*sx + sy*sy) - width * 1.25;
		var px = ax + r * Math.cos(th);
		var py = ay + r * Math.sin(th);
		this.drawLineXY(ax, ay, px, py, color, width);
		this.#fillArrow(ax, ay, bx, by, color, width, length);
	}

	/**
	 * @param {vec3} a
	 * @param {vec3} b
	 * @param {Color} color
	 * @param {number} width
	 * @param {number} length
	 */
	drawArrow(a, b, color = Color.BLACK, width = 1, length = 13) {
		this.drawArrowXY(a.X, a.Y, b.X, b.Y, color, width, length);
	}

	/**
	 * @param {vec3} ax
	 * @param {vec3} ay
	 * @param {vec3} bx
	 * @param {vec3} by
	 * @param {Color} color
	 * @param {number} width
	 */
	drawArrowXYD(ax, ay, bx, by, color = Color.BLACK, width = 1) {
		var sx = bx - ax;
		var sy = by - ay;
		var th = Math.atan2(sy, sx);
		var r = Math.sqrt(sx*sx + sy*sy) - width * 1.25;
		var px = ax + r * Math.cos(th);
		var py = ay + r * Math.sin(th);
		this.drawLineXYD(ax, ay, px, py, color, width);
		this.#fillArrow(ax, ay, bx, by, color, width);
	}

	/**
	 * @param {vec3} a
	 * @param {vec3} b
	 * @param {Color} color
	 * @param {number} width
	 */
	drawArrowD(a, b, color = Color.BLACK, width = 1) {
		this.drawArrowXYD(a.X, a.Y, b.X, b.Y, color, width);
	}

	/**
	 * @param {Array<vec3>} points
	 * @param {Color} color
	 * @param {number} width
	 * @param {number} alpha
	 */
	drawPolyline(points, color = Color.BLACK, width = 1, alpha=1) {
		this.#ctx.beginPath();
		this.#ctx.moveTo(this.#offset.X + points[0].X, this.#offset.Y - points[0].Y);
		for (let i=1; i<points.length; i++) {
			this.#ctx.lineTo(this.#offset.X + points[i].X, this.#offset.Y - points[i].Y);
		}
		this.#ctx.lineWidth = width;
		this.#ctx.strokeStyle = "rgba("
			+ color.R + ","
			+ color.G + ","
			+ color.B + ","
			+ alpha + ")";
		this.#ctx.setLineDash([]);
		this.#ctx.stroke();
	}

	/**
	 * @param {Array<vec3>} points
	 * @param {Color} color
	 * @param {number} width
	 * @param {number} alpha
	 */
	drawPolylineD(points, color = Color.BLACK, width = 1, alpha=1) {
		this.#ctx.beginPath();
		this.#ctx.moveTo(this.#offset.X + points[0].X, this.#offset.Y - points[0].Y);
		for (let i=1; i<points.length; i++) {
			this.#ctx.lineTo(this.#offset.X + points[i].X, this.#offset.Y - points[i].Y);
		}
		this.#ctx.lineWidth = width;
		this.#ctx.strokeStyle = "rgba("
			+ color.R + ","
			+ color.G + ","
			+ color.B + ","
			+ alpha + ")";
		this.#ctx.setLineDash([3, 3]);
		this.#ctx.stroke();
	}

	/**
	 * @param {vec3} center
	 * @param {number} radius
	 * @param {Color} color
	 * @param {number} width
	 */
	drawCircle(center, radius, color = Color.BLACK, width = 1) {
		this.#ctx.beginPath();
		this.#ctx.arc(
			this.#offset.X + center.X,
			this.#offset.Y - center.Y,
			radius,
			0 * Math.PI / 180,
			360 * Math.PI / 180,
			false
		);
		this.#ctx.strokeStyle = "rgba("
			+ color.R + ","
			+ color.G + ","
			+ color.B + ","
			+ color.A + ")";
		this.#ctx.lineWidth = width;
		this.#ctx.setLineDash([]);
		this.#ctx.stroke();
	}

	/**
	 * @param {vec3} center
	 * @param {number} radius
	 * @param {Color} color
	 * @param {number} width
	 */
	drawCircleD(center, radius, color = Color.BLACK, width = 1) {
		this.#ctx.beginPath();
		this.#ctx.arc(
			this.#offset.X + center.X,
			this.#offset.Y - center.Y,
			radius,
			0 * Math.PI / 180,
			360 * Math.PI / 180,
			false
		);
		this.#ctx.strokeStyle = "rgba("
			+ color.R + ","
			+ color.G + ","
			+ color.B + ","
			+ color.A + ")";
		this.#ctx.lineWidth = width;
		this.#ctx.setLineDash([3, 3]);
		this.#ctx.stroke();
	}

	/**
	 * @param {vec3} center
	 * @param {number} radius
	 * @param {number} begin
	 * @param {number} elapse
	 * @param {Color} color
	 * @param {number} width
	 */
	drawArc(center, radius, begin = 0, elapse = 2 * Math.PI, color = Color.BLACK, width = 1) {
		this.#ctx.beginPath();
		this.#ctx.arc(
			this.#offset.X + center.X,
			this.#offset.Y - center.Y,
			radius,
			-begin,
			-elapse,
			true
		);
		this.#ctx.strokeStyle = "rgba("
			+ color.R + ","
			+ color.G + ","
			+ color.B + ","
			+ color.A + ")";
		this.#ctx.lineWidth = width;
		this.#ctx.setLineDash([]);
		this.#ctx.stroke();
	}

	/**
	 * @param {vec3} center
	 * @param {number} radius
	 * @param {number} begin
	 * @param {number} elapse
	 * @param {Color} color
	 * @param {number} width
	 * @param {number} length
	 */
	drawArcArrow(center, radius, begin = 0, elapse = 2 * Math.PI, color = Color.BLACK, width = 1, length = 13) {
		let ctxBegin;
		let ctxEnd;
		if (elapse < 0) {
			ctxBegin = -elapse + Math.PI * 4;
			ctxEnd = -begin + Math.PI * 4;
		} else {
			ctxBegin = -begin + Math.PI * 4;
			ctxEnd = -elapse + Math.PI * 4;
		}
		let nb = parseInt(0.5 * ctxBegin / Math.PI);
		let ne = parseInt(0.5 * ctxEnd / Math.PI);
		ctxBegin = ctxBegin - 2*Math.PI*nb;
		ctxEnd = ctxEnd - 2*Math.PI*ne;
		this.#ctx.beginPath();
		this.#ctx.arc(
			this.#offset.X + center.X,
			this.#offset.Y - center.Y,
			radius,
			ctxBegin,
			ctxEnd,
			true
		);
		this.#ctx.strokeStyle = "rgba("
			+ color.R + ","
			+ color.G + ","
			+ color.B + ","
			+ color.A + ")";
		this.#ctx.lineWidth = width;
		this.#ctx.setLineDash([]);
		this.#ctx.stroke();
		let arrow = new vec3(
			Math.cos(elapse) * radius,
			Math.sin(elapse) * radius
		);
		let dtheta = elapse * 0.95;
		let arrowD = new vec3(
			Math.cos(dtheta) * radius,
			Math.sin(dtheta) * radius
		);
		this.drawArrow(arrowD, arrow, color, width, length);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} radius
	 * @param {Color} color
	 */
	fillCircleXY(x, y, radius, color = Color.BLACK) {
		this.#ctx.beginPath();
		this.#ctx.arc(
			this.#offset.X + x,
			this.#offset.Y - y,
			radius,
			0 * Math.PI / 180,
			360 * Math.PI / 180,
			false
		);
		this.#ctx.fillStyle = "rgba("
			+ color.R + ","
			+ color.G + ","
			+ color.B + ","
			+ color.A + ")";
		this.#ctx.fill();
	}

	/**
	 * @param {vec3} center
	 * @param {number} radius
	 * @param {Color} color
	 */
	fillCircle(center, radius, color = Color.BLACK) {
		this.fillCircleXY(center.X, center.Y, radius, color);
	}

	/**
	 * @param {Array<vec3>} points
	 * @param {vec3} ofs
	 * @param {Color} color
	 * @param {number} alpha
	 */
	fillPolygon(points, ofs = new vec3(), color = Color.BLACK, alpha=0.66) {
		this.#ctx.beginPath();
		this.#ctx.moveTo(ofs.X + points[0].X, ofs.Y - points[0].Y);
		for (let i=1; i<points.length; i++) {
			this.#ctx.lineTo(ofs.X + points[i].X, ofs.Y - points[i].Y);
		}
		this.#ctx.fillStyle = "rgba("
			+ color.R + ","
			+ color.G + ","
			+ color.B + ","
			+ alpha + ")";
		this.#ctx.fill();
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} value
	 * @param {number} size
	 * @param {boolean} center
	 * @param {Color} color
	 */
	pushString(x, y, value, size = 14, center = true, color = Color.BLACK) {
		let text = new TextInfo();
		text.pos = new vec3(x, y);
		text.value = value;
		text.size = size;
		text.center = center;
		text.color = color;
		this.#textList.push(text);
	}

	clearStringList() {
		this.#textList = [];
	}

	drawStringList() {
		for (let i=0; i<this.#textList.length; i++) {
			let text = this.#textList[i];
			if (text.center) {
				this.drawStringC(text.pos, text.value, text.size, text.color);
			} else {
				this.drawString(text.pos, text.value, text.size, text.color);
			}
		}
	}

	/**
	 * @param {vec3} x
	 * @param {vec3} y
	 * @param {string} value
	 * @param {number} size
	 * @param {Color} color
	 */
	drawStringXY(x, y, value, size = 11, color = Color.BLACK) {
		this.#ctx.font = size + "px " + Drawer.#FONT_NAME;
		this.#ctx.fillStyle = "rgba("
			+ color.R + ","
			+ color.G + ","
			+ color.B + ","
			+ color.A + ")";
		let px = this.#offset.X + x;
		let py = this.#offset.Y - y;
		let lines = value.split("\n");
		for(let i=0; i<lines.length; i++) {
			this.#ctx.fillText(lines[i], px, py);
			py += size;
		}
	}

	/**
	 * @param {vec3} x
	 * @param {vec3} y
	 * @param {number} rot
	 * @param {string} value
	 * @param {number} size
	 * @param {Color} color
	 */
	drawStringRot(x, y, rot, value, size = 11, color = Color.BLACK) {
		this.#ctx.font = size + "px " + Drawer.#FONT_NAME;
		this.#ctx.fillStyle = "rgba("
			+ color.R + ","
			+ color.G + ","
			+ color.B + ","
			+ color.A + ")";
		this.#ctx.translate(x, y);
		this.#ctx.rotate(rot);
		let sz = this.#ctx.measureText(value);
		this.#ctx.fillText(value, -sz.width*0.5, 0);
		this.#ctx.rotate(-rot);
		this.#ctx.translate(-x, -y);
	}

	/**
	 * @param {vec3} p
	 * @param {string} value
	 * @param {number} size
	 * @param {Color} color
	 */
	drawString(p, value, size = 11, color = Color.BLACK) {
		this.drawStringXY(p.X, p.Y, value, size, color);
	}

	/**
	 * @param {vec3} p
	 * @param {string} value
	 * @param {number} size
	 * @param {Color} color
	 */
	drawStringC(p, value, size = 11, color = Color.BLACK) {
		this.#ctx.font = size + "px " + Drawer.#FONT_NAME;
		this.#ctx.fillStyle = "rgba("
			+ color.R + ","
			+ color.G + ","
			+ color.B + ","
			+ color.A + ")";
		let lines = value.split("\n");
		let px = this.#offset.X + p.X;
		let py = this.#offset.Y - p.Y + size / 2;
		for(let i=0; i<lines.length; i++) {
			let met = this.#ctx.measureText(lines[i]);
			this.#ctx.fillText(lines[i], px - met.width / 2, py);
			py += size;
		}
	}

	/**
	 * @param {vec3} a
	 * @param {vec3} b
	 * @param {string} value
	 * @param {number} size
	 * @param {Color} color
	 * @param {vec3} offset
	 */
	drawStringH(a, b, value, size = 11, color = Color.BLACK, offset = new vec3(0,0,0.5)) {
		let sx = b.X - a.X;
		let sy = a.Y - b.Y;
		let rot = Math.atan2(sy, sx);
		rot += offset.Z < 0 ? Math.PI : 0;
		let ox = offset.X*Math.cos(rot) + offset.Y*Math.sin(rot);
		let oy = offset.X*Math.sin(rot) - offset.Y*Math.cos(rot);
		let r = Math.abs(offset.Z);
		let px = this.#offset.X + ox + a.X + sx * r;
		let py = this.#offset.Y + oy - a.Y + sy * r;
		this.drawStringRot(px, py, rot, value, size, color);
	}

	/**
	 * @param {vec3} a
	 * @param {vec3} b
	 * @param {string} value
	 * @param {number} size
	 * @param {Color} color
	 * @param {vec3} offset
	 */
	drawStringV(a, b, value, size = 11, color = Color.BLACK, offset = new vec3(0,0,0.5)) {
		let sx = b.X - a.X;
		let sy = b.Y - a.Y;
		let rot = Math.atan2(sx, sy);
		offset.Y -= size * 0.25;
		let ox = offset.X*Math.cos(rot) + offset.Y*Math.sin(rot);
		let oy = offset.X*Math.sin(rot) - offset.Y*Math.cos(rot);
		let px = this.#offset.X + ox + a.X + sx * offset.Z;
		let py = this.#offset.Y + oy - a.Y - sy * offset.Z;
		this.drawStringRot(px, py, rot, value, size, color);
	}

	/**
	 * @param {vec3} a
	 * @param {vec3} o
	 * @param {vec3} b
	 * @param {string} value
	 * @param {number} size
	 * @param {Color} color
	 * @param {vec3} offset
	 */
	drawStringA(a, o, b, value, size = 11, color = Color.BLACK, offset = new vec3(0,0,1)) {
		let oaX = o.X - a.X;
		let oaY = o.Y - a.Y;
		let obX = o.X - b.X;
		let obY = o.Y - b.Y;
		let oaR = Math.sqrt(oaX*oaX + oaY*oaY);
		let obR = Math.sqrt(obX*obX + obY*obY);
		let abX = (oaX / oaR + obX / obR) / 2;
		let abY = (oaY / oaR + obY / obR) / 2;
		let angle = Math.atan2(abY, abX) + Math.PI;
		if (angle < 0) {
			angle += Math.PI;
		}
		var r = Math.abs(offset.Z);
		let p = new vec3(Math.cos(angle) * r, Math.sin(angle) * r);
		offset.Z = Math.sign(offset.Z);
		this.drawStringH(o, p, value, size, color, offset);
	}

	/**
	 * @param {number} unit 
	 */
	drawGrid(unit) {
		for(let i = -20; i <= 20; i += 5) {
			let r = i * 0.1;
			if (0 == i % 10) {
				this.drawLineXY(unit*r, unit*-2, unit*r, unit*2, Color.GRAY);
				this.drawLineXY(unit*-2, unit*r, unit*2, unit*r, Color.GRAY);
			} else {
				this.drawLineXYD(unit*r, unit*-2, unit*r, unit*2, Color.GRAY);
				this.drawLineXYD(unit*-2, unit*r, unit*2, unit*r, Color.GRAY);
			}
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

	clear() {
		var w = this.#element.width;
		var h = this.#element.height;
		this.#ctx.clearRect(0, 0, w, h);
	}

	/**
	 * @param {number} value (between -1 and 1)
	 * @returns {[number, number, number]}
	 */
	static ToHue(value) {
		if (1 < value) value = 1;
		if (value < -1) value = -1;
		value = 2 * value / (value*value+1);
		value = parseInt(1023*(value/2+0.5));

		let r, g, b;
		if(value < 256) {
			r = 0;
			g = value;
			b = 255;
		} else if(value < 512) {
			value -= 256;
			r = 0;
			g = 255;
			b = 255-value;
		} else if(value < 768) {
			value -= 512;
			r = value;
			g = 255;
			b = 0;
		} else {
			value -= 768;
			r = 255;
			g = 255 - value;
			b = 0;
		}
		return [r, g, b];
	}

	/**
	 * @param {number} ax
	 * @param {number} ay
	 * @param {number} bx
	 * @param {number} by
	 * @param {Color} color
	 * @param {number} width
	 */
	#fillArrow(ax, ay, bx, by, color, width = 1, length = 13) {
		let w = Math.sqrt(width) * 0.22;
		let polygon = [
			new vec3(0, 0),
			new vec3(-length/13, w),
			new vec3(-length/13, -w),
			new vec3(0, 0)
		];
		let th = Math.atan2(by - ay, bx - ax);
		for (let i=0; i<polygon.length; i++) {
			let x = polygon[i].X;
			let y = polygon[i].Y;
			polygon[i].X = length * (x*Math.cos(th) - y*Math.sin(th)) + bx;
			polygon[i].Y = length * (x*Math.sin(th) + y*Math.cos(th)) + by;
		}
		this.fillPolygon(polygon, this.#offset, color, color.A);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 */
	#roundCursor(x, y) {
		this.cursor.X = parseInt(x / Drawer.CursorDiv + Math.sign(x) * 0.5) * Drawer.CursorDiv - this.#offset.X;
		this.cursor.Y = this.#offset.Y - parseInt(y / Drawer.CursorDiv + Math.sign(x) * 0.5) * Drawer.CursorDiv;
	}
}
