//#ifndef __PHASE24_H__
//#define __PHASE24_H__

/******************************************************************************/
const NEUTRAL = 103;

/******************************************************************************/
let u_del, u_adv;
let v_del, v_adv;
let w_del, w_adv;

/******************************************************************************/
function phase24_detect(sense_u, sense_v) {
	/* u相,v相,w相の各相に対して±1/48周期ずれた相を作る
	 * del: 1/48周期遅れた相
	 * adv: 1/48周期進んだ相 */
	//char u_del, u_adv;
	//char v_del, v_adv;
	//char w_del, w_adv;
	{
		/* オーバーフロー対策のため範囲(0-128-255)を(64-128-191)に変換
		 * u相,v相からw相を得る */
		let wave_u, wave_v, wave_w;
		wave_u = sense_u;
		wave_u >>= 1;
		wave_v = sense_v;
		wave_v >>= 1;
		wave_w = 255 - wave_u;
		wave_w -= wave_v;
		wave_v += 64;
		wave_u += 64;

		let div16, div16x3;

		// u_del = u - 3/16*v
		// w_adv = w - 3/16*v
		div16 = wave_v;
		div16 >>= 2;
		div16x3 = div16;
		div16 >>= 2;
		div16x3 -= div16;
		u_del = wave_u - div16x3;
		w_adv = wave_w - div16x3;

		// v_del = v - 3/16*w
		// u_adv = u - 3/16*w
		div16 = wave_w;
		div16 >>= 2;
		div16x3 = div16;
		div16 >>= 2;
		div16x3 -= div16;
		v_del = wave_v - div16x3;
		u_adv = wave_u - div16x3;

		// w_del = w - 3/16*u
		// v_adv = v - 3/16*u
		div16 = wave_u;
		div16 >>= 2;
		div16x3 = div16;
		div16 >>= 2;
		div16x3 -= div16;
		w_del = wave_w - div16x3;
		v_adv = wave_v - div16x3;
	}

	/* 1/24周期単位の位相を得る */
	let detected_phase;
	if (NEUTRAL < u_del) {
		if (u_adv <= NEUTRAL) {
			detected_phase = 12;
		}
		if (u_adv < v_adv) {
			detected_phase = 1;
		}
	} else {
		if (NEUTRAL < u_adv) {
			detected_phase = 0;
		}
		if (v_adv <= u_adv) {
			detected_phase = 13;
		}
	}
	if (NEUTRAL < v_del) {
		if (v_adv <= NEUTRAL) {
			detected_phase = 4;
		}
		if (v_adv < w_adv) {
			detected_phase = 17;
		}
	} else {
		if (NEUTRAL < v_adv) {
			detected_phase = 16;
		}
		if (w_adv <= v_adv) {
			detected_phase = 5;
		}
	}
	if (NEUTRAL < w_del) {
		if (w_adv <= NEUTRAL) {
			detected_phase = 20;
		}
		if (w_adv < u_adv) {
			detected_phase = 9;
		}
	} else {
		if (NEUTRAL < w_adv) {
			detected_phase = 8;
		}
		if (u_adv <= w_adv) {
			detected_phase = 21;
		}
	}
	if (u_del < w_del) {
		if (NEUTRAL < u_adv) {
			detected_phase = 11;
		}
		if (w_adv < u_adv) {
			detected_phase = 22;
		}
	} else {
		if (u_adv <= NEUTRAL) {
			detected_phase = 23;
		}
		if (u_adv <= w_adv) {
			detected_phase = 10;
		}
	}
	if (v_del < u_del) {
		if (NEUTRAL < v_adv) {
			detected_phase = 3;
		}
		if (u_adv < v_adv) {
			detected_phase = 14;
		}
	} else {
		if (v_adv <= NEUTRAL) {
			detected_phase = 15;
		}
		if (v_adv <= u_adv) {
			detected_phase = 2;
		}
	}
	if (w_del < v_del) {
		if (NEUTRAL < w_adv) {
			detected_phase = 19;
		}
		if (v_adv < w_adv) {
			detected_phase = 6;
		}
	} else {
		if (w_adv <= NEUTRAL) {
			detected_phase = 7;
		}
		if (w_adv <= v_adv) {
			detected_phase = 18;
		}
	}

	return detected_phase;
}

//#endif /* __PHASE24_H__ */
