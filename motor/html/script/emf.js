/// <reference path="math.js" />
/// <reference path="drawer.js" />
const ROTOR_DIAMETER = 100;
const STATOR_DIAMETER = 240;
const ROTOR_DIV = 48;
const SLOT_DIV = 96;
const WAVE_SCOPE_WIDTH = 320;
const WAVE_SCOPE_HEIGHT = 200;
const DISPLAY_SIZE = STATOR_DIAMETER + 20;
const STATOR_POLES = [
	new SelectElement("1", 1),
	new SelectElement("2", 2, true),
	new SelectElement("3", 3),
	new SelectElement("4", 4)
];
const ROTOR_POLES = [
	new SelectElement("2", 2),
	new SelectElement("4", 4, true),
	new SelectElement("6", 6),
	new SelectElement("8", 8),
	new SelectElement("12", 12),
	new SelectElement("16", 16)
];

class MagneticDipole {
	/**
	 * @param {vec3} p 位置
	 * @param {vec3} m 磁気モーメント
	 */
	constructor(p, m) {
		/** 位置(固定)
	 	 * @type {vec3} */
		this.pc = new vec3(p.X, p.Y, p.Z);
		/** 位置(変化)
	 	 * @type {vec3} */
		this.pv = new vec3(p.X, p.Y, p.Z);
		/** 磁気モーメント(固定)
	 	 * @type {vec3} */
		this.mc = new vec3(m.X, m.Y, m.Z);
		/** 磁気モーメント(変化)
	 	 * @type {vec3} */
		this.mv = new vec3(m.X, m.Y, m.Z);
	}
}

class Rotor {
	/** 半径
	 * @type {number} */
	radius = 0;
	/** 極数
	 * @type {number} */
	poles = 0;
	/** 磁気双極子リスト
	 * @type {Array<MagneticDipole>} */
	dipoles = [];
	/**
	 * @param {number} radius 半径
	 * @param {number} poles 極数
	 * @param {number} gap 磁極間ギャップ
	 */
	constructor(radius, poles, gap) {
		const PI2 = 8*Math.atan(1);
		const DIV = 3*ROTOR_DIV;
		this.radius = radius;
		this.poles = poles;
		this.dipoles = [];
		for (let d = 0; d < DIV; d++) {
			let pole = parseInt(poles * d / DIV);
			let th = PI2 * d / DIV;
			let thA = PI2 * (pole + gap * 0.5) / poles;
			let thB = PI2 * (pole + (1 - gap) + gap * 0.5) / poles;
			if (th < thA || thB < th) {
			} else {
				let ns = (0 == pole % 2) ? 1 : -1;
				let p = new vec3(
					this.radius * Math.cos(th),
					this.radius * Math.sin(th)
				);
				let m = new vec3(
					ns * Math.cos(th),
					ns * Math.sin(th)
				);
				this.dipoles.push(new MagneticDipole(p, m));
			}
		}
	}
}

class Slot {
	/** 位置
	 * @type {Array<vec3>} */
	pos = [];
	/** 磁場(磁力)
	 * @type {Array<number>} */
	mf = [];
	/** 磁場(表示位置)
	 * @type {Array<vec3>} */
	mp = [];
	/** 電場(電位)
	 * @type {Array<number>} */
	ef = [];
	/** 電場(表示位置)
	 * @type {Array<vec3>} */
	ep = [];
	/**
	 * スロットを作成
	 * @param {number} radius 半径
	 * @param {number} gap スロット間ギャップ
	 * @param {number} slots スロット数
	 * @param {number} slot_index スロット番号
	 * @param {boolean} clear 磁力・電位のクリアを行うか
	 */
	create(radius, gap, slots, slot_index, clear) {
		const PI2 = 8*Math.atan(1);
		const DIV = parseInt(SLOT_DIV * 3 / slots);
		const OFS_ANGLE = -Math.PI / slots;
		// 位置
		this.pos = [];
		for (let d=DIV; 0<=d; d--) {
			let th = OFS_ANGLE + PI2 * (slot_index + d*(1-gap) / DIV + gap*0.5) / slots;
			this.pos.push(new vec3(radius*Math.cos(th), radius*Math.sin(th)));
		}
		// 磁場・電場
		const MAGNETIC_R = radius + 7;
		const BEMF_R = radius + 13;
		let mf = [];
		let ef = [];
		this.mp = [];
		this.ep = [];
		for (let d=0; d<=DIV; d++) {
			mf.push(0.0);
			ef.push(0.0);
			let th = OFS_ANGLE + PI2 * (slot_index + d*(1-gap) / DIV + gap*0.5) / slots;
			this.mp.push(new vec3(MAGNETIC_R*Math.cos(th), MAGNETIC_R*Math.sin(th)));
			this.ep.push(new vec3(BEMF_R*Math.cos(th), BEMF_R*Math.sin(th)));
		}
		if (clear) {
			this.mf = mf;
			this.ef = ef;
		}
	}
}

class Motor {
	static #COLOR_U = Color.GREEN;
	static #COLOR_V = Color.BLUE;
	static #COLOR_W = Color.RED;
	static #COLOR_AXIZ = Color.BLACK;

	Pos = new vec3();
	TargetFreq = 0.0;
	AccTime = 1.0;
	OnlyU = false;
	WaveScale = 0.1;

	/** @type {Array<Slot>} */
	#slots = [];
	/** @type {Rotor} */
	#rotor = null;
	#freq = 0.0;
	#theta = 0.0;
	#scopeX = 0;
	#scopeU = new vec3();
	#scopeV = new vec3();
	#scopeW = new vec3();
	#scopeA = new vec3();

	/**
	 * 固定子を作成
	 * @param {number} diameter 直径
	 * @param {number} poles 極数
	 * @param {number} gap スロット間ギャップ
	 * @param {boolean} clear 磁力・電位のクリアを行うか
	 */
	createStator(diameter, poles, gap, clear=true) {
		const SLOT_COUNT = 3 * poles;
		if (clear) {
			this.#slots = [];
		}
		for (let s=0; s<SLOT_COUNT; s++) {
			if (clear) {
				this.#slots.push(new Slot());
			}
			this.#slots[s].create(diameter/2, gap, SLOT_COUNT, s, clear);
		}
	}

	/**
	 * 回転子を作成
	 * @param {number} diameter 直径
	 * @param {number} poles 極数
	 * @param {number} gap 磁極間ギャップ
	 */
	createRotor(diameter, poles, gap) {
		this.#rotor = new Rotor(diameter/2, poles, gap);
	}

	/**
	 * @param {Drawer} drawer
	 */
	draw(drawer) {
		// 回転子を描画
		let dipoles = this.#rotor.dipoles;
		for (let ixP=0; ixP<dipoles.length; ixP++) {
			let dipole = dipoles[ixP];
			let pos = dipole.pv;
			let dir = dipole.mv;
			let ax = pos.X + dir.X * 2;
			let ay = pos.Y + dir.Y * 2;
			let bx = pos.X - dir.X * 2;
			let by = pos.Y - dir.Y * 2;
			drawer.fillCircleXY(ax, ay, 2.5, Color.RED, this.Pos);
			drawer.fillCircleXY(bx, by, 2.5, Color.BLUE, this.Pos);
		}
		// 固定子を描画
		const SCALE_E = 1.0 / 2.0;
		const SCALE_M = 0.25 / 2.0;
		let posA = new vec3();
		let posB = new vec3();
		for(let ixS=0; ixS<this.#slots.length; ixS++) {
			let slot = this.#slots[ixS];
			let ef = slot.ef;
			let ep = slot.ep;
			let mf = slot.mf;
			let mp = slot.mp;
			for(let ixF=0, ixP=ep.length-2; ixF<ef.length-1; ixF++, ixP--) {
				// 電場
				let e = (ef[ixF] + ef[ixF+1]) * SCALE_E;
				ep[ixP].add(this.Pos, posA);
				ep[ixP+1].add(this.Pos, posB);
				drawer.drawLine(posA, posB, Drawer.ToHue(e), 20);
				// 磁場
				let m = (mf[ixF] + mf[ixF+1]) * SCALE_M;
				mp[ixP].add(this.Pos, posA);
				mp[ixP+1].add(this.Pos, posB);
				drawer.drawLine(posA, posB, Drawer.ToHue(m), 10);
			}
			// ラベル
			let name;
			let color;
			switch(ixS%3) {
			case 0:
				name = "U", color = Color.GREEN; break;
			case 1:
				name = "V", color = Color.BLUE; break;
			case 2:
				name = "W", color = Color.RED; break;
			}
			let middle = slot.pos[slot.pos.length >> 1];
			middle.normalizeScale(middle.abs + 36, posA);
			posA.add(this.Pos, posA);
			drawer.fillCircle(posA, 12, color);
			drawer.drawStringC(posA, name, 16, Color.WHITE);
		}
	}

	/**
	 * @param {Drawer} drawer
	 */
	drawWave(drawer) {
		// 各相の電位を合計
		let eu = 0.0, ev = 0.0, ew = 0.0;
		for(let ixS=0; ixS<this.#slots.length; ixS++) {
			let slot = this.#slots[ixS];
			let e = 0.0;
			for(let i=0; i<slot.ef.length; i++) {
				e += slot.ef[i];
			}
			e /= this.#slots.length;
			e *= this.WaveScale;
			switch(ixS%3) {
			case 0:
				eu += e; break;
			case 1:
				ev += e; break;
			case 2:
				ew += e; break;
			}
		}

		if (1 < eu) eu = 1;
		if (eu < -1) eu = -1;
		if (1 < ev) ev = 1;
		if (ev < -1) ev = -1;
		if (1 < ew) ew = 1;
		if (ew < -1) ew = -1;

		// 波形をクリア
		if (drawer.Width <= this.#scopeX) {
			const NEUTRAL = drawer.Height/2;
			drawer.clear();
			drawer.drawLine(new vec3(0, NEUTRAL), new vec3(drawer.Width, NEUTRAL), Motor.#COLOR_AXIZ, 1);
			this.#scopeU = new vec3(0, NEUTRAL);
			this.#scopeV = new vec3(0, NEUTRAL);
			this.#scopeW = new vec3(0, NEUTRAL);
			this.#scopeA = new vec3(0, NEUTRAL);
			this.#scopeX = 0;
		}

		// 波形を描画
		let yu = drawer.Height * (0.5-0.5*eu);
		let yv = drawer.Height * (0.5-0.5*ev);
		let yw = drawer.Height * (0.5-0.5*ew);
		let ya = drawer.Height * (0.5-0.49*Math.cos(this.#theta*this.#rotor.poles/2));
		let pu = new vec3(this.#scopeX, yu);
		let pv = new vec3(this.#scopeX, yv);
		let pw = new vec3(this.#scopeX, yw);
		let pa = new vec3(this.#scopeX, ya);
		drawer.drawLine(this.#scopeU, pu, Motor.#COLOR_U, 1);
		if (!this.OnlyU) {
			drawer.drawLine(this.#scopeV, pv, Motor.#COLOR_V, 1);
			drawer.drawLine(this.#scopeW, pw, Motor.#COLOR_W, 1);
		}
		drawer.drawLine(this.#scopeA, pa, Color.BLACK, 1);
		this.#scopeU = pu;
		this.#scopeV = pv;
		this.#scopeW = pw;
		this.#scopeA = pa;
		this.#scopeX += 2;
	}

	/**
	 * ステップ実行
	 */
	step() {	
		// 回転子を動かす
		let rx = Math.cos(this.#theta);
		let ry = Math.sin(this.#theta);
		for (let ixP=0; ixP<this.#rotor.dipoles.length; ixP++) {
			let dipole = this.#rotor.dipoles[ixP];
			let px = dipole.pc.X;
			let py = dipole.pc.Y;
			let mx = dipole.mc.X;
			let my = dipole.mc.Y;
			dipole.pv.X = px*rx - py*ry;
			dipole.pv.Y = px*ry + py*rx;
			dipole.mv.X = mx*rx - my*ry;
			dipole.mv.Y = mx*ry + my*rx;
		}
		// 起電力の計算
		this.calcEMF();
		// 時間を進める
		this.#freq += (this.TargetFreq - this.#freq) / this.AccTime;
		this.#theta += 8*Math.atan(1)*this.#freq / Drawer.FRAME_RATE;
		if (16*Math.atan(1) <= this.#theta) {
			this.#theta -= 16*Math.atan(1);
		}
	}

	/**
	 * 起電力の計算
	 */
	calcEMF() {
		const R_UNIT = this.#rotor.radius;
		const R_MIN = 5.0 / R_UNIT;
		for (let ixS=0; ixS<this.#slots.length; ixS++) {
			let slot = this.#slots[ixS];
			for (let ixP=0; ixP<slot.pos.length; ixP++) {
				let slotPos = slot.pos[ixP];
				let mf = 0.0;
				for (let ixD=0; ixD<this.#rotor.dipoles.length; ixD++) {
					let dipole = this.#rotor.dipoles[ixD];
					let rx = (slotPos.X - dipole.pv.X) / R_UNIT;
					let ry = (slotPos.Y - dipole.pv.Y) / R_UNIT;
					let rz = (slotPos.Z - dipole.pv.Z) / R_UNIT;
					let r = Math.sqrt(rx*rx + ry*ry + rz*rz);
					if (r < R_MIN) {
						r = R_MIN;
					}
					let dot = dipole.mv.X * rx + dipole.mv.Y * ry + dipole.mv.Z * rz;
					mf += dot / r / r / r;
				}
				mf /= this.#rotor.dipoles.length;
				slot.ef[ixP] = -(mf - slot.mf[ixP]);
				slot.mf[ixP] = mf;
			}
		}
	}
}

class Form {
	constructor() {
		addSelectEvent(document.getElementById("chkOnlyU"), (sender) => gMotor.OnlyU = sender.checked);
		addScrollEvent(document.getElementById("trbWaveScale"), (sender) => gMotor.WaveScale = sender.value * 0.001);
		initSelectList(document.getElementById("cmbStatorPole"), STATOR_POLES);
		addSelectEvent(document.getElementById("cmbStatorPole"), this.#cmbStatorPole_onSelect);
		initSelectList(document.getElementById("cmbRotorPole"), ROTOR_POLES);
		addSelectEvent(document.getElementById("cmbRotorPole"), this.#cmbRotorPole_onSelect);
		addClickEvent(document.getElementById("btnPlayStop"), this.#btnPlayStop_onClick);
		addClickEvent(document.getElementById("btnStep"), this.#btnStep_onClick);
		addScrollEvent(document.getElementById("trbStatorGap"), this.#trbStatorGap_onScroll);
		addScrollEvent(document.getElementById("trbMagnetGap"), this.#trbMagnetGap_onScroll);
		addScrollEvent(document.getElementById("trbGap"), this.#trbGap_onScroll);
		addScrollEvent(document.getElementById("trbFreqMax"), this.#trbFreqMax_onScroll);
		addScrollEvent(document.getElementById("trbAcc"), this.#trbAcc_onScroll);
	}
	#btnPlayStop_onClick(sender) {
		if (gIsPlay) {
			sender.value = "　再生　";
		} else {
			sender.value = "　停止　";
		}
		gIsPlay = !gIsPlay;
	}
	#btnStep_onClick(sender) {
		gIsPlay = false;
		gIsStep = true;
		document.getElementById("btnPlayStop").value = "　再生　";
	}
	#cmbStatorPole_onSelect(sender) {
		let idx = sender.selectedIndex;
		gStatorPole = STATOR_POLES[idx].value;
		gMotor.createStator(ROTOR_DIAMETER+gGap, gStatorPole, gStatorGap);
	}
	#cmbRotorPole_onSelect(sender) {
		let idx = sender.selectedIndex;
		gRotorPole = ROTOR_POLES[idx].value;
		gMotor.createRotor(ROTOR_DIAMETER, gRotorPole, gMagnetGap);
	}
	#trbStatorGap_onScroll(sender) {
		let tmp = sender.value / 24;
		if (tmp == gStatorGap) return;
		gStatorGap = tmp;
		document.getElementById("lblStatorGap").innerHTML = gStatorGap*24 + "/24";
		gMotor.createStator(ROTOR_DIAMETER+gGap, gStatorPole, gStatorGap, false);
	}
	#trbMagnetGap_onScroll(sender) {
		let tmp = sender.value / 16;
		if (tmp == gMagnetGap) return;
		gMagnetGap = tmp;
		document.getElementById("lblMagnetGap").innerHTML = gMagnetGap * 16 + "/16";
		gMotor.createRotor(ROTOR_DIAMETER, gRotorPole, gMagnetGap);
	}
	#trbGap_onScroll(sender) {
		let tmp = 1*sender.value;
		gGap = tmp;
		document.getElementById("lblGap").innerHTML = gGap;
		gMotor.createStator(ROTOR_DIAMETER+gGap, gStatorPole, gStatorGap, false);
	}
	#trbFreqMax_onScroll(sender) {
		let rpm = 1*sender.value / 10;
		document.getElementById("lblFreqMax").innerHTML = rpm + "rpm";
		gMotor.TargetFreq = rpm/60;
	}
	#trbAcc_onScroll(sender) {
		let acc = sender.value;
		document.getElementById("lblAcc").innerHTML = acc;
		gMotor.AccTime = acc;
	}
}

let gMotor = new Motor();
let gDrawerM = new Drawer("motor", DISPLAY_SIZE, DISPLAY_SIZE);
let gDrawerW = new Drawer("scope", WAVE_SCOPE_WIDTH, WAVE_SCOPE_HEIGHT);
let gIsPlay = false;
let gIsStep = false;
let gGap = 5;
let gStatorPole = 4;
let gStatorGap = 0;
let gRotorPole = 16;
let gMagnetGap = 0;
function loop() {
	if (gIsPlay || gIsStep) {
		gDrawerM.clear();
		gMotor.step();
		gMotor.draw(gDrawerM);
		gMotor.drawWave(gDrawerW);
		gIsStep = false;
	}
	requestNextAnimationFrame(loop);
}
{
	new Form();
	gMotor.Pos = new vec3(DISPLAY_SIZE/2, DISPLAY_SIZE/2, 0);
	gMotor.createStator(ROTOR_DIAMETER+gGap, gStatorPole, gStatorGap);
	gMotor.createRotor(ROTOR_DIAMETER, gRotorPole, gMagnetGap);
	gMotor.calcEMF();
	gDrawerW.clear();
	gDrawerW.drawLine(
		new vec3(0, gDrawerW.Height/2),
		new vec3(gDrawerW.Width, gDrawerW.Height/2),
		Color.BLACK, 1
	);
	requestNextAnimationFrame(loop);
}
