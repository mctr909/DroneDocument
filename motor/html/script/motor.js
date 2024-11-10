class PWM {
	#dt = 0.0;
	#c = 0.0;
	#d = 0.0;
	#deadtime_fk = 0.0;
	#center_freq = 0.0;
	#diffusion_delta = 0.0;
	#diffusion_width = 0.0;

	#f_up = 0.0;
	#f_un = 0.0;
	#f_vp = 0.0;
	#f_vn = 0.0;
	#f_wp = 0.0;
	#f_wn = 0.0;
	#f_su = 0.0;
	#f_sv = 0.0;
	#f_sw = 0.0;

	up = 0;
	un = 0;
	vp = 0;
	vn = 0;
	wp = 0;
	wn = 0;

	su = false;
	sv = false;
	sw = false;

	/**
	 * @param {Number} center_freq 中心キャリア周波数[Hz]
	 * @param {Number} diffusion_freq キャリア拡散周波数[Hz]
	 * @param {Number} deadtime デッドタイム[s]
	 * @param {Number} fs サンプリング周波数
	 */
	constructor(center_freq = 1500.0, diffusion_freq = 200.0, deadtime = 2e-5, fs = 1e5) {
		this.#dt = 1.0 / fs;
		this.#deadtime_fk = 1.0 - Math.exp(-this.#dt / deadtime);
		this.#center_freq = center_freq;
		this.#diffusion_delta = diffusion_freq * this.#dt;
		this.#diffusion_width = 0.2 * this.#center_freq;
	}

	/**
	 * @param {Number} i 正規化電流[-1.0, 1.0]
	 * @param {Number} theta 位相[rad]
	 */
	step(i, theta) {
		this.#d += this.#diffusion_delta;
		this.#d -= Math.trunc(this.#d);
		let diff = this.#diffusion_width * Math.sin(2.0*Math.PI*this.#d);
		let freq = this.#center_freq + diff;

		this.#c += freq * this.#dt;
		this.#c -= Math.trunc(this.#c);
		let c2 = 2.0 * this.#c - 1.0;

		const AMP = 1.1547;
		i *= AMP;
		let z = Math.cos(3.0*theta)/6.0;
		let iu = i*(Math.cos(theta) - z);
		let iv = i*(Math.cos(theta + 2.0*Math.PI/3.0) - z);
		let iw = i*(Math.cos(theta - 2.0*Math.PI/3.0) - z);
		let u = iu > c2;
		let v = iv > c2;
		let w = iw > c2;

		let up =  v && !w ? 1 : 0;
		let un = !v &&  w ? 1 : 0;
		let vp =  w && !u ? 1 : 0;
		let vn = !w &&  u ? 1 : 0;
		let wp =  u && !v ? 1 : 0;
		let wn = !u &&  v ? 1 : 0;
		this.#f_up += this.#deadtime_fk * (up - this.#f_up);
		this.#f_un += this.#deadtime_fk * (un - this.#f_un);
		this.#f_vp += this.#deadtime_fk * (vp - this.#f_vp);
		this.#f_vn += this.#deadtime_fk * (vn - this.#f_vn);
		this.#f_wp += this.#deadtime_fk * (wp - this.#f_wp);
		this.#f_wn += this.#deadtime_fk * (wn - this.#f_wn);
		this.#f_up *= up;
		this.#f_un *= un;
		this.#f_vp *= vp;
		this.#f_vn *= vn;
		this.#f_wp *= wp;
		this.#f_wn *= wn;

		const threshold = 0.632;
		this.up = this.#f_up > threshold ? 1 : 0;
		this.un = this.#f_un > threshold ? 1 : 0;
		this.vp = this.#f_vp > threshold ? 1 : 0;
		this.vn = this.#f_vn > threshold ? 1 : 0;
		this.wp = this.#f_wp > threshold ? 1 : 0;
		this.wn = this.#f_wn > threshold ? 1 : 0;

		let su = this.up === 0 && this.un === 0;
		let sv = this.vp === 0 && this.vn === 0;
		let sw = this.wp === 0 && this.wn === 0;
		this.#f_su += this.#deadtime_fk * (su - this.#f_su);
		this.#f_sv += this.#deadtime_fk * (sv - this.#f_sv);
		this.#f_sw += this.#deadtime_fk * (sw - this.#f_sw);
		this.su = this.#f_su > threshold;
		this.sv = this.#f_sv > threshold;
		this.sw = this.#f_sw > threshold;
		this.#f_su *= this.su ? 0 : 1;
		this.#f_sv *= this.sv ? 0 : 1;
		this.#f_sw *= this.sw ? 0 : 1;
	}
}

class Model {
	static #TAU = 2.0 * Math.PI;
	static #PHASE120 = Model.#TAU / 3.0;

	/** DC電源電圧[V] */
	static #Vdc = 12.0;
	/** 巻線抵抗[Ω] */
	static #R = 1.0;
	/** 巻線インダクタンス[H] */
	static #L0 = 1e-3;
	/** 巻線インダクタンス 突極性2次変動分[H] */
	static #L2 = 100e-6;
	/** 逆起電力定数[V/(rad/s)] */
	static #Ke = 0.05;
	/** 慣性モーメント[kg*m^2] */
	static #J = 0.05;
	/** 摩擦係数[N*m*s/rad] */
	D = 0.01;

	/** シャント抵抗[Ω] */
	static #Rs = 0.01;
	/** 電流センサゲイン */
	static #SensGain = 1.0 / Model.#Rs;

	/** サンプリング周期[s] */
	#dt = 0.0;

	/** 回転子角速度[rad/s] */
	#omega_rm = 0.0;
	/** 回転子位相[rad] */
	#theta_rm = 0.0;

	/**
	 * PWM値
	 * @type {PWM}
	 */
	#pwm = null;

	/** U相電流 */
	#i_u = 0.0;
	/** V相電流 */
	#i_v = 0.0;
	/** W相電流 */
	#i_w = 0.0;

	/** 電流センサ値(U相) */
	#sens_u = 0.0;
	/** 電流センサ値(V相) */
	#sens_v = 0.0;

	/** 電流センサ値(U相) */
	get SensU() {
		return this.#sens_u;
	}
	/** 電流センサ値(V相) */
	get SensV() {
		return this.#sens_v;
	}

	/**
	 * @param {Number} fs
	 * @param {PWM} pwm
	 */
	constructor(fs = 10000, pwm = new PWM()) {
		this.#dt = 1.0 / fs;
		this.#pwm = pwm;
	}

	updateRotor() {
		/*** マグネットトルク(T_m) ***/
		let s_x = this.#i_u;
		let s_y = (this.#i_w - this.#i_v) / 1.732;
		let r_x = Math.cos(this.#theta_rm);
		let r_y = Math.sin(this.#theta_rm);
		let T_m = Model.#Ke * (s_y * r_x - s_x * r_y);

		/*** リラクタンストルク(T_r) ***/
		let T_r;
		{
			const M2 = -0.5 * Model.#L2;
			let s_u = -2.0*Math.sin(2.0*this.#theta_rm);
			let s_v = -2.0*Math.sin(2.0*this.#theta_rm + Model.#PHASE120);
			let s_w = -2.0*Math.sin(2.0*this.#theta_rm - Model.#PHASE120);
			let dthLu = Model.#L2*s_u;
			let dthLv = Model.#L2*s_v;
			let dthLw = Model.#L2*s_w;
			let dthKuv = M2*s_u;
			let dthKvw = M2*s_v;
			let dthKwu = M2*s_w;
			const dthL = [
				[dthLu,  dthKuv, dthKwu],
				[dthKuv, dthLv,  dthKvw],
				[dthKwu, dthKvw, dthLw ]
			];
			const i = [this.#i_u, this.#i_v, this.#i_w];
			const dthLi = matMul(dthL, i);
			T_r = 0.5*(i[0]*dthLi[0] + i[1]*dthLi[1] + i[2]*dthLi[2]);
		}

		/*** acc(加速度) ***/
		// (マグネットトルク + リラクタンストルク - 摩擦トルク) / 慣性モーメント
		let acc = (T_m + T_r - this.D * this.#omega_rm) / Model.#J;

		/*** 位相・速度更新 ***/
		this.#omega_rm += acc * this.#dt;
		this.#theta_rm += this.#omega_rm * this.#dt;
		this.#theta_rm = wrap(this.#theta_rm);
	}

	updateCircuit() {
		// 相電圧
		const V = 0.5*Model.#Vdc;
		let v_u = V*(this.#pwm.up - this.#pwm.un);
		let v_v = V*(this.#pwm.vp - this.#pwm.vn);
		let v_w = V*(this.#pwm.wp - this.#pwm.wn);

		// 逆起電力
		let KeOmega_r = Model.#Ke*this.#omega_rm;
		v_u -= KeOmega_r*Math.sin(this.#theta_rm);
		v_v -= KeOmega_r*Math.sin(this.#theta_rm + Model.#PHASE120);
		v_w -= KeOmega_r*Math.sin(this.#theta_rm - Model.#PHASE120);

		// 電流の計算
		{
			/*** インダクタンス(L) ***/
			const M0 = -0.5*Model.#L0;
			const M2 = -0.5*Model.#L2;
			let c_u = Math.cos(2.0*this.#theta_rm);
			let c_v = Math.cos(2.0*this.#theta_rm + Model.#PHASE120);
			let c_w = Math.cos(2.0*this.#theta_rm - Model.#PHASE120);
			let Lu = Model.#L0 + Model.#L2*c_u;
			let Lv = Model.#L0 + Model.#L2*c_v;
			let Lw = Model.#L0 + Model.#L2*c_w;
			let Kuv = M0 + M2*c_u;
			let Kvw = M0 + M2*c_v;
			let Kwu = M0 + M2*c_w;
			const L = [
				[Lu,  Kuv, Kwu],
				[Kuv, Lv,  Kvw],
				[Kwu, Kvw, Lw ]
			];

			/*** インダクタンスの変化(dL) ***/
			let s_u = -2.0*this.#omega_rm*Math.sin(2.0*this.#theta_rm);
			let s_v = -2.0*this.#omega_rm*Math.sin(2.0*this.#theta_rm + Model.#PHASE120);
			let s_w = -2.0*this.#omega_rm*Math.sin(2.0*this.#theta_rm - Model.#PHASE120);
			let dLu = Model.#L2*s_u;
			let dLv = Model.#L2*s_v;
			let dLw = Model.#L2*s_w;
			let dKuv = M2*s_u;
			let dKvw = M2*s_v;
			let dKwu = M2*s_w;
			const dL = [
				[dLu,  dKuv, dKwu],
				[dKuv, dLv,  dKvw],
				[dKwu, dKvw, dLw ]
			];

			/*** A = L/dt + dL + R ***/
			const A = [[
				L[0][0]/this.#dt + dL[0][0] + Model.#R,
				L[0][1]/this.#dt + dL[0][1],
				L[0][2]/this.#dt + dL[0][2]
			], [
				L[1][0]/this.#dt + dL[1][0],
				L[1][1]/this.#dt + dL[1][1] + Model.#R,
				L[1][2]/this.#dt + dL[1][2]
			], [
				L[2][0]/this.#dt + dL[2][0],
				L[2][1]/this.#dt + dL[2][1],
				L[2][2]/this.#dt + dL[2][2] + Model.#R
			]];

			/*** b = v + L/dt * i_n ***/
			const i = [this.#i_u, this.#i_v, this.#i_w];
			const Li = matMul(L, i);
			const b = [
				v_u + Li[0]/this.#dt,
				v_v + Li[1]/this.#dt,
				v_w + Li[2]/this.#dt
			];

			/*** A i_{n+1} = b ***/
			const i_1 = solve(A, b);
			this.#i_u = i_1[0];
			this.#i_v = i_1[1];
			this.#i_w = i_1[2];

			/*** 中性点拘束 ***/
			let i_n = (this.#i_u + this.#i_v + this.#i_w) / 3.0;
			this.#i_u -= i_n;
			this.#i_v -= i_n;
			this.#i_w -= i_n;
		}

		let sens_u = this.#i_u * Model.#Rs * Model.#SensGain;
		let sens_v = this.#i_v * Model.#Rs * Model.#SensGain;
		this.#sens_u = this.#pwm.su ? sens_u : this.#sens_u;
		this.#sens_v = this.#pwm.sv ? sens_v : this.#sens_v;
	}
}

class Controller {
	static #TAU = 2.0 * Math.PI;

	/** 指令値比例ゲイン */
	static #Kp_c = 1.5;
	/** 指令値積分ゲイン */
	static #Ki_c = 0.9;
	/** 電流センサ有効 遷移区間下限[rad/s] */
	static #SensTransitionMin = 4.0 * Controller.#TAU;
	/** 電流センサ有効 遷移区間上限[rad/s] */
	static #SensTransitionMax = 10.0 * Controller.#TAU;
	/** 電流センサ有効 遷移区間幅[rad/s] */
	static #SensTransitionWidth = Controller.#SensTransitionMax - Controller.#SensTransitionMin;

	/** サンプリング周期[s] */
	#dt = 0.0;

	/** 固定子磁界角速度[rad/s] */
	#omega_s = 0.0;
	/** 固定子磁界位相[rad] */
	#theta_s = 0.0;

	/** 回転子電流ベクトル(LPF係数) */
	#ri_fk = 0.0;
	/** 回転子電流ベクトル(X軸LPF値) */
	#ri_x = 0.0;
	/** 回転子電流ベクトル(Y軸LPF値) */
	#ri_y = 0.0;

	/** 電流ゲイン(実測値により調整) */
	#i_gain = 0.0;
	/** 電流制限 */
	#i_lim = 0.0;
	/** 電流指令値 */
	#ci = 0.0;
	/** 電流指令積分値 */
	#ci_i = 0.0;

	/**
	 * PWM値
	 * @type {PWM}
	 */
	Pwm = null;

	/** 目標角速度[rad/s] */
	OmegaTarget = 0.0;

	/** 電流指令値 */
	get I() {
		return this.#ci;
	}
	/** 固定子磁界角速度[rad/s] */
	get Omega() {
		return this.#omega_s;
	}
	/** 固定子磁界位相[rad] */
	get Theta() {
		return this.#theta_s;
	}

	/**
	 * @param {Number} i_gain 電流ゲイン(実測値により調整)
	 * @param {Number} i_lim 電流制限
	 * @param {Number} ri_fc 回転子電流ベクトル LPFカットオフ周波数
	 * @param {Number} fs サンプリング周波数
	 */
	constructor(i_gain = 20, i_lim = 100, ri_fc = 1000, fs = 10000) {
		this.#i_gain = i_gain;
		this.#i_lim = i_lim;
		this.#ri_fk = 1.0 - Math.exp(-Controller.#TAU * ri_fc / fs);
		this.#dt = 1.0 / fs;
		this.Pwm = new PWM(1200, 200, 4.0 * this.#dt, fs);
		this.initStator(0, 0);
		this.initRotor(0, 0);
	}

	initStator(omega = 0.0, theta = 0.0) {
		this.#theta_s = theta + 0.25 * Controller.#TAU;
		this.#omega_s = omega;
		this.#ci = 0;
		this.#ci_i = 0;
	}

	initRotor(i = 1.0, theta = 0.0) {
		this.#ri_x = i * Math.cos(theta);
		this.#ri_y = i * Math.sin(theta);
	}

	/**
	 * @param {Number} ri_u 回転子検出電流(U相)
	 * @param {Number} ri_v 回転子検出電流(V相)
	 */
	step(ri_u, ri_v) {
		/*** 位相・速度更新 ***/
		// (rs_x, rs_y)(回転子電流ベクトルLPF)
		let ri_y = (ri_u - ri_v) / 1.732;
		this.#ri_x += this.#ri_fk * (ri_u - this.#ri_x);
		this.#ri_y += this.#ri_fk * (ri_y - this.#ri_y);

		// θ_r(回転子位相)
		let theta_r = Math.atan2(this.#ri_y, this.#ri_x);
		// ψ(位相差) = θ_s(固定子位相) - θ_r(回転子位相)
		let psi = this.#theta_s - theta_r;
		// φ_t(目標負荷角) 暫定
		let phi_t = 0.25 * Controller.#TAU;
		// φ_e(誤差負荷角) = φ_t(目標負荷角) - ψ(位相差)
		let phi_e = wrap(phi_t - psi);
		// ω_se(固定子角速度誤差)
		let omega_se = this.OmegaTarget - this.#omega_s;

		// acc(固定子加速度)
		let acc;
		let abs_omega_s = Math.abs(this.#omega_s);
		if (abs_omega_s < Controller.#SensTransitionMin) {
			acc = omega_se;
		} else if (abs_omega_s < Controller.#SensTransitionMax) {
			let k = (abs_omega_s - Controller.#SensTransitionMin) / Controller.#SensTransitionWidth;
			acc = (1.0 - k) * omega_se;
			acc += k * phi_e;
		} else {
			acc = phi_e;
		}
		// ω_s(固定子磁界角速度), θ_s(固定子磁界位相) 更新
		this.#omega_s += acc * this.#dt;
		this.#theta_s += this.#omega_s * this.#dt;
		this.#theta_s = wrap(this.#theta_s);

		/*** 電流指令値更新(速度制御) ***/
		let ci_e = this.OmegaTarget - this.#omega_s;
		let ci_d = ci_e * this.#dt;
		this.#ci = Controller.#Kp_c * ci_e + Controller.#Ki_c * (this.#ci_i + ci_d);
		this.#ci *= this.#i_gain;
		// 電流制限
		if (this.#ci > this.#i_lim) {
			this.#ci = this.#i_lim;
		}
		else if (this.#ci < -this.#i_lim) {
			this.#ci = -this.#i_lim;
		}
		else {
			this.#ci_i += ci_d;
		}

		/*** PWM ***/
		let i_norm = this.#ci / this.#i_lim;
		this.Pwm.step(i_norm, this.#theta_s);
	}
}

function wrap(theta) {
	return Math.atan2(Math.sin(theta), Math.cos(theta));
}

function matMul(A, x) {
	let n = x.length;
	let ret = new Array(n);
	for (let i = 0; i < n; i++) {
		let sum = 0;
		for (let j = 0; j < n; j++) {
			sum += A[i][j] * x[j];
		}
		ret[i] = sum;
	}
	return ret;
}

/**
 * 
 * @param {Number[][]} A 
 * @param {Number[]} x 
 * @returns 
 */
function solve(A, x) {
	const EPS = 1e-9;
	let n = x.length;
	let ret = new Array(n);
	let Ax = A.map((row, i) => [...row, x[i]]);

	for (let i = 0; i < n; i++) {
		let maxRow = i;
		for (let k = i + 1; k < n; k++) {
			let ax_ki = Ax[k][i];
			let ax_mi = Ax[maxRow][i];
			ax_ki *= ax_ki;
			ax_mi *= ax_mi;
			if (ax_ki > ax_mi) {
				maxRow = k;
			}
		}
		[Ax[i], Ax[maxRow]] = [Ax[maxRow], Ax[i]];
		for (let k = i + 1; k < n; k++) {
			let den = Ax[i][i];
			if (Math.abs(den) < EPS) {
				den = den < 0 ? -EPS : EPS;
			}
			let c = -Ax[k][i] / den;
			for (let j = i; j < n + 1; j++) {
				if (i === j) {
					Ax[k][j] = 0;
				} else {
					Ax[k][j] += c * Ax[i][j];
				}
			}
		}
	}

	for (let i = n - 1; i >= 0; i--) {
		let den = Ax[i][i];
		if (Math.abs(den) < EPS) {
			den = den < 0 ? -EPS : EPS;
		}
		ret[i] = Ax[i][n] / den;
		for (let k = i - 1; k >= 0; k--) {
			Ax[k][n] -= Ax[k][i] * ret[i];
		}
	}

	return ret;
}
