/// <reference path="math.js" />
/// <reference path="drawer.js" />
const SAMPLE_RATE = 800;
const WIDTH = SAMPLE_RATE;
const HEIGHT = 200;
const HEIGHT_SPEC = 150;
const SPEC_OVERLAP = 4;
const SPEC_LIMIT = -80;

const COLOR_AXIZ_MAJOR = new Color(96, 96, 96);
const COLOR_AXIZ_MINOR = new Color(210, 210, 210);
const COLOR_Z = new Color(220, 220, 96);
const COLOR_UQ = new Color(220, 0, 0);
const COLOR_VQ = new Color(0, 0, 192);
const COLOR_WQ = new Color(0, 172, 0);
const COLOR_UA = new Color(255, 192, 192);
const COLOR_VA = new Color(210, 210, 255);
const COLOR_WA = new Color(172, 220, 172);
const COLOR_UV = new Color(240, 0, 0);
const COLOR_VW = new Color(0, 0, 192);
const COLOR_WU = new Color(0, 172, 0);

let gDrawer = new Drawer("graph", WIDTH, HEIGHT);
let gSpec = new Drawer("spec", WIDTH, HEIGHT_SPEC);
let RangeZAmp = 0;
let RangeAmp = 0;
let EnableNormalize = true;
let EnableSpec = true;
let EnableSpecAvg = false;
let EnableSpecMax = false;
let EnableUV = true;
let EnableVW = true;
let EnableWU = true;
let EnableU = true;
let EnableV = true;
let EnableW = true;
let EnableZ = true;
let EnableQuantize = true;
let Changed = true;

let PHASE_DIV = 12*2;
let PHASE_DIV2 = PHASE_DIV*2;
let PHASE_SHIFT = parseInt(PHASE_DIV/12);

const NEUTRAL = 128;
let INDEX_BITS = 0;
let INDEX_MASK = 0;
let INDEX_MASK_VALUE = 0;
let INDEX_MASK_MINUS = 0;
let INDEX_MASK_ZERO  = 0;
let INDEX = [];

let VALUE_ALL_STEP = 0;
let VALUE_ALL = [];
let VALUE_STEP = 0;
let VALUE = [];

let MAXA = 0;
let MAXD = [];
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
	document.getElementById("chkQuantize").onchange = quantize_onchange;
	createValueTable();
	createIndexTable();
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
	quantize_onchange();
	requestNextAnimationFrame(main);
}

/******************************************************************************/
function zamp_onchange() {
	RangeZAmp = document.getElementById("rangeZ").value * 0.01;
	updateValueTable();
	updateIndexTable();
	Changed = true;
}
function amp_onchange() {
	RangeAmp = document.getElementById("rangeAmp").value;
	Changed = true;
}
function normalize_onchange() {
	EnableNormalize = document.getElementById("chkNormalize").checked;
	Changed = true;
}
function stepCount_onchange(obj) {
	PHASE_DIV = obj.value*1;
	PHASE_DIV2 = PHASE_DIV*2;
	PHASE_SHIFT = PHASE_DIV/12;
	createValueTable();
	createIndexTable();
	Changed = true;
}
function spec_onchange() {
	EnableSpec = document.getElementById("chkSpec").checked;
	Changed = true;
}
function max_onchange() {
	EnableSpecMax = document.getElementById("chkMax").checked;
	Changed = true;
}
function avg_onchange() {
	EnableSpecAvg = document.getElementById("chkAvg").checked;
	Changed = true;
}
function uv_onchange() {
	EnableUV = document.getElementById("chkUV").checked;
	Changed = true;
}
function vw_onchange() {
	EnableVW = document.getElementById("chkVW").checked;
	Changed = true;
}
function wu_onchange() {
	EnableWU = document.getElementById("chkWU").checked;
	Changed = true;
}
function u_onchange() {
	EnableU = document.getElementById("chkU").checked;
	Changed = true;
}
function v_onchange() {
	EnableV = document.getElementById("chkV").checked;
	Changed = true;
}
function w_onchange() {
	EnableW = document.getElementById("chkW").checked;
	Changed = true;
}
function z_onchange() {
	EnableZ = document.getElementById("chkZ").checked;
	Changed = true;
}
function quantize_onchange() {
	EnableQuantize = document.getElementById("chkQuantize").checked;
	Changed = true;
}
function valueTableCheck_onchange(obj) {
	setIndexTable();
	updateIndexTable();
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
	Changed = true;
}
function valueTable_onchange(obj) {
	let strId = obj.id;
	let index = strId.indexOf("_") + 1;
	index = strId.substring(index) * 1;
	VALUE_ALL[index] = obj.value * 1;
	let row = parseInt(index / VALUE_ALL_STEP);
	let col = index % VALUE_ALL_STEP;
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
		VALUE[row*enableColCount+editCol] = VALUE_ALL[index];
	}
	Changed = true;
}

/******************************************************************************/
function main() {
	if (Changed) {
		clearDisp();
		for (let i = 0; i < SAMPLE_RATE; i++) {
			x1 = parseInt(i * WIDTH / SAMPLE_RATE);
			dispWave();
		}
		dispSpec();
		document.getElementById("dispZ").value = "0." + parseInt(RangeZAmp*100);
		document.getElementById("dispAmp").value = RangeAmp;
		Changed = false;
	}
	requestNextAnimationFrame(main);
}

/******************************************************************************/
function setValueTable() {
	let maxA = 0;
	for (let i=0; i<WIDTH; i++) {
		let th = 2*Math.PI*i/WIDTH;
		let val = Math.sin(th) + RangeZAmp*Math.sin(3*th);
		val = Math.abs(val);
		if (val > maxA) {
			maxA = val;
		}
	}
	MAXA = maxA*2.05;
	MAXD = [1];
	VALUE_ALL = [];
	VALUE_ALL_STEP = parseInt(PHASE_DIV / 4 + 0.5) - 1;
	for (let i=0; i<VALUE_ALL_STEP; i++) {
		VALUE_ALL.push(0);
	}
	for (let v = 4; v<=128; v+=2) {
		let max = 0;
		for (let i=0; i<VALUE_ALL_STEP; i++) {
			let th = 2*Math.PI*(i+1)/PHASE_DIV;
			let val = Math.sin(th) + RangeZAmp*Math.sin(3*th);
			val *= v / maxA;
			val = parseInt(val);
			if (val > 127) {
				val = 127;
			}
			if (val > max) {
				max = val;
			}
			VALUE_ALL.push(val);			
		}
		MAXD.push(max*2.05);
	}
}
function createValueTable() {
	setValueTable();
	let table = "<table border='1' style='border-collapse:collapse;'>";
	table += "<tr>";
	table += "<th colspan='" + (VALUE_ALL_STEP + 1) + "'>値テーブル</th>";
	table += "</tr>"
	table += "<tr>";
	table += "<th></th>";
	for (let i = 0; i < VALUE_ALL_STEP; i++) {
		table += "<th>";
		table += "<input type='checkbox' onchange='valueTableCheck_onchange(this);'";
		table += " id='tableValueCheck_" + i + "' checked/>";
		table += "<div id='valueTableHead_" + i + "'>[" + i + "]</div></th>";
	}
	table += "</tr>";
	for (let v = 1, j = VALUE_ALL_STEP; j < VALUE_ALL.length; v++, j += VALUE_ALL_STEP) {
		table += "<tr>";
		table += "<th>[" + v + "]</th>";
		for (let i = 0; i < VALUE_ALL_STEP; i++) {
			let val = VALUE_ALL[j + i];
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
function updateValueTable() {
	setValueTable();
	for (let v = 1, j = VALUE_ALL_STEP; j < VALUE_ALL.length; v++, j += VALUE_ALL_STEP) {
		for (let i = 0; i < VALUE_ALL_STEP; i++) {
			let obj = document.getElementById("tableValue_" + (j + i));
			if (null != obj) {
				obj.value = VALUE_ALL[j + i];
			}
		}
	}
}
function setIndexTable() {
	let enableValues = [];
	let enableSteps = [];
	for (let i=0; ; i++) {
		let chkObj = document.getElementById("tableValueCheck_" + i);
		if (chkObj == null) {
			break;
		}
		if (chkObj.checked) {
			let th = 2*Math.PI*(i+1)/PHASE_DIV;
			let valZ = RangeZAmp*Math.sin(3*th);
			let valU = valZ + Math.sin(th);
			enableValues.push(valU);
			enableSteps.push(i);
		}
	}
	VALUE = [];
	for (let j=0; j<VALUE_ALL.length; j+=VALUE_ALL_STEP) {
		for (let i=0; i<enableSteps.length; i++) {
			VALUE.push(VALUE_ALL[j + enableSteps[i]]);
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
		let valZ = RangeZAmp*Math.sin(3*th);
		let valU = valZ + Math.sin(th);
		let valV = valZ + Math.sin(th + 2*Math.PI/3);
		let valW = valZ + Math.sin(th - 2*Math.PI/3);
		setIndex(p, 0, findIndex(enableValues, valU));
		setIndex(p, 1, findIndex(enableValues, valV));
		setIndex(p, 2, findIndex(enableValues, valW));
	}
}
function createIndexTable() {
	setIndexTable();
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
		let idx = getIndex(i);
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
function updateIndexTable() {
	setIndexTable();
	for (let i=0; i<PHASE_DIV; i++) {
		let idx = getIndex(i);
		let objU = document.getElementById("indexU_" + i);
		let objV = document.getElementById("indexV_" + i);
		let objW = document.getElementById("indexW_" + i);
		objU.innerHTML = indexToText(idx.u);
		objV.innerHTML = indexToText(idx.v);
		objW.innerHTML = indexToText(idx.w);
	}
}
function findIndex(enableValues, value) {
	let sign = Math.sign(value);
	value = Math.abs(value);
	let index = 0;
	if (value > enableValues[0]-0.0001) {
		let min = 256;
		for (let i=0; i<enableValues.length; i++) {
			let diff = Math.abs(enableValues[i] - value);
			if (diff < min) {
				min = diff;
				index = i + 1;
			}
		}
	}
	return index * sign;
}
function setIndex(step, phase, index) {
	if (null == index || "" == index || 0 == index) {
		index = INDEX_MASK_ZERO;
	} else {
		index = parseInt(index);
		if (index < 0) {
			index *= -1;
			index--;
			index &= INDEX_MASK_VALUE;
			index |= INDEX_MASK_MINUS;
		} else {
			index--;
			index &= INDEX_MASK_VALUE;
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
function getIndex(step) {
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
function genWave(amp, phase) {
	let idx = getIndex(phase);
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
function calcSpec(amp, normalize) {
	const N = PHASE_DIV*SPEC_OVERLAP;
	const MIN = Math.pow(10, SPEC_LIMIT/20);
	const AMP_D = 1 / (normalize ? MAXD[amp] : 255);
	let wave = [];
	for (let i=0; i<PHASE_DIV; i++) {
		let value = genWave(amp, i);
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
function calcSpecAvg() {
	SPEC_MAX = calcSpec(1, false);
	SPEC_AVG = [];
	for (let i=0; i<SPEC_MAX.length; i++) {
		SPEC_AVG.push(SPEC_MAX[i]);
	}
	for (let a=2; a<64; a++) {
		let s = calcSpec(a, false);
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
function createCode() {
	let str = "/**********************************************************/\r\n";
	str += "#define VALUE_STEP  " + VALUE_STEP + "\r\n";
	str += "#define VALUE_COUNT " + VALUE.length + "\r\n";
	str += "static const VALUE[VALUE_COUNT] = {\r\n";
	for (let j=0,row=0; j<VALUE.length; j+=VALUE_STEP,row++) {
		str += "    ";
		for (let i=0,idx=row*VALUE_STEP; i<VALUE_STEP; i++,idx++) {
			str += VALUE[idx];
			if (idx<VALUE.length-1) {
				str += ",";
			}
		}
		str += "\r\n";
	}
	str += "};\r\n";
	str += "\r\n";
	str += "/**********************************************************/\r\n";
	let indexStep;
	switch (INDEX_BITS) {
	case 4:
	case 5:
		indexStep = 2;
		break;
	case 8:
		indexStep = 3;
		break;
	}
	str += "#define INDEX_COUNT " + INDEX.length + "\r\n";
	str += "#define INDEX_BITS  " + INDEX_BITS + "\r\n";
	str += "#define INDEX_MASK       " + toBin(INDEX_MASK, INDEX_BITS) + "\r\n";
	str += "#define INDEX_MASK_ZERO  " + toBin(INDEX_MASK_ZERO, INDEX_BITS) + "\r\n";
	str += "#define INDEX_MASK_MINUS " + toBin(INDEX_MASK_MINUS, INDEX_BITS) + "\r\n";
	str += "#define INDEX_MASK_VALUE " + toBin(INDEX_MASK_VALUE, INDEX_BITS) + "\r\n";
	str += "static const INDEX[INDEX_COUNT] = {\r\n";
	for (let j=0,row=0; j<INDEX.length; j+=indexStep,row++) {
		str += "    ";
		for (let i=0,idx=row*indexStep; i<indexStep; i++,idx++) {
			str += toHex(INDEX[idx]);
			if (idx<INDEX.length-1) {
				str += ",";
			}
		}
		str += "\r\n";
	}
	str += "};";
	var blob = new Blob([ str ], { "type" : "text/plain" });
	if (window.navigator.msSaveBlob) { 
		window.navigator.msSaveBlob(blob, "test.txt"); 
		window.navigator.msSaveOrOpenBlob(blob, "test.txt"); 
	} else {
		document.getElementById("download").href = window.URL.createObjectURL(blob);
	}
}
function toBin(value, bitCount=8) {
	let str = value.toString(2);
	if (bitCount <= 4) {
		return "0b" + "0000".substring(0, 4 - str.length) + str;
	} else {
		return "0b" + "00000000".substring(0, 8 - str.length) + str;
	}
}
function toHex(value) {
	let str = value.toString(16);
	return "0x" + "00".substring(0, 2 - str.length) + str;
}

/******************************************************************************/
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

/******************************************************************************/
function clearDisp() {
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
	gDrawer.drawLineXY(0, HEIGHT*3/4, WIDTH - 1, HEIGHT*3/4, COLOR_AXIZ_MINOR);
	gDrawer.drawLineXY(0, HEIGHT*1/4, WIDTH - 1, HEIGHT*1/4, COLOR_AXIZ_MINOR);
	for (let i = 0; i <= PHASE_DIV2; i+=2) {
		let x = i * WIDTH / PHASE_DIV2;
		gDrawer.drawStringC(new vec3(x, HEIGHT / 2 + 14), i % PHASE_DIV, 14);
	}
}
function dispWave() {
	let phase = parseInt(x1 * PHASE_DIV2 / WIDTH) % PHASE_DIV;
	let wave = genWave(RangeAmp, phase);

	let ampD = 1 / (EnableNormalize ? MAXD[RangeAmp] : 256);
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
	let valueZ = RangeZAmp*Math.sin(3*th);
	let valueUa = valueZ + Math.sin(th);
	let valueVa = valueZ + Math.sin(th + 2*Math.PI/3);
	let valueWa = valueZ + Math.sin(th - 2*Math.PI/3);
	let ampA = (EnableNormalize ? 1 : (RangeAmp/63)) / MAXA;
	z1 = 0.5 - 0.5 * valueZ * ampA;
	ua1 = 0.5 - 0.5 * valueUa * ampA;
	va1 = 0.5 - 0.5 * valueVa * ampA;
	wa1 = 0.5 - 0.5 * valueWa * ampA;
	z1 *= HEIGHT;
	ua1 *= HEIGHT;
	va1 *= HEIGHT;
	wa1 *= HEIGHT;

	if (EnableZ) {
		gDrawer.drawLineXY(x0, z0, x1, z1, COLOR_Z, 3);
	}
	if (EnableQuantize) {
		if (EnableWU) {
			gDrawer.drawLineXY(x0, wu0, x1, wu1, COLOR_WU, 3);
		}
		if (EnableVW) {
			gDrawer.drawLineXY(x0, vw0, x1, vw1, COLOR_VW, 3);
		}
		if (EnableUV) {
			gDrawer.drawLineXY(x0, uv0, x1, uv1, COLOR_UV, 3);
		}
	} else {
		if (EnableWU) {
			wu1 = wa1 - ua1 + HEIGHT/2;
			gDrawer.drawLineXY(x0, wu0, x1, wu1, COLOR_WQ, 3);
		}
		if (EnableVW) {
			vw1 = va1 - wa1 + HEIGHT/2;
			gDrawer.drawLineXY(x0, vw0, x1, vw1, COLOR_VQ, 3);
		}
		if (EnableUV) {
			uv1 = ua1 - va1 + HEIGHT/2;
			gDrawer.drawLineXY(x0, uv0, x1, uv1, COLOR_UQ, 3);
		}
	}
	if (EnableW) {
		gDrawer.drawLineXY(x0, wa0, x1, wa1, COLOR_WA, 3);
	}
	if (EnableV) {
		gDrawer.drawLineXY(x0, va0, x1, va1, COLOR_VA, 3);
	}
	if (EnableU) {
		gDrawer.drawLineXY(x0, ua0, x1, ua1, COLOR_UA, 3);
	}
	if (EnableQuantize) {
		if (EnableW) {
			gDrawer.drawLineXY(x0, wd0, x1, wd1, COLOR_WQ);
		}
		if (EnableV) {
			gDrawer.drawLineXY(x0, vd0, x1, vd1, COLOR_VQ);
		}
		if (EnableU) {
			gDrawer.drawLineXY(x0, ud0, x1, ud1, COLOR_UQ);
		}
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
function dispSpec() {
	gSpec.clear();
	gSpec.drawLineXY(0, 0, WIDTH - 1, 0, COLOR_AXIZ_MAJOR);
	for (let i = 0; i < -SPEC_LIMIT; i++) {
		let y = -i * HEIGHT_SPEC / SPEC_LIMIT;
		if (0 == i%10) {
			gSpec.drawLineXY(0, y, WIDTH, y, COLOR_AXIZ_MINOR);
		}
	}
	let spec = calcSpec(RangeAmp, EnableNormalize);
	calcSpecAvg();
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
	if (EnableSpecMax) {
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
	if (EnableSpecAvg) {
		let x0 = 0;
		let value0 = SPEC_AVG[0] * HEIGHT_SPEC / SPEC_LIMIT;
		for (let i = 0; i <= SPEC_WIDTH; i++) {
			let x1 = i * X_DELTA;
			let value1 = SPEC_AVG[i] * HEIGHT_SPEC / SPEC_LIMIT;
			gSpec.drawLineXY(x0, value0, x1, value1, COLOR_WQ);
			x0 = x1;
			value0 = value1;
		}
	}
	if (EnableSpec) {
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
	for (let i = 0; i <= SPEC_WIDTH; i+=PHASE_DIV/4) {
		let x = i * X_DELTA;
		gSpec.drawStringC(new vec3(x, 8), "x" + i, 14);
	}
}
