class vec3 {
	X = 0.0;
	Y = 0.0;
	Z = 0.0;

	static zero = new vec3();
	static unitX = new vec3(1,0,0);
	static unitY = new vec3(0,1,0);
	static unitZ = new vec3(0,0,1);
	static unitXr = new vec3(-1,0,0);
	static unitYr = new vec3(0,-1,0);
	static unitZr = new vec3(0,0,-1);

	get abs() { return Math.sqrt(this.X * this.X + this.Y * this.Y + this.Z * this.Z); }
	get arg() { return Math.atan2(this.Y, this.X); }
	get azimuth() { return Math.atan2(this.Z, this.X); }
	get altitude() { return Math.atan2(this.Y, Math.sqrt(this.X * this.X + this.Z * this.Z)); }

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 */
	constructor(x=0, y=0, z=0) {
		this.X = x;
		this.Y = y;
		this.Z = z;
	}

	/**
	 * @param {vec3} returnValue
	 */
	copy(returnValue) {
		returnValue.X = this.X;
		returnValue.Y = this.Y;
		returnValue.Z = this.Z;
	}

	/**
	 * @param {vec3} returnValue
	 * @param {number} scale
	 */
	normalize(returnValue, scale = 1) {
		let inv = Math.sqrt(this.X*this.X + this.Y*this.Y + this.Z*this.Z);
		if (0 == inv) {
			returnValue.X = 0;
			returnValue.Y = 0;
			returnValue.Z = 0;
		} else {
			inv = scale / inv;
			returnValue.X = inv * this.X;
			returnValue.Y = inv * this.Y;
			returnValue.Z = inv * this.Z;
		}
	}

	/**
	 * @param {number} scale
	 * @param {vec3} returnValue
	 */
	scale(scale, returnValue) {
		if (undefined == returnValue) {
			return new vec3(
				scale * this.X,
				scale * this.Y,
				scale * this.Z
			);
		} else {
			returnValue.X = scale * this.X;
			returnValue.Y = scale * this.Y;
			returnValue.Z = scale * this.Z;
		}
	}

	/**
	 * @param {vec3} v
	 * @return {number}
	 */
	dot(v) {
		return (this.X*v.X + this.Y*v.Y + this.Z*v.Z);
	}

	/**
	 * @param {vec3} v
	 * @param {vec3} returnValue
	 */
	cross(v, returnValue) {
		returnValue.X = this.Y * v.Z - this.Z * v.Y;
		returnValue.Y = this.Z * v.X - this.X * v.Z;
		returnValue.Z = this.X * v.Y - this.Y * v.X;
	}

	/**
	 * @param {vec3} dv
	 * @param {vec3} returnValue
	 */
	rotXY(dv, returnValue) {
		returnValue.X = this.X * dv.X - this.Y * dv.Y;
		returnValue.Y = this.X * dv.Y + this.Y * dv.X;
	}

	/**
	 * @param {vec3} dv
	 * @param {vec3} returnValue
	 */
	rotAzimuth(dv, returnValue) {
		returnValue.X = this.X * dv.X - this.Z * dv.Z;
		returnValue.Z = this.X * dv.Z + this.Z * dv.X;
	}

	/**
	 * @param {vec3} v
	 * @param {vec3} returnValue
	 */
	add(v, returnValue) {
		returnValue.X = this.X + v.X;
		returnValue.Y = this.Y + v.Y;
		returnValue.Z = this.Z + v.Z;
	}

	/**
	 * @param {vec3} v
	 * @param {vec3} returnValue
	 */
	sub(v, returnValue) {
		returnValue.X = this.X - v.X;
		returnValue.Y = this.Y - v.Y;
		returnValue.Z = this.Z - v.Z;
	}
}

class mat4 {
	#a;

	constructor() {
		this.#a = new Float32Array(16);
	}

	identity() {
		this.#a[0]  = 1; this.#a[1]  = 0; this.#a[2]  = 0; this.#a[3]  = 0;
		this.#a[4]  = 0; this.#a[5]  = 1; this.#a[6]  = 0; this.#a[7]  = 0;
		this.#a[8]  = 0; this.#a[9]  = 0; this.#a[10] = 1; this.#a[11] = 0;
		this.#a[12] = 0; this.#a[13] = 0; this.#a[14] = 0; this.#a[15] = 1;
	}

	/**
	 * @param {number[]} arr 
	 */
	set(arr) {
		this.#a[0] = arr[0];
		this.#a[1] = arr[1];
		this.#a[2] = arr[2];
		this.#a[3] = arr[3];

		this.#a[4] = arr[4];
		this.#a[5] = arr[5];
		this.#a[6] = arr[6];
		this.#a[7] = arr[7];

		this.#a[8]  = arr[8];
		this.#a[9]  = arr[9];
		this.#a[10] = arr[10];
		this.#a[11] = arr[11];

		this.#a[12] = arr[12];
		this.#a[13] = arr[13];
		this.#a[14] = arr[14];
		this.#a[15] = arr[15];
	}

	/**
	 * @param {mat4} mat1
	 * @param {mat4} mat2
	 * @param {mat4} dest
	 */
	static multiply(mat1, mat2, dest) {
		var a1 = mat1.#a;
		var a2 = mat2.#a;
		var ad = dest.#a;
		ad[0] = a2[0] * a1[0] + a2[1] * a1[4] + a2[2] * a1[8] + a2[3] * a1[12];
		ad[1] = a2[0] * a1[1] + a2[1] * a1[5] + a2[2] * a1[9] + a2[3] * a1[13];
		ad[2] = a2[0] * a1[2] + a2[1] * a1[6] + a2[2] * a1[10] + a2[3] * a1[14];
		ad[3] = a2[0] * a1[3] + a2[1] * a1[7] + a2[2] * a1[11] + a2[3] * a1[15];

		ad[4] = a2[4] * a1[0] + a2[5] * a1[4] + a2[6] * a1[8] + a2[7] * a1[12];
		ad[5] = a2[4] * a1[1] + a2[5] * a1[5] + a2[6] * a1[9] + a2[7] * a1[13];
		ad[6] = a2[4] * a1[2] + a2[5] * a1[6] + a2[6] * a1[10] + a2[7] * a1[14];
		ad[7] = a2[4] * a1[3] + a2[5] * a1[7] + a2[6] * a1[11] + a2[7] * a1[15];

		ad[8] = a2[8] * a1[0] + a2[9] * a1[4] + a2[10] * a1[8] + a2[11] * a1[12];
		ad[9] = a2[8] * a1[1] + a2[9] * a1[5] + a2[10] * a1[9] + a2[11] * a1[13];
		ad[10] = a2[8] * a1[2] + a2[9] * a1[6] + a2[10] * a1[10] + a2[11] * a1[14];
		ad[11] = a2[8] * a1[3] + a2[9] * a1[7] + a2[10] * a1[11] + a2[11] * a1[15];

		ad[12] = a2[12] * a1[0] + a2[13] * a1[4] + a2[14] * a1[8] + a2[15] * a1[12];
		ad[13] = a2[12] * a1[1] + a2[13] * a1[5] + a2[14] * a1[9] + a2[15] * a1[13];
		ad[14] = a2[12] * a1[2] + a2[13] * a1[6] + a2[14] * a1[10] + a2[15] * a1[14];
		ad[15] = a2[12] * a1[3] + a2[13] * a1[7] + a2[14] * a1[11] + a2[15] * a1[15];
	}

	/**
	 * @param {mat4} mat
	 * @param {vec3} vec
	 * @param {vec3} dest
	 */
	static toVec(mat, vec, dest) {
		var a = mat.#a;
		var x = a[0] * vec.X;
		var y = a[1] * vec.X;
		var z = a[2] * vec.X;
		x += a[4] * vec.Y;
		y += a[5] * vec.Y;
		z += a[6] * vec.Y;
		x += a[8] * vec.Z;
		y += a[9] * vec.Z;
		z += a[10] * vec.Z;
		x += a[12];
		y += a[13];
		z += a[14];
		dest.X = x;
		dest.Y = y;
		dest.Z = z;
	}

	/**
	 * ビュー座標変換行列を生成します
	 * @param {vec3} eye
	 * @param {vec3} center
	 * @param {vec3} up
	 * @param {mat4} dest
	 */
	static lookAt(eye, center, up, dest) {
		if (eye.X == center.X && eye.Y == center.Y && eye.Z == center.Z) {
			dest.identity();
			return;
		}

		var z0 = eye.X - center.X;
		var z1 = eye.Y - center.Y;
		var z2 = eye.Z - center.Z;
		var l = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
		z0 *= l; z1 *= l; z2 *= l;

		var x0 = up.Y * z2 - up.Z * z1;
		var x1 = up.Z * z0 - up.X * z2;
		var x2 = up.X * z1 - up.Y * z0;
		l = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
		if (!l) {
			x0 = 0; x1 = 0; x2 = 0;
		} else {
			l = 1 / l;
			x0 *= l; x1 *= l; x2 *= l;
		}

		var y0 = z1 * x2 - z2 * x1;
		var y1 = z2 * x0 - z0 * x2;
		var y2 = z0 * x1 - z1 * x0;
		l = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
		if (!l) {
			y0 = 0; y1 = 0; y2 = 0;
		} else {
			l = 1 / l;
			y0 *= l; y1 *= l; y2 *= l;
		}

		var arr = dest.#a;
		arr[0] = x0;
		arr[1] = y0;
		arr[2] = z0;
		arr[3] = 0;

		arr[4] = x1;
		arr[5] = y1;
		arr[6] = z1;
		arr[7] = 0;

		arr[8]  = x2;
		arr[9]  = y2;
		arr[10] = z2;
		arr[11] = 0;

		arr[12] = -(x0 * eye.X + x1 * eye.Y + x2 * eye.Z);
		arr[13] = -(y0 * eye.X + y1 * eye.Y + y2 * eye.Z);
		arr[14] = -(z0 * eye.X + z1 * eye.Y + z2 * eye.Z);
		arr[15] = 1;
	}

	/**
	 * 射影座標変換行列を生成します
	 * @param {number} fovy
	 * @param {number} aspect
	 * @param {number} near
	 * @param {number} far
	 * @param {mat4} dest
	 */
	static perspective(fovy, aspect, near, far, dest) {
		var t = near * Math.tan(fovy * Math.PI / 360);
		var r = t * aspect;
		var a = r * 2, b = t * 2, c = far - near;
		var arr = dest.#a;
		arr[0] = near * 2 / a;
		arr[1] = 0;
		arr[2] = 0;
		arr[3] = 0;

		arr[4] = 0;
		arr[5] = near * 2 / b;
		arr[6] = 0;
		arr[7] = 0;

		arr[8] = 0;
		arr[9] = 0;
		arr[10] = -(far + near) / c;
		arr[11] = -1;

		arr[12] = 0;
		arr[13] = 0;
		arr[14] = -(far * near * 2) / c;
		arr[15] = 0;
	}
}

/**
 * @param {vec3} v
 * @param {number} focalLength 
 * @returns {vec3}
 */
function to2d(v, focalLength=40) {
	var py = v.Y * 0.2 + 50;
	var pz = v.Z - 100;
	var w = focalLength / (focalLength + py);
	return new vec3(v.X * w, pz * w + py * w, 0);
}

/**
 * @param {number} y
 * @param {number} z
 * @returns {number}
 */
function toAlpha(y, z) {
	let uy = 0.7 - 0.3 * y / UNIT;
	let uz = 0.8 + 0.2 * z / UNIT;
	let a = uy * uz;
	if (a < 0.05) {
		a = 0.05;
	}
	return a;
}

/**
 * @param {vec3} a 
 * @param {vec3} b 
 * @returns {number}
 */
function distance(a, b) {
	let sx = b.X - a.X;
	let sy = b.Y - a.Y;
	let sz = b.Z - a.Z;
	return Math.sqrt(sx*sx + sy*sy + sz*sz);
}

/**
 * @param {vec3} p
 * @param {vec3} a
 * @param {vec3} b
 * @param {vec3} returnValue
 * @param {number} beginLimit
 * @param {number} endLimit
 * @return {number}
 */
function nearPointOnLine(p, a, b, returnValue, beginLimit=true, endLimit=true) {
	var abx = b.X - a.X;
	var aby = b.Y - a.Y;
	var abz = b.Z - a.Z;
	var apx = p.X - a.X;
	var apy = p.Y - a.Y;
	var apz = p.Z - a.Z;
	var r = (apx*abx + apy*aby + apz*abz) / (abx*abx + aby*aby + abz*abz);
	if (beginLimit && r <= 0) {
		returnValue.X = a.X;
		returnValue.Y = a.Y;
		returnValue.Z = a.Z;
		return  r;
	}
	if (endLimit && 1 <= r) {
		returnValue.X = b.X;
		returnValue.Y = b.Y;
		returnValue.Z = b.Z;
		return r;
	}
	returnValue.X = abx*r + a.X;
	returnValue.Y = aby*r + a.Y;
	returnValue.Z = abz*r + a.Z;
	return r;
}

/**
 * @param {vec3} o
 * @param {vec3} a
 * @param {vec3} b
 * @param {number} scale
 * @param {vec3} returnValue
 */
function midPos(a, b, scale, returnValue) {
	returnValue.X = a.X + (b.X - a.X) * scale;
	returnValue.Y = a.Y + (b.Y - a.Y) * scale;
	returnValue.Z = a.Z + (b.Z - a.Z) * scale;
}

/**
 * @param {vec3} o
 * @param {vec3} a
 * @param {vec3} b
 * @param {vec3} returnValue
 */
function divLine(o, a, b, returnValue) {
	var oax = a.X - o.X;
	var oay = a.Y - o.Y;
	var oaz = a.Z - o.Z;
	var obx = b.X - o.X;
	var oby = b.Y - o.Y;
	var obz = b.Z - o.Z;
	var oar = Math.sqrt(oax*oax + oay*oay + oaz*oaz);
	var obr = Math.sqrt(obx*obx + oby*oby + obz*obz);
	returnValue.X = (oax / oar + obx / obr) + o.X;
	returnValue.Y = (oay / oar + oby / obr) + o.Y;
	returnValue.Z = (oaz / oar + obz / obr) + o.Z;
}

/**
 * @param {vec3} o
 * @param {vec3} a
 * @param {vec3} b
 * @param {vec3} returnValue
 */
function crossedDivLine(o, a, b, returnValue) {
	var oax = a.X - o.X;
	var oay = a.Y - o.Y;
	var oaz = a.Z - o.Z;
	var obx = b.X - o.X;
	var oby = b.Y - o.Y;
	var obz = b.Z - o.Z;
	var oar = Math.sqrt(oax*oax + oay*oay + oaz*oaz);
	var obr = Math.sqrt(obx*obx + oby*oby + obz*obz);
	returnValue.X = (obr * oax + oar * obx) / (oar + obr) + o.X;
	returnValue.Y = (obr * oay + oar * oby) / (oar + obr) + o.Y;
	returnValue.Z = (obr * oaz + oar * obz) / (oar + obr) + o.Z;
}

/**
 * @param {number} value 
 * @param {string} unit 
 * @returns {string} 
 */
function toFrac(value, unit="", dispOne=true) {
	if (0 == value) {
		if (dispOne && unit != "") {
			return "0" + unit;
		} else {
			return "0";
		}
	}
	if (0 == value - parseInt(value)) {
		if (dispOne) {
			return value + unit;
		} else {
			return (1 == value ? "" : -1 == value ? "-" : value) + unit;
		}
	}
	let sign = Math.sign(value);
	for (let m=1; m<256;m++) {
		for(let c=0; c<1000; c++) {
			let diff = c / m - value * sign;
			if (0 == diff) {
				if ("" != unit) {
					if (c == 1) {
						return ((sign == 1 ? "" : "-") + unit + "/") + m;
					} else {
						return (c * sign) + unit + "/" + m;
					}
				} else {
					return (c * sign) + "/" + m + unit;
				}
			}
		}
	}
	return parseInt(value * 1000) / 1000 + unit;
}

/**
 * @param {vec3} returnVal
 * @param {vec3} v
 * @param {number} digit
 * @param {number} scale
 * @param {vec3} offset
 */
function roundVec(returnVal, v, digit, scale, offset) {
	var f = Math.pow(10, digit);
	var x = v.X - offset.X;
	var y = v.Y - offset.Y;
	var z = v.Z - offset.Z;
	returnVal.X = parseInt(x / scale * f + Math.sign(x) * 0.5) / f * scale + offset.X;
	returnVal.Y = parseInt(y / scale * f + Math.sign(y) * 0.5) / f * scale + offset.Y;
	returnVal.Z = parseInt(z / scale * f + Math.sign(z) * 0.5) / f * scale + offset.Z;
}

/**
 * @param {number} value
 * @param {number} scale
 * @param {number} digit
 * @returns
 */
function round1d(value, scale=1, digit=2) {
	var f = Math.pow(10, digit);
	return parseInt(value * scale * f + Math.sign(value) * 0.5) / f;
}

/**
 * @param {vec3} value
 * @param {number} scale
 * @param {number} digit
 * @returns
 */
function round2d(value, scale=1, digit=2) {
	var f = Math.pow(10, digit);
	return (parseInt(value.X * scale * f + Math.sign(value.X) * 0.5) / f) + ", "
		+ (parseInt(value.Y * scale * f + Math.sign(value.Y) * 0.5) / f);
}

/**
 * @param {vec3} value
 * @param {number} scale
 * @param {number} digit
 * @returns
 */
function round3d(value, scale=1, digit=2) {
	var f = Math.pow(10, digit);
	return (parseInt(value.X * scale * f + Math.sign(value.X) * 0.5) / f) + ", "
		+ (parseInt(value.Y * scale * f + Math.sign(value.Y) * 0.5) / f) + ", "
		+ (parseInt(value.Z * scale * f + Math.sign(value.Z) * 0.5) / f)
	;
}
