#include <stdio.h>
#include "esp32math.h"
#include "motor.h"
#include "field.h"

constexpr float Fs = 1e+4f;
constexpr float Dt = 1.0f / Fs;

constexpr float R_FC = 1200.0f;
constexpr float OMEGA_FC = 200.0f;
constexpr float THETA_GAIN = 0.7f;

constexpr float I_FC = 25.0f;
constexpr float I_LIM = 100.0f;
constexpr float Kp = 1.0f;
constexpr float Ki = 0.7f;

void
Motor::init() {
	f_target = 0;
	theta_s = 0;
	omega_s = 0;

	esp32_cossin(theta_s - 0.5f * PI, &r_x, &r_y);

	i_i = 0;
	i_stator = 0;
	i_sensor = 0;

#ifdef ENABLE_MOTOR_MODEL
	J = 2e-1f;
	D = 1e-3f;
	K_t = 1;
	theta_r = theta_s - 0.5f * PI;
	omega_r = omega_s;
#endif

	r_fk = 1.0f - esp32_expf(-TAU * R_FC * Dt);
	omega_fk = 1.0f - esp32_expf(-TAU * OMEGA_FC * Dt);
	i_fk = 1.0f - esp32_expf(-TAU * I_FC * Dt);
}

void
Motor::step(float sensor_x, float sensor_y) {
#ifdef ENABLE_MOTOR_MODEL
	{
		/*** 固定子電流 ***/
		float s_x, s_y;
		esp32_cossin(theta_s, &s_x, &s_y);
		s_x *= i_stator;
		s_y *= i_stator;

		/*** 回転子の直交座標 ***/
		esp32_cossin(theta_r, &sensor_x, &sensor_y);

		/*** 発生トルク ***/
		// これは回転磁界ベクトルの位相と回転子機械角の差（負荷角）のサインに比例する式と等価
		float T_e = K_t * (s_y * sensor_x - s_x * sensor_y);

		/*** 加速度 ***/
		// = (電気的発生トルク - 摩擦トルク) / 慣性モーメント
		float acc = (T_e - D * omega_r) / J;
		omega_r += acc * Dt;
		theta_r += omega_r * Dt;
		theta_r = TAU * esp32_frac(theta_r * INV_TAU);
	}
#endif

	/*** 回転子座標・センサ電流取得 ***/
	{
		/*** センサ座標の正規化 ***/
		float iinv = esp32_invroot(sensor_x * sensor_x + sensor_y * sensor_y);
		sensor_x *= iinv;
		sensor_y *= iinv;

		/*** 回転子座標LPF ***/
		r_x += r_fk * (sensor_x - r_x);
		r_y += r_fk * (sensor_y - r_y);

		/*** センサ電流LPF ***/
		i_sensor += i_fk * (esp32_inv(iinv) - i_sensor);
	}

	/*** 位相・速度更新 ***/
	{
		/*** θlpf(回転子位相) ***/
		float theta_lpf = esp32_atan2f(r_y, r_x);
		//uint8_t u = static_cast<uint8_t>(128 + 127 * sensor_x);
		//uint8_t v = static_cast<uint8_t>(128 + 127 * 0.5f * (-sensor_x + 1.732f * sensor_y));
		//phase24_detect(u, v);
		//float theta_lpf = TAU * phase / 24.0f;

		/*** ψ(負荷角) = θs(固定子位相) - θlpf(回転子位相) ***/
		float psi = theta_s - theta_lpf;

		/*** φ(目標負荷角) ***/
		float phi = field_load_angle(i_sensor, omega_s, theta_lpf);

		/*** dx,dy(増分座標) = exp{i(φ(目標負荷角) - ψ(負荷角))} ***/
		float dx, dy;
		esp32_cossin(phi - psi, &dx, &dy);

		/*** dθ(増分位相) ***/
		float d_theta = esp32_atan2f(dy, dx);

		/*** 位相・速度更新 ***/
		theta_s += THETA_GAIN * d_theta;
		theta_s = TAU * esp32_frac(theta_s * INV_TAU);
		omega_s += omega_fk * (d_theta * Fs - omega_s);
	}

	/*** 電流更新 ***/
	{
		/*** fe(周波数誤差) = f_target(目標周波数) - ωs/2pi(固定子周波数) ***/
		float f_e = f_target - omega_s * INV_TAU;

		/*** 電流PI ***/
		float i_t = field_current_gain(i_sensor, omega_s) * f_e;
		float i_d = i_t * Dt;
		i_i += i_d;
		float i = Kp * i_t + Ki * i_i;

		/*** 電流制限 ***/
		int32_t max = static_cast<int32_t>(i > I_LIM);
		int32_t min = static_cast<int32_t>(i < -I_LIM);
		i *= 1 - (max | min);
		i += I_LIM * (max - min);
		i_i -= i_d * (max | min);

		/*** 電流LPF ***/
		i_stator += i_fk * (i - i_stator);
	}
}
