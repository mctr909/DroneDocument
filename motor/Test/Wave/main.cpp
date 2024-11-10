#include <stdio.h>
#include "esp32math.h"
#include "motor24.h"
//#include "motor.h"

#define Fs 10000

int main(int args, char *argv[]) {
	FILE* fp = NULL;
	char fname[256] = { 0 };
	sprintf_s(fname, sizeof(fname), "%s.csv", argv[0]);
	fopen_s(&fp, fname, "w");
	if (NULL == fp) {
		return -1;
	}

	//for (int i = -480; i <= 480; i++) {
	//	float t = i * TAU / 240.0f;
	//	float c = cos(t);
	//	float s = sin(t);
	//	float fv = cos(t + TAU / 3.0f);
	//	uint8_t u = static_cast<uint8_t>(128 + 120 * c);
	//	//uint8_t v = static_cast<uint8_t>(128 + 120 * (-c - 1.732f * s) * 0.5f);
	//	uint8_t v = static_cast<uint8_t>(128 + 120 * fv);
	//	phase24_detect(u, v);
	//	fprintf(fp, "%d,%d,%d\n", u, v, theta_r);
	//}

	//Motor *m1 = new Motor();
	//fprintf(fp, "Hz,I,Sx,Sy,Rx,Ry\n");
	//m1->init();
	//m1->f_target = 50;
	//for (int i = 0; i < Fs; i++) {
	//	// 値の出力
	//	float s_x, s_y;
	//	float r_x, r_y;
	//	esp32_cossin(m1->theta_s, &s_x, &s_y);
	//	esp32_cossin(m1->theta_r, &r_x, &r_y);
	//	s_x *= m1->i_stator;
	//	s_y *= m1->i_stator;
	//	fprintf(fp, "%.1f,%.1f,%.1f,%.1f,%.3f,%.3f\n",
	//		m1->omega_s / TAU,
	//		m1->i_stator,
	//		s_x, s_y,
	//		r_x, r_y
	//	);
	//	if (i >= 0.3f * Fs && i < 0.5f * Fs) {
	//		float trans = 5 * (i - 0.3f * Fs) / Fs;
	//		m1->D = 2e-3f * (1 + 99 * trans);
	//	}
	//	else if (i >= 0.5f * Fs && i < 0.6f * Fs) {
	//		m1->f_target = -20;
	//		m1->D = 2e-2f;
	//	}
	//	else {
	//		m1->D = 1e-3f;
	//	}
	//	m1->step(0, 0);
	//}

	motor24_init();
	for (int i = 0; i < Fs; i++) {
		// 値の出力
		float s_x, s_y;
		float r_x, r_y;
		float th_s = TAU * theta_s / 24.0f;
		esp32_cossin(th_s, &s_x, &s_y);
		esp32_cossin(theta_model, &r_x, &r_y);
		s_x *= 10;
		s_y *= 10;
		fprintf(fp, "%d,%d,%.1f,%.1f,%.3f,%.3f\n",
			omega_s,
			theta_s,
			s_x, s_y,
			r_x, r_y
		);
		motor24_step(0, 0);
	}

	if (NULL != fp) {
		fclose(fp);
	}
	return 0;
}
