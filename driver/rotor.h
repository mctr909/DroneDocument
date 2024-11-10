#ifndef __ROTOR_H__
#define __ROTOR_H__

struct Rotor {
	float _0 = 1.0f;
	float _23 = 0.0f;
	float _31 = 0.0f;
	float _12 = 0.0f;
};

inline float __rotor_atan2(float y, float x) {
	constexpr float PI_2 = 1.5707964f;
	constexpr float PI_4 = 0.7853982f;
	constexpr float TAN_PI_8 = 0.41421357f;

	auto t_range1 = (x*x > y*y) ? 1.0f : 0.0f;
	auto t_range2 = 1.0f - t_range1;
	auto y_range1 = y + t_range1;
	auto x_range2 = x + t_range2;

	auto t_num = y*y_range1*t_range1 + x*x_range2*t_range2;
	auto t_den = y_range1*x_range2;
	auto t = t_num/t_den;
	auto t_sign = std::signbit(t) ? -1.0f : 1.0f;

	auto u = t_sign*t;
	auto u_range1 = (u < TAN_PI_8) ? 1.0f : 0.0f;
	auto u_range2 = 1.0f - u_range1;

	auto v_num = (u - 1.0f)*u_range2;
	auto v_den = u + 1.0f;
	auto v = v_num/v_den;
	v += u*u_range1;

	// $\tan^{-1}{v}\text{の[5,4]パデ近似}$
	auto v2 = v*v;
	auto a_den = (225.0f*v2 + 1050.0f)*v2 + 945.0f;
	auto a_num = ((64.0f*v2 + 735.0f)*v2 + 945.0f)*v;
	auto a = a_num/a_den;

	a -= PI_2*t_range1;
	a += PI_4*u_range2;
	a *= (t_range1 - t_range2)*t_sign;
	a += std::signbit(y) ? -PI_2 : PI_2;

	return a;
}

/**
 * @param r $R=e^{B\theta}$
 * @param b_23 $B_{2,3}$
 * @param b_31 $B_{3,1}$
 * @param b_12 $B_{1,2}$
 * @param theta $\theta$ 角速度からローター作る際は$\theta = \frac{\Delta t}{2}$
 */
inline void rotor_exp(Rotor &r, float b_23, float b_31, float b_12, float theta=1) {
	/*
	$$\begin{aligned}
		&\text{指数写像} \\
		&B = B_{2,3}e_2e_3 + B_{3,1}e_3e_1 + B_{1,2}e_1e_2 \\
		&B^2 = -\left(B_{2,3}^2 + B_{3,1}^2 + B_{1,2}^2\right) \\
		&\quad\left(e_1,e_2,e_3\text{から3面を作れ、交差項において必ず基底1つを共有するため反交換関係により交差項が消える}\right) \\
		&\omega^2 = B_{2,3}^2 + B_{3,1}^2 + B_{1,2}^2 \\
		&\therefore B^2 = -\omega^2 \Longrightarrow \mathrm{\widehat{B}} = \frac{B}{\omega}\quad\left(\mathrm{\widehat{B}}^2 = -1\right) \\
		&\therefore R = e^{\textstyle{\mathrm{\widehat{B}}x}} = \cos{x} + \mathrm{\widehat{B}}\sin{x}\quad\left(x = \omega\theta\right) 
	\end{aligned}$$
	$$\begin{aligned}
		&x = \omega\theta,\mathrm{\widehat{B}} = \frac{B}{\omega}\text{なので} \\
		&\textstyle\mathrm{\widehat{B}}\sin{x} \Longrightarrow B\theta\cfrac{\sin{x}}{x}\quad\left(x\text{が括りだせ}\omega\text{による正規化が不要になる}\right)
	\end{aligned}$$
	*/
	/*
	$$\begin{aligned}
		&\text{ケイリー変換と}\tan{\frac{x}{2}}\text{の[5,4]パデ近似} \\
		&e^{ix}=\frac{1+it}{1-it}\quad\left(t=\tan{\frac{x}{2}}\approx\frac{x}{30}\frac{x^4 - 420x^2 + 15120}{x^4 - 112x^2 + 1008}\right) \\
		&\sin{x}\text{の項については分子の}x\text{の次数を1つ落として}\frac{\sin{x}}{x}\text{へ変形する} \\
	\end{aligned}$$
	*/
	auto omega2 = b_23*b_23 + b_31*b_31 + b_12*b_12;
	auto x2 = omega2*theta*theta;
	auto d = (((( x2 +   60.0f)*x2 +   5040.0f)*x2 +   403200.0f)*x2 +  25401600.0f)*x2 + 914457600.0f;
	auto c = ((((-x2 + 1740.0f)*x2 - 408240.0f)*x2 + 25804800.0f)*x2 - 431827200.0f)*x2 + 914457600.0f;
	auto s = (((( x2 -  532.0f)*x2 +  63168.0f)*x2 -  2116800.0f)*x2 +  15240960.0f)*theta;
	s *= 60.0f;
	d = 1.0f/d;
	c *= d;
	s *= d;
	r._0 = c;
	r._23 = s*b_23;
	r._31 = s*b_31;
	r._12 = s*b_12;
}

/**
 * @param b_23 $B_{2,3}$
 * @param b_31 $B_{3,1}$
 * @param b_12 $B_{1,2}$
 * @param r $R$
 */
inline void rotor_ln(float &b_23, float &b_31, float &b_12, const Rotor &r) {
	/*
	$$\begin{aligned}
		&\text{対数写像} \\
		&R = r_0 + r_1e_2e_3 + r_2e_3e_1 + r_3e_1e_2 \\
		&B = R - r_0 \\
		&r_b = \|B\| \\
		&\mathrm{\widehat{B}} = \frac{B}{r_b}\quad\left(\mathrm{\widehat{B}}^2 = -1\right) \\
		&\therefore \ln{R} = \mathrm{\widehat{B}}\mathrm{atan2}{(r_b,r_0)}
	\end{aligned}$$
	*/
	auto reverse = r._0 < 0.0f ? -1.0f : 1.0f;
	auto r_0 = reverse*r._0;
	auto r_23 = reverse*r._23;
	auto r_31 = reverse*r._31;
	auto r_12 = reverse*r._12;
	auto r_b2 = r_23*r_23 + r_31*r_31 + r_12*r_12;
	float k;
	if (r_b2 >= 1e-9f) {
		auto r_b = sqrtf(r_b2);
		k = __rotor_atan2(r_b, r_0) / r_b;
	} else {
		/* $\sin^{-1}({r_b})/r_b\text{の近似}$ */
		k = 1.0f + r_b2*(1.0f/6.0f);
	}
	b_23 = k*r_23;
	b_31 = k*r_31;
	b_12 = k*r_12;
}

/**
 * @param r1 $R_{n+1} = \Delta R R_n$
 * @param dr $\Delta R$
 * @param r0 $R_n$
 */
inline void rotor_mul(Rotor &r1, const Rotor &dr, const Rotor &r0) {
	/* $R_{n+1} = \Delta R R_n$ */
	auto _0  = dr._0*r0._0  - dr._23*r0._23 - dr._31*r0._31 - dr._12*r0._12;
	auto _23 = dr._0*r0._23 + dr._23*r0._0  + dr._31*r0._12 - dr._12*r0._31;
	auto _31 = dr._0*r0._31 - dr._23*r0._12 + dr._31*r0._0  + dr._12*r0._23;
	auto _12 = dr._0*r0._12 + dr._23*r0._31 - dr._31*r0._23 + dr._12*r0._0;
	/* $1/\|R_{n+1}\|\text{の近似}$ */
	auto norm2 = _0*_0 + _23*_23 + _31*_31 + _12*_12;
	auto inv_norm = 1.5f - 0.5f*norm2;
	inv_norm *= 1.5f - 0.5f*norm2*inv_norm*inv_norm;
	/* 正規化 */
	r1._0  = _0*inv_norm;
	r1._23 = _23*inv_norm;
	r1._31 = _31*inv_norm;
	r1._12 = _12*inv_norm;
}

/**
 * @param dr $\Delta R = R_b\widetilde{R_a}$
 * @param rb $R_b$
 * @param ra $R_a$
 */
inline void rotor_delta(Rotor &dr, const Rotor &rb, const Rotor &ra) {
	/* $\Delta R = R_b\widetilde{R_a}$ */
	auto _0  =  rb._0*ra._0  + rb._23*ra._23 + rb._31*ra._31 + rb._12*ra._12;
	auto _23 = -rb._0*ra._23 + rb._23*ra._0  - rb._31*ra._12 + rb._12*ra._31;
	auto _31 = -rb._0*ra._31 + rb._23*ra._12 + rb._31*ra._0  - rb._12*ra._23;
	auto _12 = -rb._0*ra._12 - rb._23*ra._31 + rb._31*ra._23 + rb._12*ra._0;
	/* $1/\|\Delta R\|\text{の近似}$ */
	auto norm2 = _0*_0 + _23*_23 + _31*_31 + _12*_12;
	auto inv_norm = 1.5f - 0.5f*norm2;
	inv_norm *= 1.5f - 0.5f*norm2*inv_norm*inv_norm;
	/* 正規化 */
	dr._0  = _0*inv_norm;
	dr._23 = _23*inv_norm;
	dr._31 = _31*inv_norm;
	dr._12 = _12*inv_norm;
}

/**
 * @param r $R=e^{t\ln{\Delta R}}R_a\quad\left(\Delta R = R_b\widetilde{R_a}\right)$
 * @param ra $R_a$
 * @param rb $R_b$
 * @param t
 */
inline void slerp(Rotor &r, const Rotor &ra, const Rotor &rb, float t) {
	Rotor r_temp;
	float b_23, b_31, b_12;
	rotor_delta(r_temp, rb, ra);
	rotor_ln(b_23, b_31, b_12, r_temp);
	rotor_exp(r_temp, b_23, b_31, b_12, t);
	rotor_mul(r, r_temp, ra);
}

/**
 * @param m44 4x4行列(列優先)
 * @param r ローター $R$
 * $e_ie_j+e_je_i=2\mathrm{diag}(-1,-1,-1)$
 * $R=r_0+r_1e_2e_3+r_2e_3e_1+r_3e_1e_2$
 */
inline void rotor_toM44(float *m44, const Rotor &r) {
	auto r_0 = r._0;
	auto r_23 = r._23;
	auto r_31 = r._31;
	auto r_12 = r._12;
	auto d_23 = r_23*2.0f,
		d_31 = r_31*2.0f,
		d_12 = r_12*2.0f;
	// 対角成分
	auto r2_23 = r_23*d_23,
		r2_31 = r_31*d_31,
		r2_12 = r_12*d_12;
	// 反対称成分
	auto r_0_23 = r_0*d_23,
		r_0_31 = r_0*d_31,
		r_0_12 = r_0*d_12;
	// 対称成分
	auto r_12_23 = d_12*r_23,
		r_12_31 = d_12*r_31,
		r_23_31 = r_23*d_31;
	// 4x4行列に変換
	// $R(e_1)\widetilde{R}$
	m44[0]  = 1.0f - r2_31 - r2_12;
	m44[1]  = r_23_31 - r_0_12;
	m44[2]  = r_12_23 + r_0_31;
	m44[3]  = 0.0f;
	// $R(e_2)\widetilde{R}$
	m44[4]  = r_23_31 + r_0_12;
	m44[5]  = 1.0f - r2_23 - r2_12;
	m44[6]  = r_12_31 - r_0_23;
	m44[7]  = 0.0f;
	// $R(e_3)\widetilde{R}$
	m44[8]  = r_12_23 - r_0_31;
	m44[9]  = r_12_31 + r_0_23;
	m44[10] = 1.0f - r2_23 - r2_31;
	m44[11] = 0.0f;
	//
	m44[12] = 0.0f;
	m44[13] = 0.0f;
	m44[14] = 0.0f;
	m44[15] = 1.0f;
}
#endif
