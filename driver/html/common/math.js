/**
 * ベクトル
 */
class vec {
	x = 0;
	y = 0;
	z = 0;

	constructor(x=0, y=0, z=0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	/**
	 * 値をコピーします
	 * @param {vec} dest コピー先
	 */
	copyTo(dest) {
		dest.x = this.x;
		dest.y = this.y;
		dest.z = this.z;
	}

	/**
	 * オブジェクト生成します
	 * @param {vec} src 生成元
	 * @returns {vec}
	 */
	static createFrom(src) {
		return new vec(src.x, src.y, src.z);
	}

	/**
	 * 点Aと点Bの距離を返します
	 * @param {vec} a 点A
	 * @param {vec} b 点B
	 * @returns {number}
	 */
	static distance(a, b) {
		let x = b.x - a.x;
		let y = b.y - a.y;
		let z = b.z - a.z;
		return Math.sqrt(x*x + y*y + z*z);
	}

	/**
	 * ベクトルを規格化した結果を返します
	 * @param {vec} v ベクトル
	 * @param {number} scale スケール
	 * @returns {vec}
	 */
	static normalize(v, scale=1) {
		let k = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
		if (k) {
			k = scale / k;
		}
		return new vec(v.x*k, v.y*k, v.z*k);
	}

	/**
	 * ベクトルa＋ベクトルbの結果(ベクトルの和)を返します
	 * @param {vec} a ベクトルa
	 * @param {vec} b ベクトルb
	 * @returns {vec}
	 */
	static add(a, b) {
		return new vec(
			a.x + b.x,
			a.y + b.y,
			a.z + b.z
		);
	}

	/**
	 * ベクトルaーベクトルbの結果(ベクトルの差)を返します
	 * @param {vec} a ベクトルa
	 * @param {vec} b ベクトルb
	 * @returns {vec}
	 */
	static sub(a, b) {
		return new vec(
			a.x - b.x,
			a.y - b.y,
			a.z - b.z
		);
	}

	/**
	 * ベクトルa✕ベクトルbの結果(クロス積)を返します
	 * @param {vec} a ベクトルa
	 * @param {vec} b ベクトルb
	 * @returns {vec}
	 */
	static cross(a, b) {
		return new vec(
			a.y*b.z - a.z*b.y,
			a.z*b.x - a.x*b.z,
			a.x*b.y - a.y*b.x
		);
	}

	/**
	 * ベクトルをスカラー倍した結果を返します
	 * @param {vec} v ベクトル
	 * @param {number} k スカラー
	 * @returns {vec}
	 */
	static mul(v, k) {
		return new vec(v.x*k, v.y*k, v.z*k);
	}

	/**
	 * ベクトルa・ベクトルbの結果(内積)を返します
	 * @param {vec} a ベクトルa
	 * @param {vec} b ベクトルb
	 * @returns {number}
	 */
	static dot(a, b) {
		return a.x*b.x + a.y*b.y + a.z*b.z;
	}
}

/**
 * 4x4行列
 */
class mat4 {
	#a = new Float32Array(16);

	get Array() { return this.#a; }

	/**
	 * 値を設定します
	 * @param {number[]} array
	 */
	set(array) {
		let a = this.#a;
		a[0] = array[0];
		a[1] = array[1];
		a[2] = array[2];
		a[3] = array[3];

		a[4] = array[4];
		a[5] = array[5];
		a[6] = array[6];
		a[7] = array[7];

		a[8]  = array[8];
		a[9]  = array[9];
		a[10] = array[10];
		a[11] = array[11];

		a[12] = array[12];
		a[13] = array[13];
		a[14] = array[14];
		a[15] = array[15];
	}

	/**
	 * 単位行列として設定します
	 */
	setIdentity() {
		let a = this.#a;
		a[0]  = 1; a[1]  = 0; a[2]  = 0; a[3]  = 0;
		a[4]  = 0; a[5]  = 1; a[6]  = 0; a[7]  = 0;
		a[8]  = 0; a[9]  = 0; a[10] = 1; a[11] = 0;
		a[12] = 0; a[13] = 0; a[14] = 0; a[15] = 1;
	}

	/**
	 * ビュー座標変換行列として設定します
	 * @param {number[]} position
	 * @param {number[]} eye
	 * @param {number[]} up
	 * @param {number} azimuth
	 */
	setView(position, eye, up, azimuth) {
		let e = new vec(eye[0], eye[1], eye[2]);
		let n = vec.normalize(new vec(up[0], up[1], up[2]));
		let z = vec.normalize(vec.createFrom(e));
		let x = vec.normalize(vec.cross(n, z));
		let y = vec.normalize(vec.cross(z, x));

		let view = new mat4();
		view.set([
			x.x, y.x, z.x, 0,
			x.y, y.y, z.y, 0,
			x.z, y.z, z.z, 0,
			position[0] - (x.x*e.x + x.y*e.y + x.z*e.z),
			position[1] - (y.x*e.x + y.y*e.y + y.z*e.z),
			position[2] - (z.x*e.x + z.y*e.y + z.z*e.z),
			1
		]);

		let rx = Math.cos(azimuth);
		let rz = Math.sin(azimuth);
		let rot = new mat4();
		rot.set([
			rx,0,-rz,0,
			 0,1,  0,0,
			rz,0, rx,0,
			 0,0,  0,1
		]);

		this.mul(view, rot);
	}

	/**
	 * 射影座標変換行列として設定します
	 * @param {number} fovy
	 * @param {number} near
	 * @param {number} far
	 * @param {number} aspect
	 */
	setPerspective(fovy, near, far, aspect) {
		let t = near * Math.tan(fovy * Math.PI / 360);
		let w = near / (t * aspect);
		let h = near / t;
		let l = far - near;
		let zt = -(far * near * 2) / l;
		let a = this.#a;
		let zs = -(far + near) / l;
		a[0]  = w; a[1]  = 0; a[2]  = 0;  a[3]  = 0;
		a[4]  = 0; a[5]  = h; a[6]  = 0;  a[7]  = 0;
		a[8]  = 0; a[9]  = 0; a[10] = zs; a[11] = -1;
		a[12] = 0; a[13] = 0; a[14] = zt; a[15] = 0;
	}

	/**
	 * 行列Aの逆行列を設定します
	 * @param {mat4} ma 行列A
	 */
	setInverse(ma) {
		let a = ma.#a;
		let m11 = a[0],  m12 = a[1],  m13 = a[2],  m14 = a[3],
			m21 = a[4],  m22 = a[5],  m23 = a[6],  m24 = a[7],
			m31 = a[8],  m32 = a[9],  m33 = a[10], m34 = a[11],
			m41 = a[12], m42 = a[13], m43 = a[14], m44 = a[15]
		;
		let m1122_1221 = m11 * m22 - m12 * m21,
			m1123_1321 = m11 * m23 - m13 * m21,
			m1124_1421 = m11 * m24 - m14 * m21,
			m1223_1322 = m12 * m23 - m13 * m22,
			m1224_1422 = m12 * m24 - m14 * m22,
			m1324_1423 = m13 * m24 - m14 * m23,
			m3142_3241 = m31 * m42 - m32 * m41,
			m3143_3341 = m31 * m43 - m33 * m41,
			m3144_3441 = m31 * m44 - m34 * m41,
			m3243_3342 = m32 * m43 - m33 * m42,
			m3244_3442 = m32 * m44 - m34 * m42,
			m3344_3443 = m33 * m44 - m34 * m43
		;
		let n = 1 / (
			  m1122_1221 * m3344_3443
			- m1123_1321 * m3244_3442
			+ m1124_1421 * m3243_3342
			+ m1223_1322 * m3144_3441
			- m1224_1422 * m3143_3341
			+ m1324_1423 * m3142_3241
		);
		let r = this.#a;
		r[0]  = ( m22 * m3344_3443 - m23 * m3244_3442 + m24 * m3243_3342) * n;
		r[1]  = (-m12 * m3344_3443 + m13 * m3244_3442 - m14 * m3243_3342) * n;
		r[2]  = ( m42 * m1324_1423 - m43 * m1224_1422 + m44 * m1223_1322) * n;
		r[3]  = (-m32 * m1324_1423 + m33 * m1224_1422 - m34 * m1223_1322) * n;
		r[4]  = (-m21 * m3344_3443 + m23 * m3144_3441 - m24 * m3143_3341) * n;
		r[5]  = ( m11 * m3344_3443 - m13 * m3144_3441 + m14 * m3143_3341) * n;
		r[6]  = (-m41 * m1324_1423 + m43 * m1124_1421 - m44 * m1123_1321) * n;
		r[7]  = ( m31 * m1324_1423 - m33 * m1124_1421 + m34 * m1123_1321) * n;
		r[8]  = ( m21 * m3244_3442 - m22 * m3144_3441 + m24 * m3142_3241) * n;
		r[9]  = (-m11 * m3244_3442 + m12 * m3144_3441 - m14 * m3142_3241) * n;
		r[10] = ( m41 * m1224_1422 - m42 * m1124_1421 + m44 * m1122_1221) * n;
		r[11] = (-m31 * m1224_1422 + m32 * m1124_1421 - m34 * m1122_1221) * n;
		r[12] = (-m21 * m3243_3342 + m22 * m3143_3341 - m23 * m3142_3241) * n;
		r[13] = ( m11 * m3243_3342 - m12 * m3143_3341 + m13 * m3142_3241) * n;
		r[14] = (-m41 * m1223_1322 + m42 * m1123_1321 - m43 * m1122_1221) * n;
		r[15] = ( m31 * m1223_1322 - m32 * m1123_1321 + m33 * m1122_1221) * n;
	}

	/**
	 * 行列Aをベクトルで指定された量で平行移動させた結果を設定します
	 * @param {mat4} ma 行列A
	 * @param {vec} v ベクトル
	 */
	setTranslate(ma, v) {
		let a = ma.#a;
		let r = this.#a;
		r[12] = a[0] * v.x + a[4] * v.y + a[8]  * v.z + a[12];
		r[13] = a[1] * v.x + a[5] * v.y + a[9]  * v.z + a[13];
		r[14] = a[2] * v.x + a[6] * v.y + a[10] * v.z + a[14];
		r[15] = a[3] * v.x + a[7] * v.y + a[11] * v.z + a[15];
		r[0] = a[0]; r[1] = a[1]; r[2]  = a[2];  r[3]  = a[3];
		r[4] = a[4]; r[5] = a[5]; r[6]  = a[6];  r[7]  = a[7];
		r[8] = a[8]; r[9] = a[9]; r[10] = a[10]; r[11] = a[11];
	}

	/**
	 * 行列Aと行列Bの積を設定します
	 * @param {mat4} ma 行列A
	 * @param {mat4} mb 行列B
	 */
	mul(ma, mb) {
		let a = ma.#a;
		let a11 = a[0],  a12 = a[1],  a13 = a[2],  a14 = a[3],
			a21 = a[4],  a22 = a[5],  a23 = a[6],  a24 = a[7],
			a31 = a[8],  a32 = a[9],  a33 = a[10], a34 = a[11],
			a41 = a[12], a42 = a[13], a43 = a[14], a44 = a[15]
		;
		let b = mb.#a;
		let b11 = b[0],  b12 = b[1],  b13 = b[2],  b14 = b[3],
			b21 = b[4],  b22 = b[5],  b23 = b[6],  b24 = b[7],
			b31 = b[8],  b32 = b[9],  b33 = b[10], b34 = b[11],
			b41 = b[12], b42 = b[13], b43 = b[14], b44 = b[15]
		;
		let r = this.#a;
		r[0]  = a11 * b11 + a21 * b12 + a31 * b13 + a41 * b14;
		r[1]  = a12 * b11 + a22 * b12 + a32 * b13 + a42 * b14;
		r[2]  = a13 * b11 + a23 * b12 + a33 * b13 + a43 * b14;
		r[3]  = a14 * b11 + a24 * b12 + a34 * b13 + a44 * b14;
		r[4]  = a11 * b21 + a21 * b22 + a31 * b23 + a41 * b24;
		r[5]  = a12 * b21 + a22 * b22 + a32 * b23 + a42 * b24;
		r[6]  = a13 * b21 + a23 * b22 + a33 * b23 + a43 * b24;
		r[7]  = a14 * b21 + a24 * b22 + a34 * b23 + a44 * b24;
		r[8]  = a11 * b31 + a21 * b32 + a31 * b33 + a41 * b34;
		r[9]  = a12 * b31 + a22 * b32 + a32 * b33 + a42 * b34;
		r[10] = a13 * b31 + a23 * b32 + a33 * b33 + a43 * b34;
		r[11] = a14 * b31 + a24 * b32 + a34 * b33 + a44 * b34;
		r[12] = a11 * b41 + a21 * b42 + a31 * b43 + a41 * b44;
		r[13] = a12 * b41 + a22 * b42 + a32 * b43 + a42 * b44;
		r[14] = a13 * b41 + a23 * b42 + a33 * b43 + a43 * b44;
		r[15] = a14 * b41 + a24 * b42 + a34 * b43 + a44 * b44;
	}

	/**
	 * ベクトルとの積を返します
	 * @param {vec} returnValue 戻り値
	 * @param {vec} v ベクトル
	 */
	mulVec(returnValue, v) {
		let a = this.#a;
		let x = a[0] * v.x;
		let y = a[1] * v.x;
		let z = a[2] * v.x;
		let w = a[3] * v.x;
		x += a[4] * v.y;
		y += a[5] * v.y;
		z += a[6] * v.y;
		w += a[7] * v.y;
		x += a[8] * v.z;
		y += a[9] * v.z;
		z += a[10] * v.z;
		w += a[11] * v.z;
		x += a[12];
		y += a[13];
		z += a[14];
		w += a[15];
		returnValue.x = x / w;
		returnValue.y = y / w;
		returnValue.z = z / w;
	}
}

/**
 * クォータニオン
 */
class qtn {
	#a = new Float32Array(4);

	constructor(x=0, y=0, z=0, w=1) {
		let a = this.#a;
		a[0] = x;
		a[1] = y;
		a[2] = z;
		a[3] = w;
	}

	/**
	 * 規格化します
	 */
	normalize() {
		let x = this.#a[0],
			y = this.#a[1],
			z = this.#a[2],
			w = this.#a[3]
		;
		let k = Math.sqrt(x*x + y*y + z*z + w*w);
		if (k) {
			k = 1 / k;
		}
		this.#a[0] = x*k;
		this.#a[1] = y*k;
		this.#a[2] = z*k;
		this.#a[3] = w*k;
	}

	/**
	 * 共役クォータニオンを返します
	 * @returns {qtn}
	 */
	inverse() {
		let a = this.#a;
		return new qtn(-a[0], -a[1], -a[2], a[3]);
	}

	/**
	 * クォータニオンaとクォータニオンbの積を設定します
	 * @param {qtn} qa クォータニオンa
	 * @param {qtn} qb クォータニオンb
	 */
	setMul(qa, qb) {
		let a = qa.#a;
		let ax = a[0], ay = a[1], az = a[2], aw = a[3];
		let b = qb.#a;
		let bx = b[0], by = b[1], bz = b[2], bw = b[3];
		let r = this.#a;
		r[0] = ax * bw + aw * bx + ay * bz - az * by;
		r[1] = ay * bw + aw * by + az * bx - ax * bz;
		r[2] = az * bw + aw * bz + ax * by - ay * bx;
		r[3] = aw * bw - ax * bx - ay * by - az * bz;
	}

	/**
	 * 回転を表現するクォータニオンとして設定します
	 * @param {vec} axis 回転軸
	 * @param {number} angle 回転量
	 */
	setRot(axis, angle) {
		let x = axis.x,
			y = axis.y,
			z = axis.z
		;
		let k = Math.sqrt(x*x + y*y + z*z);
		if (k) {
			k = 1 / k;
		}
		x *= k;
		y *= k;
		z *= k;
		let c = Math.cos(angle * 0.5);
		let s = Math.sin(angle * 0.5);
		let r = this.#a;
		r[0] = x * s;
		r[1] = y * s;
		r[2] = z * s;
		r[3] = c;
	}

	/**
	 * クォータニオンaとクォータニオンbを大円補間した結果を設定します
	 * @param {qtn} qa クォータニオンa
	 * @param {qtn} qb クォータニオンb
	 * @param {number} time 0～1の値(0:クォータニオンa, 1:クォータニオンb)
	 */
	setSlerp(qa, qb, time) {
		let a = qa.#a;
		let b = qb.#a;
		let ht
			= a[0] * b[0]
			+ a[1] * b[1]
			+ a[2] * b[2]
			+ a[3] * b[3]
		;
		let hs = 1.0 - ht * ht;
		let r = returnValue.#a;
		if (hs <= 0.0) {
			r[0] = a[0];
			r[1] = a[1];
			r[2] = a[2];
			r[3] = a[3];
		} else {
			hs = Math.sqrt(hs);
			if (Math.abs(hs) < 0.0001) {
				r[0] = (a[0] * 0.5 + b[0] * 0.5);
				r[1] = (a[1] * 0.5 + b[1] * 0.5);
				r[2] = (a[2] * 0.5 + b[2] * 0.5);
				r[3] = (a[3] * 0.5 + b[3] * 0.5);
			} else {
				let ph = Math.acos(ht);
				let pt = ph * time;
				let t0 = Math.sin(ph - pt) / hs;
				let t1 = Math.sin(pt) / hs;
				r[0] = a[0] * t0 + b[0] * t1;
				r[1] = a[1] * t0 + b[1] * t1;
				r[2] = a[2] * t0 + b[2] * t1;
				r[3] = a[3] * t0 + b[3] * t1;
			}
		}
	}

	/**
	 * ベクトルを回転させた結果を返します
	 * @param {vec} returnValue 戻り値
	 * @param {vec} v ベクトル
	 */
	rotVec(returnValue, v) {
		let qv = new qtn();
		let qq = new qtn();
		let qr = this.inverse();
		qv.#a[0] = v.x;
		qv.#a[1] = v.y;
		qv.#a[2] = v.z;
		qq.setMul(qr, qv);
		qv.setMul(qq, this);
		returnValue.x = qv.#a[0];
		returnValue.y = qv.#a[1];
		returnValue.z = qv.#a[2];
	}

	/**
	 * 行列に変換して返します
	 * @param {mat4} returnValue 戻り値
	 */
	toMat(returnValue) {
		let x = this.#a[0],
			y = this.#a[1],
			z = this.#a[2],
			w = this.#a[3]
		;
		let x2 = x + x, y2 = y + y, z2 = z + z;
		let xx = x * x2, xy = x * y2, xz = x * z2;
		let yy = y * y2, yz = y * z2, zz = z * z2;
		let wx = w * x2, wy = w * y2, wz = w * z2;
		let a = returnValue.Array;
		a[0]  = 1 - (yy + zz);
		a[1]  = xy - wz;
		a[2]  = xz + wy;
		a[3]  = 0;
		a[4]  = xy + wz;
		a[5]  = 1 - (xx + zz);
		a[6]  = yz - wx;
		a[7]  = 0;
		a[8]  = xz - wy;
		a[9]  = yz + wx;
		a[10] = 1 - (xx + yy);
		a[11] = 0;
		a[12] = 0;
		a[13] = 0;
		a[14] = 0;
		a[15] = 1;
	}
}

class Rotor {
	/** @type {number} スカラー成分 */
	s = 1;
	/** @type {number} e23の係数 */
	b23 = 0;
	/** @type {number} e31の係数 */
	b31 = 0;
	/** @type {number} e12の係数 */
	b12 = 0;

	/**
	 * ローターを角速度から設定
	 * @param {Rotor} r 設定対象
	 * @param {number} omega1 e23の角速度
	 * @param {number} omega2 e31の角速度
	 * @param {number} omega3 e12の角速度
	 * @param {number} scale 角速度のスケール
	 */
	static setFromOmega(r, omega1, omega2, omega3, scale=1) {
		// $$ B = \frac{\omega_1e_{23}+\omega_2e_{31}+\omega_3e_{12}}{||\omega||} $$
		// $$ R = e^{\frac{||\omega||B scale}{2}} $$
		let omega_n = Math.hypot(omega1, omega2, omega3);
		let kb;
		let ks;
		if (omega_n < 1e-4) {
			// $$ \frac{\sin{sw}}{w}\approx s\frac{60-7s^{2}w^{2}}{60+3s^{2}w^{2}} $$
			const s = scale/2;
			const sw2 = s*s*omega_n*omega_n;
			let num = 60 - 7*sw2;
			let den = 60 + 3*sw2;
			kb = s*num/den;
			// $$ \cos{sw}\approx \frac{12-5s^2w^{2}}{12+s^2w^{2}} $$
			num = 12 - 5*sw2;
			den = 12 + sw2;
			ks = num/den;
		} else {
			kb = Math.sin(omega_n*scale/2)/omega_n;
			ks = Math.cos(omega_n*scale/2);
		}
		r.s = ks;
		r.b23 = kb*omega1;
		r.b31 = kb*omega2;
		r.b12 = kb*omega3;
	}

	/**
	 * ローター積の結果を設定
	 * @param {Rotor} r 設定対象
	 * @param {Rotor} a ローターa
	 * @param {Rotor} b ローターb
	 */
	static setMul(r, a, b) {
		const { s: as, b23: a23, b31: a31, b12: a12 } = a;
		const { s: bs, b23: b23, b31: b31, b12: b12 } = b;
		// スカラー成分
		r.s   = as*bs-a23*b23-a31*b31-a12*b12;
		// バイベクトル同士のスカラー倍
		r.b23 = a23*bs + as*b23;
		r.b31 = a31*bs + as*b31;
		r.b12 = a12*bs + as*b12;
		// 交差項
		// (ab-ba)e23
		// (a12e12)(b31e31)=(a12b31)(e12e31=e23)
		// (a31e31)(b12e12)=(a31b12)(e31e12=-e23)
		r.b23 += a12*b31 - a31*b12;
		// (ab-ba)e31
		// (a23e23)(b12e12)=(a23b12)(e23e12=e31)
		// (a12e12)(b23e23)=(a12b23)(e12e23=-e31)
		r.b31 += a23*b12 - a12*b23;
		// (ab-ba)e12
		// (a31e31)(b23e23)=(a31b23)(e31e23=e12)
		// (a23e23)(b31e31)=(a23b31)(e23e31=-e12)
		r.b12 += a31*b23 - a23*b31;
	}

	/**
	 * 線形補間
	 * @param {Rotor} r 設定対象
	 * @param {Rotor} a ローターa
	 * @param {Rotor} b ローターb
	 * @param {number} t 0～1の値(0:ローターa, 1:ローターb)
	 */
	static setLerp(r, a, b, t) {
		let { s: as, b23: a23, b31: a31, b12: a12 } = a;
		let { s: bs, b23: b23, b31: b31, b12: b12 } = b;
		let dot = as*bs + a23*b23 + a31*b31 + a12*b12;
		if (dot < 0) {
			dot = -dot;
			bs *= -1;
			b23 *= -1;
			b31 *= -1;
			b12 *= -1;
		}
		let h = 1.0 - dot*dot;
		if (h <= 0.0) {
			r.s = as;
			r.b23 = a23;
			r.b31 = a31;
			r.b12 = a12;
		} else {
			let hs = Math.sqrt(h);
			if (Math.abs(hs) < 1e-4) {
				r.s = (as + bs)*0.5;
				r.b23 = (a23 + b23)*0.5;
				r.b31 = (a31 + b31)*0.5;
				r.b12 = (a12 + b12)*0.5;
			} else {
				let ph = Math.acos(dot);
				let pt = ph * t;
				let ta = Math.sin(ph - pt) / hs;
				let tb = Math.sin(pt) / hs;
				r.s = as*ta + bs*tb;
				r.b23 = a23*ta + b23*tb;
				r.b31 = a31*ta + b31*tb;
				r.b12 = a12*ta + b12*tb;
			}
		}
	}

	/**
	 * ローターを規格化
	 */
	normalize() {
		let k = Math.hypot(this.s, this.b23, this.b31, this.b12);
		if (k < 1e-9) {
			this.s = 1;
			this.b23 = 0;
			this.b31 = 0;
			this.b12 = 0;
		} else {
			k = 1/k;
			this.s *= k;
			this.b23 *= k;
			this.b31 *= k;
			this.b12 *= k;
		}
	}

	/**
	 * ローターを縦ベクトル左作用の4x4行列として設定
	 * @param {Float32Array} m 設定対象
	 */
	toMat4(m) {
		// R = s + b1e23 + b2e31 + b3e12
		// v = v1e1 + v2e2 + v3e3
		// Rv = (s + b1e23 + b2e31 + b3e12)(v1e1 + v2e2 + v3e3)
		//    = sv1e1 + sv2e2 + sv3e3
		//    + b1v1(e23e1<->e123) + b1v2(e23e2<->-e3)  + b1v3(e23e3<->e2)
		//    + b2v1(e31e1<->e3)   + b2v2(e31e2<->e123) + b2v3(e31e3<->-e1)
		//    + b3v1(e12e1<->-e2)  + b3v2(e12e2<->e1)   + b3v3(e12e3<->e123)
		//    = (sv1  - b2v3 + b3v2)e1
		//    + (sv2  + b1v3 - b3v1)e2
		//    + (sv3  - b1v2 + b2v1)e3
		//    + (b1v1 + b2v2 + b3v3)e123
		// Rv1 = sv1 - b2v3 + b3v2
		// Rv2 = sv2 + b1v3 - b3v1
		// Rv3 = sv3 - b1v2 + b2v1
		// Rv123 = b1v1 + b2v2 + b3v3
		// (Rv)(R^-1)=(Rv1e1 + Rv2e2 + Rv3e3 + Rv123e123)(s - b1e23 - b2e31 - b3e12)
		//    = Rv1se1     - Rv1b1(e1e23<->e123)    - Rv1b2(e1e31<->-e3)     - Rv1b3(e1e12<->e2)
		//    + Rv2se2     - Rv2b1(e2e23<->e3)      - Rv2b2(e2e31<->e123)    - Rv2b3(e2e12<->-e1)
		//    + Rv3se3     - Rv3b1(e3e23<->-e2)     - Rv3b2(e3e31<->e1)      - Rv3b3(e3e12<->e123)
		//    + Rv123se123 - Rv123b1(e123e23<->-e1) - Rv123b2(e123e31<->-e2) - Rv123b3(e123e12<->-e3)
		//    = (Rv1s   + Rv123b1 - Rv3b2   + Rv2b3  )e1
		//    + (Rv2s   + Rv3b1   + Rv123b2 - Rv1b3  )e2
		//    + (Rv3s   - Rv2b1   + Rv1b2   + Rv123b3)e3
		//    + (Rv123s - Rv1b1   - Rv2b2   - Rv3b3  )e123
		// (RvR^-1)123
		//    = (Rv123s - Rv1b1 - Rv2b2 - Rv3b3)e123
		//    = ((b1v1 + b2v2  + b3v3)s - (sv1  - b2v3   + b3v2)b1 - (sv2  + b1v3   - b3v1)b2 - (sv3  - b1v2   + b2v1)b3)e123
		//    = (sb1v1 + sb2v2 + sb3v3  - sb1v1 + b1b2v3 - b1b3v2  - sb2v2 - b1b2v3 + b2b3v1  - sb3v3 + b1b3v2 - b2b3v1))e123
		//    = (sb1v1-sb1v1 + sb2v2-sb2v2 + sb3v3-sb3v3 + b1b2v3-b1b2v3 + b1b3v2-b1b3v2 + b2b3v1-b2b3v1))e123
		//    = 0
		// (RvR^-1)1
		//    = Rv1s + Rv123b1 - Rv3b2 + Rv2b3
		//    = (sv1  - b2v3  + b3v2 )s + (b1v1   + b2v2   + b3v3  )b1 - (sv3   - b1v2   + b2v1  )b2 + (sv2   + b1v3   - b3v1  )b3
		//    =  ssv1 - sb2v3 + sb3v2   +  b1b1v1 + b1b2v2 + b1b3v3    -  sb2v3 + b1b2v2 - b2b2v1    +  sb3v2 + b1b3v3 - b3b3v1
		//    = (ss+b1b1-b2b2-b3b3)v1 + (sb3+b1b2+b1b2+sb3)v2 + (-sb2+b1b3-sb2+b1b3)v3
		//    = (ss+b1b1-b2b2-b3b3)v1 +         2(b1b2+sb3)v2 +          2(b1b3-sb2)v3
		// (RvR^-1)2
		//    = Rv2s + Rv3b1 + Rv123b2 - Rv1b3
		//    = (sv2  + b1v3  - b3v1 )s + (sv3   - b1v2   + b2v1  )b1 + (b1v1   + b2v2   + b3v3  )b2 - (sv1   - b2v3   + b3v2  )b3
		//    =  ssv2 + sb1v3 - sb3v1   +  sb1v3 - b1b1v2 + b1b2v1    +  b1b2v1 + b2b2v2 + b2b3v3    -  sb3v1 + b2b3v3 - b3b3v2
		//    = (-sb3+b1b2+b1b2-sb3)v1 + (ss-b1b1+b2b2-b3b3)v2 + (sb1+sb1+b2b3+b2b3)v3
		//    =          2(b1b2-sb3)v1 + (ss-b1b1+b2b2-b3b3)v2 +         2(b2b3+sb1)v3
		// (RvR^-1)3
		//    = Rv3s - Rv2b1 + Rv1b2 + Rv123b3
		//    = (sv3  - b1v2  + b2v1 )s - (sv2   + b1v3   - b3v1  )b1 + (sv1   - b2v3   + b3v2  )b2 + (b1v1   + b2v2   + b3v3  )b3
		//    =  ssv3 - sb1v2 + sb2v1   -  sb1v2 - b1b1v3 + b1b3v1    +  sb2v1 - b2b2v3 + b2b3v2    +  b1b3v1 + b2b3v2 + b3b3v3
		//    =  ssv3 - sb1v2 + sb2v1   -  sb1v2 - b1b1v3 + b1b3v1    +  sb2v1 - b2b2v3 + b2b3v2    +  b1b3v1 + b2b3v2 + b3b3v3
		//    = (sb2+b1b3+sb2+b1b3)v1 + (-sb1-sb1+b2b3+b2b3)v2 + (ss-b1b1-b2b2+b3b3)v3
		//    =         2(b1b3+sb2)v1 +          2(b2b3-sb1)v2 + (ss-b1b1-b2b2+b3b3)v3
		// RvR^1
		//    = ((ss+b1b1-b2b2-b3b3)v1 +         2(b1b2+sb3)v2 +         2(b1b3-sb2)v3)e1
		//    + (        2(b1b2-sb3)v1 + (ss-b1b1+b2b2-b3b3)v2 +         2(b2b3+sb1)v3)e2
		//	  + (        2(b1b3+sb2)v1 +         2(b2b3-sb1)v2 + (ss-b1b1-b2b2+b3b3)v3)e3
		const { s: s, b23: b23, b31: b31, b12: b12 } = this;
		// 反対称成分
		let sb1 = 2*s*b23;
		let sb2 = 2*s*b31;
		let sb3 = 2*s*b12;
		// 非対角の対称成分
		let b1b2 = 2*b23*b31;
		let b1b3 = 2*b23*b12;
		let b2b3 = 2*b31*b12;
		// 対角成分
		let ss = s*s;
		let b1b1 = b23*b23;
		let b2b2 = b31*b31;
		let b3b3 = b12*b12;
		m[ 0]=(ss+b1b1-b2b2-b3b3), m[ 1]=         (b1b2+sb3), m[ 2]=         (b1b3-sb2), m[ 3]=0,
		m[ 4]=         (b1b2-sb3), m[ 5]=(ss-b1b1+b2b2-b3b3), m[ 6]=         (b2b3+sb1), m[ 7]=0,
		m[ 8]=         (b1b3+sb2), m[ 9]=         (b2b3-sb1), m[10]=(ss-b1b1-b2b2+b3b3), m[11]=0,
		m[12]=                  0,                   m[13]=0,                   m[14]=0, m[15]=1;
	}
}
