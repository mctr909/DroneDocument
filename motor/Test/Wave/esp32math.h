#ifndef __ESP32_MATH__
#define __ESP32_MATH__

#include <stdint.h>
#include <bit>

#if defined(_MSC_VER)
	#define INLINE __forceinline
#elif defined(__GNUC__) || defined(__clang__)
	#define INLINE inline __attribute__((always_inline))
#else
	#define INLINE inline
#endif

constexpr float PI = 3.1415927f;
constexpr float TAU = 2.0f * PI;
constexpr float INV_TAU = 1.0f / TAU;

INLINE float
esp32_inv(float x) {
	// 1/x を近似するビットトリック
	constexpr uint32_t magic = 0x7EF127EAu;
	uint32_t i = std::bit_cast<uint32_t>(x);
	i = magic - i;
	float t = std::bit_cast<float>(i);
	// ニュートン・ラフソン法による精度向上
	t *= 2.0f - x * t;
	t *= 2.0f - x * t;
	return t;
}

INLINE float
esp32_invroot(float x) {
	// 1/sqrt(x) を近似するビットトリック
	constexpr uint32_t magic = 0x5F3759DFu;
	uint32_t i = std::bit_cast<uint32_t>(x);
	i >>= 1;
	i = magic - i;
	float t = std::bit_cast<float>(i);
	float hx = 0.5f * x;
	// ニュートン・ラフソン法による精度向上
	t *= 1.5f - (hx * t * t);
	t *= 1.5f - (hx * t * t);
	return t;
}

INLINE float
esp32_frac(float x) {
	int32_t s = std::bit_cast<uint32_t>(x) >> 31;
	s *= static_cast<int32_t>(1.0f - x);
	x += s;
	x -= static_cast<int32_t>(x);
	return x;
}

INLINE float
esp32_signedfrac(float x) {
	int32_t s = std::bit_cast<uint32_t>(x) >> 31;
	s *= static_cast<int32_t>(-x);
	x += s;
	x -= static_cast<int32_t>(x);
	return x;
}

INLINE void
esp32_cossin(float rad, float *c, float *s) {
	/*** 折り畳み ***/
	int32_t a, b;
	{
		// radを[0, 1)の範囲に正規化
		rad = esp32_frac(rad * INV_TAU);

		// 位相シフト量(x2)と出力値の符号(a, b)を求める
		int32_t x1, x2;
		a = static_cast<int32_t>(rad + 0.25f);
		b = static_cast<int32_t>(rad + 0.75f);
		x1 = b - a;
		x2 = static_cast<int32_t>(rad + 0.5f) << 1;
		a = 1 - (x1 << 1);
		b = 1 - x2;
		x2 -= x1;

		// 位相シフトを行いradに戻す
		rad *= b;
		rad += 0.5f * x2;
		rad *= TAU;
	}

	/*** パデ近似 ***/
	//             1 - CN2*rad^2 + CN4*rad^4
	// cos(rad) ~ ---------------------------
	//             1 + CD2*rad^2 + CD4*rad^4
	constexpr float C0 = 15120.0f;
	constexpr float CN2 = 6900.0f / C0;
	constexpr float CN4 = 313.0f / C0;
	constexpr float CD2 = 660.0f / C0;
	constexpr float CD4 = 13.0f / C0;

	//             1 - SN2*rad^2
	// sin(rad) ~ --------------------------- * rad
	//             1 + SD2*rad^2 + SD4*rad^4
	constexpr float S0 = 5880.0f;
	constexpr float SN2 = 620.0f / S0;
	constexpr float SD2 = 360.0f / S0;
	constexpr float SD4 = 11.0f / S0;

	*s = rad;

	float cos_num;
	float cos_den;
	float sin_num;
	float sin_den;

	rad *= rad;
	cos_num = 1.0f - CN2 * rad;
	cos_den = 1.0f + CD2 * rad;
	sin_num = 1.0f - SN2 * rad;
	sin_den = 1.0f + SD2 * rad;

	rad *= rad;
	cos_num += CN4 * rad;
	cos_den += CD4 * rad;
	sin_den += SD4 * rad;

	cos_num *= a;
	sin_num *= a;
	sin_num *= b;
	sin_num *= *s;

	*c = cos_num * esp32_inv(cos_den);
	*s = sin_num * esp32_inv(sin_den);
}

INLINE float
esp32_atan2f(float y, float x) {
	float den;
	float num;
	float ofs;

	/*** 折り畳み ***/
	{
		int32_t a, b;

		den = esp32_invroot(x * x + y * y);
		x *= den;
		y *= den;

		b = static_cast<int32_t>(x > -0.707106781f);
		b &= static_cast<int32_t>(x < 0.707106781f);
		a = 1 - b;

		/*** num = y / x ***/
		den = a * x + b;
		num = a * y;
		num *= esp32_inv(den);

		/*** num = -x / y ***/
		den = b * y + a;
		num -= b * x;
		num *= esp32_inv(den);

		/*** ofs = {-π/2(num>=0), +π/2(num<0)} ***/
		a = std::bit_cast<uint32_t>(num) >> 30;
		a &= 2;
		a -= 1;
		a *= b;
		ofs = 0.5f * PI * a;

		/*** ofs -= {0(x>=0), -π(x<0,y>=0), +π(x<0,y<0)} ***/
		a = std::bit_cast<uint32_t>(x) >> 31;
		b = std::bit_cast<uint32_t>(y) >> 30;
		b &= 2;
		b -= 1;
		b *= a;
		ofs -= PI * b;

		x = num;
	}

	/*** パデ近似 ***/
	//            1 + N2*x^2 + N4*x^4 + N6*x^6
	// atan(x) ~ ------------------------------ * x
	//            1 + D2*x^2 + D4*x^4 + D6*x^6
	constexpr float N0 = 15015.0f;
	constexpr float N2 = 19250.0f / N0;
	constexpr float N4 = 5943.0f / N0;
	constexpr float N6 = 256.0f / N0;
	constexpr float D2 = 24255.0f / N0;
	constexpr float D4 = 11025.0f / N0;
	constexpr float D6 = 1225.0f / N0;
	y = x;
	x *= x;
	den = 1.0f + D2 * x;
	num = 1.0f + N2 * x;
	x *= x;
	den += D4 * x;
	num += N4 * x;
	x *= x;
	den += D6 * x;
	num += N6 * x;
	num *= y;

	num *= esp32_inv(den);
	num += ofs;
	return num;
}

INLINE float
esp32_expf(float x) {
	/*** パデ近似 ***/
	//           1 + N1*x + N2*x^2 + N3*x^3 + N4*x^4
	// exp(x) ~ -----------------------------------------
	//           1 - N1*x + N2*x^2 - N3*x^3 + N4*x^4
	constexpr float N0 = 1680.0f;
	constexpr float N1 = 840.0f / N0;
	constexpr float N2 = 180.0f / N0;
	constexpr float N3 = 20.0f / N0;
	constexpr float N4 = 1.0f / N0;

	float den;
	float num;
	float x1 = x;
	den = 1.0f - N1 * x;
	num = 1.0f + N1 * x;
	x *= x1;
	den += N2 * x;
	num += N2 * x;
	x *= x1;
	den -= N3 * x;
	num += N3 * x;
	x *= x1;
	den += N4 * x;
	num += N4 * x;

	num *= esp32_inv(den);
	return num;
}
#endif __ESP32_MATH__
