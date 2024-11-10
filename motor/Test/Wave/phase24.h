#ifndef __PHASE24_H__
#define __PHASE24_H__
#include "registers.h"

inline void
phase24_detect(uint8_t adc_u, uint8_t adc_v) {
	const uint8_t NEUTRAL = 106;

	/* u‘Š,v‘Š,w‘Š‚ÌŠe‘Š‚É‘Î‚µ‚Ä}1/48ŽüŠú‚¸‚ê‚½‘Š‚ðì‚é
	 * del: 1/48ŽüŠú’x‚ê‚½‘Š
	 * adv: 1/48ŽüŠúi‚ñ‚¾‘Š */
	{
		/* 3/4u+36 */
		WREG = adc_u;
		WREG >>= 1;
		WREG >>= 1;
		adc_u >>= 1;
		WREG += adc_u;
		WREG += 36;
		wave_u = WREG;

		/* 3/4v+36 */
		WREG = adc_v;
		WREG >>= 1;
		WREG >>= 1;
		adc_v >>= 1;
		WREG += adc_v;
		WREG += 36;
		wave_v = WREG;

		/* u‘Š‚Æv‘Š‚©‚çw‘Š‚ð“¾‚é */
		WREG = wave_u + 118;
		WREG = 255 - WREG;
		WREG -= wave_v;
		wave_w = WREG;

		// u_del = u - 3/16*v
		// w_adv = w - 3/16*v
		WREG = wave_v;
		WREG >>= 1;
		WREG >>= 1;
		div16x3 = WREG;
		WREG >>= 1;
		WREG >>= 1;
		div16x3 -= WREG;
		u_del = wave_u - div16x3;
		w_adv = wave_w - div16x3;

		// v_del = v - 3/16*w
		// u_adv = u - 3/16*w
		WREG = wave_w;
		WREG >>= 1;
		WREG >>= 1;
		div16x3 = WREG;
		WREG >>= 1;
		WREG >>= 1;
		div16x3 -= WREG;
		v_del = wave_v - div16x3;
		u_adv = wave_u - div16x3;

		// w_del = w - 3/16*u
		// v_adv = v - 3/16*u
		WREG = wave_u;
		WREG >>= 1;
		WREG >>= 1;
		div16x3 = WREG;
		WREG >>= 1;
		WREG >>= 1;
		div16x3 -= WREG;
		w_del = wave_w - div16x3;
		v_adv = wave_v - div16x3;
	}

	/* 1/24ŽüŠú’PˆÊ‚ÌˆÊ‘Š‚ð“¾‚é */
	{
		WREG = u_adv > w_adv;   WREG = -WREG; uwp = WREG; uwn = WREG; uwn ^= 0xFF;
		WREG = v_adv > u_adv;   WREG = -WREG; vup = WREG; vun = WREG; vun ^= 0xFF;
		WREG = w_adv > v_adv;   WREG = -WREG; wvp = WREG; wvn = WREG; wvn ^= 0xFF;
		WREG = u_adv > NEUTRAL; WREG = -WREG; unp = WREG; unn = WREG; unn ^= 0xFF;
		WREG = v_adv > NEUTRAL; WREG = -WREG; vnp = WREG; vnn = WREG; vnn ^= 0xFF;
		WREG = w_adv > NEUTRAL; WREG = -WREG; wnp = WREG; wnn = WREG; wnn ^= 0xFF;

		theta_r = 0;

		if (NEUTRAL < u_del) {
			WREG = vup & 1;
			theta_r |= WREG;
			WREG = unn & 244;
			theta_r |= WREG;
		}
		else {
			WREG = unp & 0;
			theta_r |= WREG;
			WREG = vun & 245;
			theta_r |= WREG;
		}

		if (NEUTRAL < v_del) {
			WREG = wvp & 249;
			theta_r |= WREG;
			WREG = vnn & 4;
			theta_r |= WREG;
		}
		else {
			WREG = vnp & 248;
			theta_r |= WREG;
			WREG = wvn & 5;
			theta_r |= WREG;
		}

		if (NEUTRAL < w_del) {
			WREG = uwp & 9;
			theta_r |= WREG;
			WREG = wnn & 252;
			theta_r |= WREG;
		}
		else {
			WREG = wnp & 8;
			theta_r |= WREG;
			WREG = uwn & 253;
			theta_r |= WREG;
		}

		if (u_del < w_del) {
			uwp &= 254;
			unp &= 11;
			theta_r |= uwp;
			theta_r |= unp;
		}
		else {
			uwn &= 10;
			unn &= 255;
			theta_r |= uwn;
			theta_r |= unn;
		}

		if (v_del < u_del) {
			vup &= 246;
			vnp &= 3;
			theta_r |= vup;
			theta_r |= vnp;
		}
		else {
			vun &= 2;
			vnn &= 247;
			theta_r |= vun;
			theta_r |= vnn;
		}

		if (w_del < v_del) {
			wvp &= 6;
			wnp &= 251;
			theta_r |= wvp;
			theta_r |= wnp;
		}
		else {
			wvn &= 250;
			wnn &= 7;
			theta_r |= wvn;
			theta_r |= wnn;
		}
	}
}

#endif __PHASE24_H__
