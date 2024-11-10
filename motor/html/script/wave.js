/// <reference path="math.js" />
/// <reference path="drawer.js" />
const SAMPLE_RATE = 800;
const WIDTH = SAMPLE_RATE;
const HEIGHT = 200;
const HEIGHT_SPEC = 150;
const SPEC_OVERLAP = 8;
const SPEC_LIMIT = -80;

const COLOR_AXIZ_MAJOR = new Color(96, 96, 96);
const COLOR_AXIZ_MINOR = new Color(222, 222, 222);
const COLOR_Z = new Color(220, 220, 96);
const COLOR_UD = new Color(220, 0, 0);
const COLOR_VD = new Color(0, 0, 192);
const COLOR_WD = new Color(0, 172, 0);
const COLOR_UA = new Color(255, 192, 192);
const COLOR_VA = new Color(210, 210, 255);
const COLOR_WA = new Color(172, 220, 172);
const COLOR_UV = new Color(240, 0, 0);
const COLOR_VW = new Color(0, 0, 192);
const COLOR_WU = new Color(0, 172, 0);

let x0 = 0, x1 = 0;
let z0 = 0, z1 = 0;
let ud0 = 0, ud1 = 0;
let vd0 = 0, vd1 = 0;
let wd0 = 0, wd1 = 0;
let ua0 = 0, ua1 = 0;
let va0 = 0, va1 = 0;
let wa0 = 0, wa1 = 0;
let uv0 = 0, uv1 = 0;
let vw0 = 0, vw1 = 0;
let wu0 = 0, wu1 = 0;

let gDrawer = new Drawer("graph", WIDTH, HEIGHT);
let gSpec = new Drawer("spec", WIDTH, HEIGHT_SPEC);
let gZAmp = 0;
let gAmp = 0;
let gChkNormalize = true;
let gChkSpec = true;
let gChkMax = false;
let gChkAvg = false;
let gUV = true;
let gVW = true;
let gWU = true;
let gU = true;
let gV = true;
let gW = true;
let gZ = true;
let gChanged = true;

let PHASE_DIV = 12*2;
let PHASE_DIV2 = PHASE_DIV*2;
let PHASE_SHIFT = parseInt(PHASE_DIV/12);

const NEUTRAL = 128;
const INDEX_STEP = 1;
let INDEX_BITS = 4;
let INDEX_MASK       = 0b1111;
let INDEX_MASK_VALUE = 0b0011;
let INDEX_MASK_MINUS = 0b0100;
let INDEX_MASK_ZERO  = 0b1000;
let INDEX = [
	0x1, 0x17,
	0x2, 0x07,
	0x3, 0x87,
	0x3, 0x46,
	0x3, 0x55,
	0x3, 0x64,
	0x3, 0x78,
	0x2, 0x70,
	0x1, 0x71,
	0x0, 0x72,
	0x8, 0x73,
	0x4, 0x63,
	0x5, 0x53,
	0x6, 0x43,
	0x7, 0x83,
	0x7, 0x02,
	0x7, 0x11,
	0x7, 0x20,
	0x7, 0x38,
	0x6, 0x34,
	0x5, 0x35,
	0x4, 0x36,
	0x8, 0x37,
	0x0, 0x27
];
let PHASE_STEP = 5;
let VALUE_STEP = 5;
let PHASE = [];
let VALUE = [];
let MAXD = [];
let MAXA = [];
let SPEC_AVG = [];
let SPEC_MAX = [];

/******************************************************************************/
{
	document.getElementById("rangeZ").onchange = zamp_onchange;
	document.getElementById("rangeZ").onmousemove = zamp_onchange;
	document.getElementById("rangeAmp").onchange = amp_onchange;
	document.getElementById("rangeAmp").onmousemove = amp_onchange;
	document.getElementById("chkNormalize").onchange = normalize_onchange;
	document.getElementById("chkSpec").onchange = spec_onchange;
	document.getElementById("chkMax").onchange = max_onchange;
	document.getElementById("chkAvg").onchange = avg_onchange;
	document.getElementById("chkUV").onchange = uv_onchange;
	document.getElementById("chkVW").onchange = vw_onchange;
	document.getElementById("chkWU").onchange = wu_onchange;
	document.getElementById("chkU").onchange = u_onchange;
	document.getElementById("chkV").onchange = v_onchange;
	document.getElementById("chkW").onchange = w_onchange;
	document.getElementById("chkZ").onchange = z_onchange;
	create_valueTable();
	create_indexTable();
	disp_valueTable();
	disp_indexTable();
	zamp_onchange();
	amp_onchange();
	normalize_onchange();
	uv_onchange();
	vw_onchange();
	wu_onchange();
	u_onchange();
	v_onchange();
	w_onchange();
	z_onchange();
	requestNextAnimationFrame(main);
}

/******************************************************************************/
function zamp_onchange() {
	gZAmp = document.getElementById("rangeZ").value * 0.01;
	create_valueTable();
	create_indexTable();
	update_valueTable();
	update_indexTable();
	gChanged = true;
}
function amp_onchange() {
	gAmp = document.getElementById("rangeAmp").value;
	gChanged = true;
}
function normalize_onchange() {
	gChkNormalize = document.getElementById("chkNormalize").checked;
	gChanged = true;
}
function stepCount_onchange(obj) {
	PHASE_DIV = obj.value*1;
	PHASE_DIV2 = PHASE_DIV*2;
	PHASE_SHIFT = parseInt(PHASE_DIV/12);
	create_valueTable();
	create_indexTable();
	disp_valueTable();
	disp_indexTable();
	zamp_onchange();
	amp_onchange();
	normalize_onchange();
	uv_onchange();
	vw_onchange();
	wu_onchange();
	u_onchange();
	v_onchange();
	w_onchange();
	z_onchange();
}
function spec_onchange() {
	gChkSpec = document.getElementById("chkSpec").checked;
	gChanged = true;
}
function max_onchange() {
	gChkMax = document.getElementById("chkMax").checked;
	gChanged = true;
}
function avg_onchange() {
	gChkAvg = document.getElementById("chkAvg").checked;
	gChanged = true;
}
function uv_onchange() {
	gUV = document.getElementById("chkUV").checked;
	gChanged = true;
}
function vw_onchange() {
	gVW = document.getElementById("chkVW").checked;
	gChanged = true;
}
function wu_onchange() {
	gWU = document.getElementById("chkWU").checked;
	gChanged = true;
}
function u_onchange() {
	gU = document.getElementById("chkU").checked;
	gChanged = true;
}
function v_onchange() {
	gV = document.getElementById("chkV").checked;
	gChanged = true;
}
function w_onchange() {
	gW = document.getElementById("chkW").checked;
	gChanged = true;
}
function z_onchange() {
	gZ = document.getElementById("chkZ").checked;
	gChanged = true;
}
function valueTableCheck_onchange(obj) {
	create_indexTable();
	update_indexTable();
	let enableColCount = 0;
	for (let i=0; ; i++) {
		let obj = document.getElementById("tableValueCheck_" + i);
		if (obj == null) {
			break;
		}
		let objhd = document.getElementById("valueTableHead_" + i);
		if (obj.checked) {
			objhd.innerHTML = "[" + enableColCount + "]";
			enableColCount++;
		} else {
			objhd.innerHTML = "[ ]";
		}
	}
	gChanged = true;
}
function valueTable_onchange(obj) {
	let strId = obj.id;
	let index = strId.indexOf("_") + 1;
	index = strId.substring(index) * 1;
	PHASE[index] = obj.value * 1;
	let row = parseInt(index / PHASE_STEP);
	let col = index % PHASE_STEP;
	let chkObj = document.getElementById("tableValueCheck_" + col);
	if (chkObj.checked) {
		let enableColCount = 0;
		let editCol = 0;
		for (let i=0; ; i++) {
			let obj = document.getElementById("tableValueCheck_" + i);
			if (obj == null) {
				break;
			}
			if (col == i) {
				editCol = enableColCount;
			}
			if (obj.checked) {
				enableColCount++;
			}
		}
		VALUE[row*enableColCount+editCol] = PHASE[index];
	}
	gChanged = true;
}

/******************************************************************************/
function main() {
	if (gChanged) {
		disp_clear();
		calc_spec_avg();
		disp_spec();
		for (let i = 0; i < SAMPLE_RATE; i++) {
			x1 = parseInt(i * WIDTH / SAMPLE_RATE);
			disp_wave();
		}
		document.getElementById("dispZ").value = "0." + parseInt(gZAmp*100);
		document.getElementById("dispAmp").value = gAmp;
		gChanged = false;
	}
	requestNextAnimationFrame(main);
}

/******************************************************************************/
function create_valueTable() {
	MAXA = [2];
	MAXD = [1];
	PHASE = [];
	PHASE_STEP = PHASE_DIV / 4 - 1;
	for (let i=0; i<PHASE_STEP; i++) {
		PHASE.push(0);
	}
	for (let v = 4; v<=128; v+=2) {
		let maxA = 0;
		{
			let max = 0;
			let maxH = 0;
			for (let i=0; i<WIDTH; i++) {
				let th = 2*Math.PI*i/WIDTH;
				let valU = Math.sin(th) + gZAmp*Math.sin(3*th);
				valU = Math.abs(valU);
				if (valU > max) {
					max = valU;
				}
				valU *= 2;
				if (valU > maxH) {
					maxH = valU;
				}
			}
			MAXA.push(maxH);
			if (max > maxA) {
				maxA = max;
			}
		}
		{
			let max = 0;
			for (let i=0; i<PHASE_DIV; i++) {
				let th = 2*Math.PI*i/PHASE_DIV;
				let valZ = gZAmp*Math.sin(3*th);
				let valU = valZ + Math.sin(th);
				let valV = valZ + Math.sin(th + 2*Math.PI/3);
				valU *= v / maxA;
				valV *= v / maxA;
				if (valU > 127) {
					valU = 127;
				}
				if (valV > 127) {
					valV = 127;
				}
				let val = parseInt(Math.abs(valU - valV));
				if (val > max) {
					max = val;
				}
			}
			MAXD.push(max);
		}
		for (let i=1; i<=PHASE_STEP; i++) {
			let th = 2*Math.PI*i/PHASE_DIV;
			let val = Math.sin(th) + gZAmp*Math.sin(3*th);
			val *= v / maxA;
			val = parseInt(val);
			if (val > 127) {
				val = 127;
			}
			PHASE.push(val);
		}
	}
}
function create_indexTable() {
	let enableValues = [];
	let enableSteps = [];
	for (let i=0; ; i++) {
		let chkObj = document.getElementById("tableValueCheck_" + i);
		if (chkObj == null) {
			break;
		}
		if (chkObj.checked) {
			let th = 2*Math.PI*(i+1)/PHASE_DIV;
			let valZ = gZAmp*Math.sin(3*th);
			let valU = valZ + Math.sin(th);
			enableValues.push(valU);
			enableSteps.push(i);
		}
	}
	VALUE = [];
	for (let j=0; j<PHASE.length; j+=PHASE_STEP) {
		for (let i=0; i<enableSteps.length; i++) {
			VALUE.push(PHASE[j + enableSteps[i]]);
		}
	}
	VALUE_STEP = enableSteps.length;
	if (VALUE_STEP <= 4) {
		INDEX_BITS = 4;
		INDEX_MASK       = 0b1111;
		INDEX_MASK_VALUE = 0b0011;
		INDEX_MASK_MINUS = 0b0100;
		INDEX_MASK_ZERO  = 0b1000;
	}
	else if (VALUE_STEP <= 8) {
		INDEX_BITS = 5;
		INDEX_MASK       = 0b0001_1111;
		INDEX_MASK_VALUE = 0b0000_0111;
		INDEX_MASK_MINUS = 0b0000_1000;
		INDEX_MASK_ZERO  = 0b0001_0000;
	}
	else {
		INDEX_BITS = 8;
		INDEX_MASK       = 0b1111_1111;
		INDEX_MASK_VALUE = 0b0011_1111;
		INDEX_MASK_MINUS = 0b0100_0000;
		INDEX_MASK_ZERO  = 0b1000_0000;
	}
	INDEX = new Array(PHASE_DIV);
	for (let p=0; p<PHASE_DIV; p++) {
		let th = 2*Math.PI*(p+PHASE_SHIFT)/PHASE_DIV;
		let valZ = gZAmp*Math.sin(3*th);
		let valU = valZ + Math.sin(th);
		let valV = valZ + Math.sin(th + 2*Math.PI/3);
		let valW = valZ + Math.sin(th - 2*Math.PI/3);
		set_index(enableValues, p, 0, valU);
		set_index(enableValues, p, 1, valV);
		set_index(enableValues, p, 2, valW);
	}
}
function set_index(enableValues, step, phase, value) {
	let sign = Math.sign(value);
	value = Math.abs(value);
	let index = null;
	if (value >= enableValues[0]-0.0001) {
		let min = 256;
		for (let i=0; i<enableValues.length; i++) {
			let diff = Math.abs(enableValues[i] - value);
			if (diff < min) {
				min = diff;
				index = i;
			}
		}
	}
	if (null == index) {
		index = INDEX_MASK_ZERO;
	} else {
		index = index & INDEX_MASK_VALUE;
		if (sign < 0) {
			index |= INDEX_MASK_MINUS;
		}
	}
	switch (INDEX_BITS) {
	case 4:
		step <<= 1;
		switch (phase) {
		case 0:
			INDEX[step] = index;
			break;
		case 1:
			INDEX[step | 1] &= 0b0000_1111;
			INDEX[step | 1] |= index << 4;
			break;
		case 2:
			INDEX[step | 1] &= 0b1111_0000;
			INDEX[step | 1] |= index;
			break;
		}
		break;
	case 5:
		step <<= 1;
		switch (phase) {
		case 0:
			INDEX[step] &= 0b1000_0011;
			INDEX[step] |= index << 2;
			break;
		case 1:
			INDEX[step    ] &= 0b1111_1100;
			INDEX[step    ] |= index >> 3;
			INDEX[step | 1] &= 0b0001_1111;
			INDEX[step | 1] |= (index & 0b111) << 5;
			break;
		case 2:
			INDEX[step | 1] &= 0b1110_0000;
			INDEX[step | 1] |= index;
			break;
		}
		break;
	case 8:
		step = 3*step + phase;
		INDEX[step] = index;
		break;
	}
}
function get_index(step) {
	switch (INDEX_BITS) {
	case 4:
		step <<= 1;
		return {
			u:INDEX[step],
			v:INDEX[step | 1] >> 4,
			w:INDEX[step | 1] & 0xF
		};
	case 5:
		step <<= 1;
		return {
			u: (INDEX[step    ] & 0b0111_1100) >> 2,
			v:((INDEX[step    ] & 0b0000_0011) << 3)
			 |((INDEX[step | 1] & 0b1110_0000) >> 5),
			w:  INDEX[step | 1] & 0b0001_1111
		};
	case 8:
		step *= 3;
		return {
			u:INDEX[step],
			v:INDEX[step + 1],
			w:INDEX[step + 2]
		};
	default:
		return {
			u:INDEX_MASK_ZERO,
			v:INDEX_MASK_ZERO,
			w:INDEX_MASK_ZERO
		};
	}
}
function indexToText(index) {
	if ((index & INDEX_MASK_ZERO) == 0) {
		if ((index & INDEX_MASK_MINUS) == 0) {
			return index;
		} else {
			return -(index & INDEX_MASK_VALUE);
		}
	} else {
		return "";
	}
}
function wave_gen(amp, phase) {
	let idx = get_index(phase);
	let index_u = idx.u;
	let index_v = idx.v;
	let index_w = idx.w;

	let value_u = index_u & INDEX_MASK_VALUE;
	let value_v = index_v & INDEX_MASK_VALUE;
	let value_w = index_w & INDEX_MASK_VALUE;
	amp *= VALUE_STEP;
	value_u = VALUE[amp + value_u];
	value_v = VALUE[amp + value_v];
	value_w = VALUE[amp + value_w];

	if (index_u & INDEX_MASK_ZERO) {
		value_u = 0;
	}
	if (index_v & INDEX_MASK_ZERO) {
		value_v = 0;
	}
	if (index_w & INDEX_MASK_ZERO) {
		value_w = 0;
	}

	if (index_u & INDEX_MASK_MINUS) {
		value_u = NEUTRAL - value_u;
	} else {
		value_u = NEUTRAL + value_u;
	}
	if (index_v & INDEX_MASK_MINUS) {
		value_v = NEUTRAL - value_v;
	} else {
		value_v = NEUTRAL + value_v;
	}
	if (index_w & INDEX_MASK_MINUS) {
		value_w = NEUTRAL - value_w;
	} else {
		value_w = NEUTRAL + value_w;
	}
	return {u:value_u, v:value_v, w:value_w};
}
function calc_spec(amp, normalize) {
	const N = PHASE_DIV*SPEC_OVERLAP;
	const MIN = Math.pow(10, SPEC_LIMIT/20);
	const AMP_D = 1 / (normalize ? MAXD[amp] : 255);
	let wave = [];
	for (let i=0; i<PHASE_DIV; i++) {
		let value = wave_gen(amp, i);
		let valueUd = (value.u - NEUTRAL) * AMP_D;
		let valueVd = (value.v - NEUTRAL) * AMP_D;
		let val = valueUd - valueVd;
		for (let j=0; j<SPEC_OVERLAP; j++) {
			wave.push(val);
		}
	}
	let spec = [];
	for (let w=0; w<N/2; w++) {
		let re = 0.0;
		let im = 0.0;
		for (let t=0; t<N; t++) {
			let th = 2*Math.PI*w*t/N;
			re -= Math.cos(th) * wave[t];
			im += Math.sin(th) * wave[t];
		}
		let value = 2 * Math.sqrt(re*re + im*im) / N;
		if (value < MIN) {
			value = MIN;
		}
		value = 20*Math.log10(value);
		spec.push(value);
	}
	return spec;
}
function calc_spec_avg() {
	SPEC_MAX = calc_spec(1, false);
	SPEC_AVG = [];
	for (let i=0; i<SPEC_MAX.length; i++) {
		SPEC_AVG.push(SPEC_MAX[i]);
	}
	for (let a=2; a<64; a++) {
		let s = calc_spec(a, false);
		for (let i=0; i<s.length; i++) {
			if (s[i] > SPEC_MAX[i]) {
				SPEC_MAX[i] = s[i];
			}
			SPEC_AVG[i] += s[i]*s[i];
		}
	}
	let avg1 = SPEC_AVG[1];
	for (let i=0; i<SPEC_AVG.length; i++) {
		SPEC_AVG[i] = -Math.sqrt((SPEC_AVG[i] - avg1)/64);
	}
}

/******************************************************************************/
function disp_valueTable() {
	let table = "<table border='1' style='border-collapse:collapse;'>";
	table += "<tr>";
	table += "<th colspan='" + (PHASE_STEP + 1) + "'>値テーブル</th>";
	table += "</tr>"
	table += "<tr>";
	table += "<th></th>";
	for (let i = 0; i < PHASE_STEP; i++) {
		table += "<th>";
		table += "<input type='checkbox' onchange='valueTableCheck_onchange(this);'";
		table += " id='tableValueCheck_" + i + "' checked/>";
		table += "<div id='valueTableHead_" + i + "'>[" + i + "]</div></th>";
	}
	table += "</tr>";
	for (let v = 1, j = PHASE_STEP; j < PHASE.length; v++, j += PHASE_STEP) {
		table += "<tr>";
		table += "<th>[" + v + "]</th>";
		for (let i = 0; i < PHASE_STEP; i++) {
			let val = PHASE[j + i];
			table += "<td>";
			table += "<input style='width:30px;' onchange='valueTable_onchange(this);'";
			table += " value='" + val + "'";
			table += " id='tableValue_" + (j + i) + "'";
			table += "/>";
			table += "</td>";
		}
		table += "</tr>";
	}
	table += "</table>";
	document.getElementById("valueTable").innerHTML = table;
}
function update_valueTable() {
	for (let v = 1, j = PHASE_STEP; j < PHASE.length; v++, j += PHASE_STEP) {
		for (let i = 0; i < PHASE_STEP; i++) {
			let obj = document.getElementById("tableValue_" + (j + i));
			if (null != obj) {
				obj.value = PHASE[j + i];
			}
		}
	}
}
function disp_indexTable() {
	let table = "<table border='1' style='border-collapse:collapse;'>";
	table += "<tr>";
	table += "<th colspan='5'>値テーブル索引</th>";
	table += "</tr>";
	table += "<tr>";
	table += "<th></th>";
	table += "<th>U</th>";
	table += "<th>V</th>";
	table += "<th>W</th>";
	table += "</tr>";
	for (let i=0,j=0; i<PHASE_DIV; i++, j+=3) {
		let idx = get_index(i);
		let strU = indexToText(idx.u);
		let strV = indexToText(idx.v);
		let strW = indexToText(idx.w);
		table += "<tr>";
		table += "<th>[" + i + "]</th>";
		table += "<td class='index' id='indexU_" + i + "'>";
		table += strU;
		table += "</td><td class='index' id='indexV_" + i + "'>";
		table += strV;
		table += "</td><td class='index' id='indexW_" + i + "'>";
		table += strW;
		table += "</td>";
		table += "</tr>";
	}
	table += "</table>";
	document.getElementById("indexTable").innerHTML = table;
}
function update_indexTable() {
	for (let i=0; i<PHASE_DIV; i++) {
		let idx = get_index(i);
		let objU = document.getElementById("indexU_" + i);
		let objV = document.getElementById("indexV_" + i);
		let objW = document.getElementById("indexW_" + i);
		objU.innerHTML = indexToText(idx.u);
		objV.innerHTML = indexToText(idx.v);
		objW.innerHTML = indexToText(idx.w);
	}
}
function disp_clear() {
	x0 = 0, x1 = 0;
	z0 = HEIGHT / 2, z1 = z0;
	ud0 = HEIGHT / 2, ud1 = ud0;
	vd0 = HEIGHT / 2, vd1 = vd0;
	wd0 = HEIGHT / 2, wd1 = vd0;
	ua0 = HEIGHT / 2, ua1 = ua0;
	va0 = HEIGHT / 2, va1 = va0;
	wa0 = HEIGHT / 2, wa1 = va0;
	uv0 = HEIGHT / 2, uv1 = uv0;
	vw0 = HEIGHT / 2, vw1 = vw0;
	wu0 = HEIGHT / 2, wu1 = wu0;
	gDrawer.clear();
	gDrawer.drawLineXY(0, HEIGHT / 2, WIDTH - 1, HEIGHT / 2, COLOR_AXIZ_MAJOR);
	for (let i = 0; i <= PHASE_DIV2; i++) {
		let x = i * WIDTH / PHASE_DIV2;
		let axizY;
		gDrawer.drawLineXY(x, 0, x, HEIGHT, COLOR_AXIZ_MINOR);
		if (0 == i % 2) {
			axizY = 8;
		} else {
			axizY = 4;
		}
		gDrawer.drawLineXY(x, HEIGHT / 2 - axizY, x, HEIGHT / 2 + axizY, COLOR_AXIZ_MAJOR);
	}
	for (let i = 0; i <= PHASE_DIV2; i+=2) {
		let x = i * WIDTH / PHASE_DIV2;
		gDrawer.drawStringC(new vec3(x, HEIGHT / 2 + 14), i % PHASE_DIV, 14);
	}
}
function disp_spec() {
	gSpec.clear();
	gSpec.drawLineXY(0, 0, WIDTH - 1, 0, COLOR_AXIZ_MAJOR);
	for (let i = 0; i < -SPEC_LIMIT; i++) {
		let y = -i * HEIGHT_SPEC / SPEC_LIMIT;
		if (0 == i%10) {
			gSpec.drawLineXY(0, y, WIDTH, y, COLOR_AXIZ_MINOR);
		}
	}
	let spec = calc_spec(gAmp, gChkNormalize);
	const SPEC_WIDTH = spec.length;
	const X_DELTA = WIDTH / SPEC_WIDTH;
	for (let i = 0; i <= SPEC_WIDTH; i++) {
		let x = i * X_DELTA;
		if (0 == i % PHASE_DIV) {
			gSpec.drawLineXY(x, 0, x, HEIGHT_SPEC, COLOR_AXIZ_MAJOR);
		} else {
			gSpec.drawLineXY(x, 0, x, HEIGHT_SPEC, COLOR_AXIZ_MINOR);
		}
	}
	if (gChkMax) {
		let x0 = 0;
		let value0 = SPEC_MAX[0] * HEIGHT_SPEC / SPEC_LIMIT;
		for (let i = 0; i <= SPEC_WIDTH; i++) {
			let x1 = i * X_DELTA;
			let value1 = SPEC_MAX[i] * HEIGHT_SPEC / SPEC_LIMIT;
			gSpec.drawLineXY(x0, value0, x1, value1, COLOR_UA, 3);
			x0 = x1;
			value0 = value1;
		}
	}
	if (gChkAvg) {
		let x0 = 0;
		let value0 = SPEC_AVG[0] * HEIGHT_SPEC / SPEC_LIMIT;
		for (let i = 0; i <= SPEC_WIDTH; i++) {
			let x1 = i * X_DELTA;
			let value1 = SPEC_AVG[i] * HEIGHT_SPEC / SPEC_LIMIT;
			gSpec.drawLineXY(x0, value0, x1, value1, COLOR_WD);
			x0 = x1;
			value0 = value1;
		}
	}
	if (gChkSpec) {
		let x0 = 0;
		let value0 = spec[0] * HEIGHT_SPEC / SPEC_LIMIT;
		for (let i = 0; i <= SPEC_WIDTH; i++) {
			let x1 = i * X_DELTA;
			let value1 = spec[i] * HEIGHT_SPEC / SPEC_LIMIT;
			gSpec.drawLineXY(x0, value0, x1, value1);
			x0 = x1;
			value0 = value1;
		}
	}
	for (let i = 0; i <= SPEC_WIDTH; i+=PHASE_DIV) {
		let x = i * X_DELTA;
		gSpec.drawStringC(new vec3(x, 8), "x" + i, 14);
	}
}
function disp_wave() {
	let phase = parseInt(x1 * PHASE_DIV2 / WIDTH) % PHASE_DIV;
	let wave = wave_gen(gAmp, phase);

	let ampD = 1 / (gChkNormalize ? MAXD[gAmp] : 255);
	let valueUd = (wave.u - NEUTRAL) * ampD;
	let valueVd = (wave.v - NEUTRAL) * ampD;
	let valueWd = (wave.w - NEUTRAL) * ampD;
	ud1 = 0.5 - 0.5 * valueUd;
	vd1 = 0.5 - 0.5 * valueVd;
	wd1 = 0.5 - 0.5 * valueWd;
	ud1 *= HEIGHT;
	vd1 *= HEIGHT;
	wd1 *= HEIGHT;

	var uv = valueUd - valueVd;
	var vw = valueVd - valueWd;
	var wu = valueWd - valueUd;
	uv1 = 0.5 - 0.5 * uv;
	vw1 = 0.5 - 0.5 * vw;
	wu1 = 0.5 - 0.5 * wu;
	uv1 *= HEIGHT;
	vw1 *= HEIGHT;
	wu1 *= HEIGHT;

	let th = 4 * Math.PI * x1 / WIDTH + 2*Math.PI*PHASE_SHIFT/PHASE_DIV;
	let valueZ = gZAmp*Math.sin(3*th);
	let valueUa = valueZ + Math.sin(th);
	let valueVa = valueZ + Math.sin(th + 2*Math.PI/3);
	let valueWa = valueZ + Math.sin(th - 2*Math.PI/3);
	let ampA = 1.15 / (gChkNormalize ? MAXA[gAmp] : (127/gAmp));
	z1 = 0.5 - 0.5 * valueZ * ampA;
	ua1 = 0.5 - 0.5 * valueUa * ampA;
	va1 = 0.5 - 0.5 * valueVa * ampA;
	wa1 = 0.5 - 0.5 * valueWa * ampA;
	z1 *= HEIGHT;
	ua1 *= HEIGHT;
	va1 *= HEIGHT;
	wa1 *= HEIGHT;

	if (gZ) {
		gDrawer.drawLineXY(x0, z0, x1, z1, COLOR_Z, 3);
	}
	if (gWU) {
		gDrawer.drawLineXY(x0, wu0, x1, wu1, COLOR_WU, 3);
	}
	if (gVW) {
		gDrawer.drawLineXY(x0, vw0, x1, vw1, COLOR_VW, 3);
	}
	if (gUV) {
		gDrawer.drawLineXY(x0, uv0, x1, uv1, COLOR_UV, 3);
	}
	if (gW) {
		gDrawer.drawLineXY(x0, wa0, x1, wa1, COLOR_WA, 3);
	}
	if (gV) {
		gDrawer.drawLineXY(x0, va0, x1, va1, COLOR_VA, 3);
	}
	if (gU) {
		gDrawer.drawLineXY(x0, ua0, x1, ua1, COLOR_UA, 3);
	}
	if (gW) {
		gDrawer.drawLineXY(x0, wd0, x1, wd1, COLOR_WD);
	}
	if (gV) {
		gDrawer.drawLineXY(x0, vd0, x1, vd1, COLOR_VD);
	}
	if (gU) {
		gDrawer.drawLineXY(x0, ud0, x1, ud1, COLOR_UD);
	}

	x0 = x1;
	z0 = z1;
	ud0 = ud1;
	vd0 = vd1;
	wd0 = wd1;
	ua0 = ua1;
	va0 = va1;
	wa0 = wa1;
	uv0 = uv1;
	vw0 = vw1;
	wu0 = wu1;
}
