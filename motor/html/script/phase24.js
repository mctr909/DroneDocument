//#ifndef __PHASE24_H__
//#define __PHASE24_H__

/******************************************************************************/
let u_del, u_adv;
let v_del, v_adv;
let w_del, w_adv;

/******************************************************************************/
function phase24_detect(sense_u, sense_v) {
	const NEUTRAL = 103;

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
	let phase = 0;
	{
		let uw = 0x80 - (u_adv > w_adv);
		let vu = 0x80 - (v_adv > u_adv);
		let wv = 0x80 - (w_adv > v_adv);
		let un = 0x80 - (u_adv > NEUTRAL);
		let vn = 0x80 - (v_adv > NEUTRAL);
		let wn = 0x80 - (w_adv > NEUTRAL);
		let dd, nn;

		dd = 0x80 - (NEUTRAL < u_del);
		nn = ~un;
		phase |= dd&vu&1;
		phase |= dd&nn&12;
		phase |= ~(dd|vu)&13;

		dd = 0x80 - (NEUTRAL < v_del);
		nn = ~vn;
		phase |= dd&nn&4;
		phase |= dd&wv&17;
		phase |= ~(dd|wv)&5;
		phase |= ~(dd|nn)&16;

		dd = 0x80 - (NEUTRAL < w_del);
		nn = ~wn;
		phase |= dd&uw&9;
		phase |= dd&nn&20;
		phase |= ~(dd|nn)&8;
		phase |= ~(dd|uw)&21;

		dd = 0x80 - (u_del < w_del);
		phase |= dd&un&11;
		phase |= dd&uw&22;
		phase |= ~(dd|uw)&10;
		phase |= ~(dd|un)&23;

		dd = 0x80 - (v_del < u_del);
		phase |= dd&vn&3;
		phase |= dd&vu&14;
		phase |= ~(dd|vu)&2;
		phase |= ~(dd|vn)&15;

		dd = 0x80 - (w_del < v_del);
		phase |= dd&wv&6;
		phase |= dd&wn&19;
		phase |= ~(dd|wn)&7;
		phase |= ~(dd|wv)&18;
	}
	return phase;
}

//#endif /* __PHASE24_H__ */
