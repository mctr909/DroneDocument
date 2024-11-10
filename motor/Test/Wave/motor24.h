#ifndef __MOTOR24_H__
#define __MOTOR24_H__
#include <stdint.h>
#include "phase24.h"
#include "esp32math.h"

#define ENABLE_MOTOR_MODEL

inline void
motor24_init() {
	theta_s = 0;
	omega_s = 0;
	theta_model = -6;
	omega_model = 0;
}

inline void
motor24_step(uint8_t adc_u, uint8_t adc_v) {
#ifdef ENABLE_MOTOR_MODEL
	{
		/*** 固定子電流 ***/
		float s_x, s_y;
		float theta = TAU * theta_s / 24.0f;
		esp32_cossin(theta, &s_x, &s_y);
		s_x *= 100.0f;
		s_y *= 100.0f;

		/*** 回転子の直交座標 ***/
		float r_x, r_y;
		esp32_cossin(theta_model, &r_x, &r_y);

		/*** 発生トルク ***/
		// これは回転磁界ベクトルの位相と回転子機械角の差（負荷角）のサインに比例する式と等価
		constexpr float Fs = 1e+4f;
		constexpr float Dt = 1.0f / Fs;
		constexpr float J = 2e-1f;
		constexpr float D = 1e-3f;
		constexpr float K_t = 1;
		float T_e = K_t * (s_y * r_x - s_x * r_y);

		/*** 加速度 ***/
		// = (電気的発生トルク - 摩擦トルク) / 慣性モーメント
		float acc = (T_e - D * omega_model) / J;
		omega_model += acc * Dt;
		theta_model += omega_model * Dt;
		theta_model = TAU * esp32_frac(theta_model * INV_TAU);

		r_y = 0.5f * (-r_x - 1.732f * r_y);
		adc_u = static_cast<uint8_t>(128 + 120 * r_x);
		adc_v = static_cast<uint8_t>(128 + 120 * r_y);
	}
#endif
	/*** 位相・速度更新 ***/
	{
		/*** θr(回転子位相) ***/
		phase24_detect(adc_u, adc_v);

		/*** ψ(負荷角) = θs(固定子位相) - θr(回転子位相) ***/
		psi = theta_s - theta_r;

		/*** φ(目標負荷角) ***/
		phi = 12;

		/*** dθ(増分位相) = φ(目標負荷角) - ψ(負荷角) ***/
		d_theta = phi - psi;
		WREG = d_theta >= 12;
		WREG = -WREG;
		WREG &= 24;
		d_theta -= WREG;
		WREG = d_theta < -12;
		WREG = -WREG;
		WREG &= 24;
		d_theta += WREG;

		/*** 固定子位相更新 ***/
		theta_s += d_theta;
		WREG = theta_s >= 12;
		WREG = -WREG;
		WREG &= 12;
		theta_s -= WREG;
		WREG = theta_s < -12;
		WREG = -WREG;
		WREG &= 24;
		theta_s += WREG;
	}
}

#endif __MOTOR24_H__
