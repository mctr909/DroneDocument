/// <reference path="math.js" />
/// <reference path="drawer.js" />
/// <reference path="phase24.js" />
const SAMPLE_RATE = 6000;
const WIDTH = 768;
const HEIGHT = 256;

const COLOR_UP = new Color(0, 192, 0);
const COLOR_UN = new Color(192, 242, 192);
const COLOR_VP = new Color(0, 192, 192);
const COLOR_VN = new Color(192, 242, 242);
const COLOR_WP = new Color(255, 0, 0);
const COLOR_WN = new Color(255, 192, 192);
const COLOR_PHASE = new Color(128, 128, 255);
const COLOR_VELOCITY = new Color(0, 0, 0);
const COLOR_AXIZ = new Color(128, 128, 128);

/******************************************************************************/
let gDrawer = new Drawer("graph", WIDTH, HEIGHT);
let gChkUVW = document.getElementById("chkUVW");
let gChk48 = document.getElementById("chk48");
let gChkPhase = document.getElementById("chkPhase");
let gChkVelo = document.getElementById("chkVelo");
let gChkAcc = document.getElementById("chkAcc");
let gBtnPlay = document.getElementById("btnPlay");
let gAmp = 127;
let gFreq = 1;
let gCalcVeloInterval = 100;
let gCalcVeloCount = 0;

gBtnPlay.onclick = (ev) => {
	ev.target.value = ev.target.value == "再生" ? "停止" : "再生";
};

/******************************************************************************/
let __theta = 0;
let __theta_sum = 0;
let __omega = 0;
function VELOCITY_RESET() {__omega = 0, __theta_sum = 0}
function VELOCITY_UPDATE() {__omega = __theta_sum, __theta_sum = 0}

/******************************************************************************/
function amp_onchange() {
	gAmp = document.getElementById("rangeAmp").value;
}
function freq_onchange() {
	gFreq = document.getElementById("rangeFreq").value * 0.25;
}
function interval_onchange() {
	gCalcVeloInterval = document.getElementById("rangeInterval").value;
}
function main() {
	if (gBtnPlay.value == "再生") {
		gDrawer.clear();
		do_iteration();
	}
	requestNextAnimationFrame(main);
}
{
	document.getElementById("rangeAmp").onchange = amp_onchange;
	document.getElementById("rangeAmp").onmousemove = amp_onchange;
	document.getElementById("rangeFreq").onchange = freq_onchange;
	document.getElementById("rangeFreq").onmousemove = freq_onchange;
	document.getElementById("rangeInterval").onchange = interval_onchange;
	document.getElementById("rangeInterval").onmousemove = interval_onchange;
	requestNextAnimationFrame(main);
}

/******************************************************************************/
const U_RE =  1.000, U_IM =  0.000;
const V_RE = -0.500, V_IM =  0.866;
const W_RE = -0.500, W_IM = -0.866;

let x0 = 0, x1 = 0;
let p0 = 0, p1 = 0;
let f0 = 0, f1 = 0;
let u0 = 0, u1 = 0;
let v0 = 0, v1 = 0;
let w0 = 0, w1 = 0;
let ua0 = 0, ua1 = 0;
let ub0 = 0, ub1 = 0;
let va0 = 0, va1 = 0;
let vb0 = 0, vb1 = 0;
let wa0 = 0, wa1 = 0;
let wb0 = 0, wb1 = 0;
let detected_phase = 0;
let u_re = U_RE, u_im = U_IM;
let v_re = V_RE, v_im = V_IM;
let w_re = W_RE, w_im = W_IM;
let wave_u = 0, wave_v = 0, wave_w = 0;

/******************************************************************************/
function disp_clear() {
	x0 = 0, x1 = 0;
	p0 = 0, p1 = 0;
	f0 = 0, f1 = 0;
	u0 = 0, u1 = 0;
	v0 = 0, v1 = 0;
	w0 = 0, w1 = 0;
	ua0 = 0, ua1 = 0;
	ub0 = 0, ub1 = 0;
	va0 = 0, va1 = 0;
	vb0 = 0, vb1 = 0;
	wa0 = 0, wa1 = 0;
	wb0 = 0, wb1 = 0;
	detected_phase = 0;
	gDrawer.drawLineXY(0, HEIGHT / 2, WIDTH - 1, HEIGHT / 2, COLOR_AXIZ);
	if (!gChkAcc.checked && gFreq <= 1.0) {
		for (let i = -48; i <= 48; i++) {
			let x = i * WIDTH / (96 * gFreq) + WIDTH / 2;
			let axizY;
			if (0 == i % 2) {
				gDrawer.drawStringC(new vec3(x, HEIGHT / 2 + 12), int((i + 48) / 2) % 24, 11);
				axizY = 8;
			} else {
				axizY = 4;
			}
			gDrawer.drawLineXY(x, HEIGHT / 2 - axizY, x, HEIGHT / 2 + axizY, COLOR_AXIZ);
		}
	}
}
function disp_wave() {
	if (gChk48.checked) {
		let colorUp, colorUn;
		let colorVp, colorVn;
		let colorWp, colorWn;
		if (gChkUVW.checked) {
			colorUp = COLOR_UN;
			colorUn = COLOR_UN;
			colorVp = COLOR_VN;
			colorVn = COLOR_VN;
			colorWp = COLOR_WN;
			colorWn = COLOR_WN;
		} else {
			colorUp = COLOR_UP;
			colorUn = COLOR_UN;
			colorVp = COLOR_VP;
			colorVn = COLOR_VN;
			colorWp = COLOR_WP;
			colorWn = COLOR_WN;
		}
		ua1 = (0.5 - (u_del - NEUTRAL) / gAmp * 0.8) * HEIGHT;
		ub1 = (0.5 - (u_adv - NEUTRAL) / gAmp * 0.8) * HEIGHT;
		va1 = (0.5 - (v_del - NEUTRAL) / gAmp * 0.8) * HEIGHT;
		vb1 = (0.5 - (v_adv - NEUTRAL) / gAmp * 0.8) * HEIGHT;
		wa1 = (0.5 - (w_del - NEUTRAL) / gAmp * 0.8) * HEIGHT;
		wb1 = (0.5 - (w_adv - NEUTRAL) / gAmp * 0.8) * HEIGHT;
		gDrawer.drawLineXY(x0, ua0, x1, ua1, colorUn);
		gDrawer.drawLineXY(x0, ub0, x1, ub1, colorUp);
		gDrawer.drawLineXY(x0, va0, x1, va1, colorVn);
		gDrawer.drawLineXY(x0, vb0, x1, vb1, colorVp);
		gDrawer.drawLineXY(x0, wa0, x1, wa1, colorWn);
		gDrawer.drawLineXY(x0, wb0, x1, wb1, colorWp);
		ua0 = ua1;
		ub0 = ub1;
		va0 = va1;
		vb0 = vb1;
		wa0 = wa1;
		wb0 = wb1;
	}
	if (gChkUVW.checked) {
		u1 = (0.5 - wave_u / gAmp * 0.45) * HEIGHT;
		v1 = (0.5 - wave_v / gAmp * 0.45) * HEIGHT;
		w1 = (0.5 - wave_w / gAmp * 0.45) * HEIGHT;
		gDrawer.drawLineXY(x0, u0, x1, u1, COLOR_UP);
		gDrawer.drawLineXY(x0, v0, x1, v1, COLOR_VP);
		gDrawer.drawLineXY(x0, w0, x1, w1, COLOR_WP);
		u0 = u1;
		v0 = v1;
		w0 = w1;
	}
	if (gChkPhase.checked) {
		p1 = (0.5 - 0.5 * Math.sin(__theta * 2 * 3.141592 / 24)) * HEIGHT;
		gDrawer.drawLineXY(x0, p0, x1, p1, COLOR_PHASE);
		p0 = p1;
	}
	if (gChkVelo.checked) {
		f1 = (1 - __omega * 16 / 24 / 1024) * HEIGHT;
		gDrawer.drawLineXY(x0, f0, x1, f1, COLOR_VELOCITY);
		f0 = f1;
	}
	x0 = x1;
}
function do_iteration() {
	disp_clear();
	VELOCITY_RESET();
	gCalcVeloCount = 0;
	let nFreq = gFreq * 2;
	let delta = gChkAcc.checked ? 0 : nFreq;
	for (let i = 0; i < SAMPLE_RATE; i++) {
		x1 = parseInt(i * WIDTH / SAMPLE_RATE);
		{
			let theta = 2 * Math.PI * delta / SAMPLE_RATE;
			let a_re = Math.cos(theta);
			let a_im = Math.sin(theta);
			let temp;
			temp = u_re*a_re - u_im*a_im;
			u_im = u_re*a_im + u_im*a_re;
			u_re = temp;
			temp = v_re*a_re - v_im*a_im;
			v_im = v_re*a_im + v_im*a_re;
			v_re = temp;
			temp = w_re*a_re - w_im*a_im;
			w_im = w_re*a_im + w_im*a_re;
			w_re = temp;
			delta += gChkAcc.checked ? (nFreq / SAMPLE_RATE) : 0;
		}
		let adc_u;
		let adc_v;
		{
			let r = (Math.random() * 2 - 1) * gAmp * 0.05;
			wave_u = r + gAmp * u_im;
			wave_v = r + gAmp * v_im;
			wave_w = r + gAmp * w_im;
			adc_u = int(wave_u) + 128;
			adc_v = int(wave_v) + 128;
			if (adc_u < 0) adc_u = 0;
			if (255 < adc_u) adc_u = 255;
			if (adc_v < 0) adc_v = 0;
			if (255 < adc_v) adc_v = 255;
		}

		/*** U相,V相の誘起電圧から位相を検出 ***/
		detected_phase = phase24_detect(adc_u, adc_v);

		/*** 位相の変化量を積算 ***/
		{
			let phase_diff;
			if (detected_phase < __theta) {
				phase_diff = 24;
			} else {
				phase_diff = 0;
			}
			phase_diff += detected_phase;
			phase_diff -= __theta;
			if (phase_diff >= 12) {
				phase_diff = 0;
			}
			__theta_sum += phase_diff;
		}

		/*** 現在位相を更新 ***/
		__theta = detected_phase;

		/*** 一定間隔で位相変化の積算値を速度として設定 ***/
		if (gCalcVeloInterval <= gCalcVeloCount) {
			VELOCITY_UPDATE();
			gCalcVeloCount = 0;
		} else {
			gCalcVeloCount++;
		}
		disp_wave();
	}
	document.getElementById("dispAmp").value = gAmp;
	document.getElementById("dispFreq").value = gFreq;
	document.getElementById("dispInterval").value = int(gCalcVeloInterval);
	document.getElementById("dispSFreq").value = "velocity: " + __omega;
}
