/**
 * ロータークラス
 * $e_ie_j+e_je_i=2\mathrm{diag}(-1,-1,-1)$
 * $R=r_0+r_1e_2e_3+r_2e_3e_1+r_3e_1e_2
 */
class Rotor {
	#_0 = 1;
	#_23 = 0;
	#_31 = 0;
	#_12 = 0;

	static #r_temp = new Rotor();
	static #b_temp = [0, 0, 0];

	/**
	 * @param {Rotor} r
	 * @param {number} _0
	 * @param {number} _23
	 * @param {number} _31
	 * @param {number} _12
	 */
	static set(r, _0, _23, _31, _12) {
		let norm = Math.hypot(_0, _23, _31, _12);
		if (norm < 1e-9) {
			r.#_0 = 1;
			r.#_23 = 0;
			r.#_31 = 0;
			r.#_12 = 0;
		} else {
			let inv_norm = 1/norm;
			r.#_0 = _0*inv_norm;
			r.#_23 = _23*inv_norm;
			r.#_31 = _31*inv_norm;
			r.#_12 = _12*inv_norm;
		}
	}

	/**
	 * @param {Rotor} r $R=e^{B\theta}$
	 * @param {number[]} b $B$
	 * @param {number} theta $\theta$ 角速度からローターを作る際は$\theta = \frac{\Delta t}{2}$
	 */
	static exp(r, b, theta=1) {
		/*
		$$\begin{aligned}
			&\text{指数写像} \\
			&B = B_{2,3}e_2e_3 + B_{3,1}e_3e_1 + B_{1,2}e_1e_2 \\
			&B^2 = -\left(B_{2,3}^2 + B_{3,1}^2 + B_{1,2}^2\right) \\
			&\quad\left(e_1,e_2,e_3\text{から3面を作れ、交差項において必ず基底1つを共有するため反交換関係により交差項が消える}\right) \\
			&\omega^2 = B_{2,3}^2 + B_{3,1}^2 + B_{1,2}^2 \\
			&\therefore B^2 = -\omega^2 \Longrightarrow \mathrm{\widehat{B}} = \frac{B}{\omega}\quad\left(\mathrm{\widehat{B}}^2 = -1\right) \\
			&\therefore R = e^{\textstyle{\mathrm{\widehat{B}}x}} = \cos{x} + \mathrm{\widehat{B}}\sin{x}\quad\left(x = \omega\theta\right) 
		\end{aligned}$$
		$$\begin{aligned}
			&x = \omega\theta,\mathrm{\widehat{B}} = \frac{B}{\omega}\text{なので} \\
			&\textstyle\mathrm{\widehat{B}}\sin{x} \Longrightarrow B\theta\cfrac{\sin{x}}{x}\quad\left(x\text{が括り出せ}\omega\text{による正規化が不要になる}\right)
		\end{aligned}$$
		$$\begin{aligned}
			&\text{ケイリー変換と}\tan{\frac{x}{2}}\text{の[5,4]パデ近似} \\
			&e^{ix}=\frac{1+it}{1-it}\quad\left(t=\tan{\frac{x}{2}}\approx\frac{x}{30}\frac{x^4 - 420x^2 + 15120}{x^4 - 112x^2 + 1008}\right) \\
			&\sin{x}\text{の項については分子の}x\text{の次数を1つ落として}\frac{\sin{x}}{x}\text{へ変形する} \\
		\end{aligned}$$
		*/
		const omega2 = b[0]*b[0] + b[1]*b[1] + b[2]*b[2];
		const x2 = omega2*theta*theta;
		let d = (((( x2 +   60)*x2 +   5040)*x2 +   403200)*x2 +  25401600)*x2 + 914457600;
		let c = ((((-x2 + 1740)*x2 - 408240)*x2 + 25804800)*x2 - 431827200)*x2 + 914457600;
		let s = (((( x2 -  532)*x2 +  63168)*x2 -  2116800)*x2 +  15240960)*(60*theta);
		d = 1/d;
		c *= d;
		s *= d;
		r.#_0 = c;
		r.#_23 = s*b[0];
		r.#_31 = s*b[1];
		r.#_12 = s*b[2];
	}

	/**
	 * @param {number[]} b $B=\widehat{<R>_2}\mathrm{atan2}{(\|<R>_2\|, <R>_0)}$
	 * @param {Rotor} r $R\$
	 */
	static ln(b, r) {
		/*
		$$\begin{aligned}
			&\text{対数写像} \\
			&R = r_0 + r_1e_2e_3 + r_2e_3e_1 + r_3e_1e_2 \\
			&B = R - r_0 \\
			&\mathrm{\widehat{B}} = \frac{B}{\|B\|}\quad\left(\mathrm{\widehat{B}}^2 = -1\right) \\
			&\therefore \ln{R} = \mathrm{\widehat{B}}\mathrm{atan2}{(\|B\|,r_0)} \\
			&\left(\frac{B}{\|B\|}\mathrm{atan2}{(\|B\|,r_0)}\text{における}\|B\|\rightarrow0\text{を判断し}B\frac{\sin^{-1}{\|B\|}}{\|B\|}\text{の近似へ変形する}\right) \\
		\end{aligned}$$
		*/
		const PI_2 = 1.5707963267948966;
		const PI_4 = 0.7853981633974483;
		const TAN_PI_8 = 0.41421356237309503;
		const reverse = r.#_0 < 0 ? -1 : 1;
		const r_23 = reverse*r.#_23;
		const r_31 = reverse*r.#_31;
		const r_12 = reverse*r.#_12;
		const b_norm2 = r_23*r_23 + r_31*r_31 + r_12*r_12;
		const x = reverse*r.#_0;
		const y = Math.sqrt(b_norm2);

		/* $\mathrm{atan2}{(y,x)}\text{の近似}$ */
		let atan2;
		{
			let s_range1, s_range2;
			let t_range1, t_range2;
			let t, u, den, num;

			/* $\pi/4\text{のレンジリダクション}$ */
			s_range1 = (x*x >= y*y) ? 1 : 0;
			s_range2 = 1 - s_range1;

			/* $t={y/x, x/y}$ */
			t = x + s_range2;
			u = y + s_range1;
			den = t*u;
			num = y*u*s_range1 + x*t*s_range2;
			t = num/den;

			/* $\pi/8\text{のレンジリダクション}$ */
			t_range1 = (t < TAN_PI_8) ? 1 : 0;
			t_range2 = 1 - t_range1;

			/* $u = {t, (t-1)/(t+1)}$ */
			den = t + 1;
			num = (t - 1)*t_range2;
			u = num/den;
			u += t*t_range1;

			/* $\tan^{-1}{u}\text{の[5,4]パデ近似}$ */
			t = u*u;
			den = (225*t + 1050)*t + 945;
			num = ((64*t + 735)*t + 945)*u;
			atan2 = num/den;

			/* レンジリダクションの復元 */
			atan2 += PI_4*t_range2;
			atan2 *= s_range1 - s_range2;
			atan2 += PI_2*s_range2;
		}

		const y_range1 = (y >= 1e-6) ? 1 : 0;
		const y_range2 = 1 - y_range1;
		let k = y_range1*atan2/(y + y_range2);

		/* $\sin^{-1}(y)/y\text{の近似}$ */
		k += ((1/6)*b_norm2 + 1)*y_range2;

		b[0] = k*r_23;
		b[1] = k*r_31;
		b[2] = k*r_12;
	}

	/**
	 * @param {Rotor} r1 $R_{n+1} = \Delta R R_n$
	 * @param {Rotor} dr $\Delta R$
	 * @param {Rotor} r0 $R_n$
	 */
	static mul(r1, dr, r0) {
		/* $R_{n+1} = \Delta R R_n$ */
		const _0  = dr.#_0*r0.#_0  - dr.#_23*r0.#_23 - dr.#_31*r0.#_31 - dr.#_12*r0.#_12;
		const _23 = dr.#_0*r0.#_23 + dr.#_23*r0.#_0  + dr.#_31*r0.#_12 - dr.#_12*r0.#_31;
		const _31 = dr.#_0*r0.#_31 - dr.#_23*r0.#_12 + dr.#_31*r0.#_0  + dr.#_12*r0.#_23;
		const _12 = dr.#_0*r0.#_12 + dr.#_23*r0.#_31 - dr.#_31*r0.#_23 + dr.#_12*r0.#_0;
		/* $1/\|R_{n+1}\|\text{の近似}$ */
		const norm2 = _0*_0 + _23*_23 + _31*_31 + _12*_12;
		let inv_norm = 1.5 - 0.5*norm2;
		inv_norm *= 1.5 - 0.5*norm2*inv_norm*inv_norm;
		/* 正規化 */
		r1.#_0  = _0*inv_norm;
		r1.#_23 = _23*inv_norm;
		r1.#_31 = _31*inv_norm;
		r1.#_12 = _12*inv_norm;
	}

	/**
	 * @param {Rotor} dr $\Delta R = R_b\widetilde{R_a}$
	 * @param {Rotor} rb $R_b$
	 * @param {Rotor} ra $R_a$
	 */
	static delta(dr, rb, ra) {
		/* $\Delta R = R_b\widetilde{R_a}$ */
		const _0  =  rb.#_0*ra.#_0  + rb.#_23*ra.#_23 + rb.#_31*ra.#_31 + rb.#_12*ra.#_12;
		const _23 = -rb.#_0*ra.#_23 + rb.#_23*ra.#_0  - rb.#_31*ra.#_12 + rb.#_12*ra.#_31;
		const _31 = -rb.#_0*ra.#_31 + rb.#_23*ra.#_12 + rb.#_31*ra.#_0  - rb.#_12*ra.#_23;
		const _12 = -rb.#_0*ra.#_12 - rb.#_23*ra.#_31 + rb.#_31*ra.#_23 + rb.#_12*ra.#_0;
		/* $1/\|\Delta R\|\text{の近似}$ */
		const norm2 = _0*_0 + _23*_23 + _31*_31 + _12*_12;
		let inv_norm = 1.5 - 0.5*norm2;
		inv_norm *= 1.5 - 0.5*norm2*inv_norm*inv_norm;
		/* 正規化 */
		dr.#_0  = _0*inv_norm;
		dr.#_23 = _23*inv_norm;
		dr.#_31 = _31*inv_norm;
		dr.#_12 = _12*inv_norm;
	}

	/**
	 * @param {Rotor} r $R=e^{t\ln{\Delta R}}R_a\quad\left(\Delta R = R_b\widetilde{R_a}\right)$
	 * @param {Rotor} rb $R_b$
	 * @param {Rotor} ra $R_a$
	 * @param {number} t
	 */
	static slerp(r, rb, ra, t) {
		Rotor.delta(Rotor.#r_temp, rb, ra);
		Rotor.ln(Rotor.#b_temp, Rotor.#r_temp);
		Rotor.exp(Rotor.#r_temp, Rotor.#b_temp, t);
		Rotor.mul(r, Rotor.#r_temp, ra);
	}

	/**
	 * @param {Float32Array} m44 4x4行列(列優先)
	 * @param {Rotor} r ローター $R$
	 */
	static toM44(m44, r) {
		const r_0 = r.#_0;
		const r_23 = r.#_23;
		const r_31 = r.#_31;
		const r_12 = r.#_12;
		const d_23 = r_23*2;
		const d_31 = r_31*2;
		const d_12 = r_12*2;
		// 対角成分
		const r2_23 = r_23*d_23;
		const r2_31 = r_31*d_31;
		const r2_12 = r_12*d_12;
		// 反対称成分
		const r_0_23 = r_0*d_23;
		const r_0_31 = r_0*d_31;
		const r_0_12 = r_0*d_12;
		// 対称成分
		const r_23_31 = r_23*d_31;
		const r_31_12 = r_31*d_12;
		const r_12_23 = r_12*d_23;
		// 4x4行列(列優先)に変換
		// $e_ie_j+e_je_i=2\mathrm{diag}(-1,-1,-1)$
		// $R(e_1)\widetilde{R}$
		m44[0]  = 1 - r2_31 - r2_12;
		m44[1]  = -r_23_31 - r_0_12;
		m44[2]  = -r_12_23 + r_0_31;
		m44[3]  = 0;
		// $R(e_2)\widetilde{R}$
		m44[4]  = -r_23_31 + r_0_12;
		m44[5]  = 1 - r2_23 - r2_12;
		m44[6]  = -r_31_12 - r_0_23;
		m44[7]  = 0;
		// $R(e_3)\widetilde{R}$
		m44[8]  = -r_12_23 - r_0_31;
		m44[9]  = -r_31_12 + r_0_23;
		m44[10] = 1 - r2_23 - r2_31;
		m44[11] = 0;
		// 並進部
		m44[12] = 0;
		m44[13] = 0;
		m44[14] = 0;
		m44[15] = 1;
	}
}
