using System;

namespace Motor {
	public class Pwm {
		private const double Threshold = 0.63212;

		private readonly double dt;
		private readonly double deadtime_fk;
		private readonly double sample_delaytime_fk;
		private readonly double center_delta;
		private readonly double diffusion_delta;
		private readonly double diffusion_width;

		private double c = 0;
		private double d = 0;

		private double f_up = 0;
		private double f_un = 0;
		private double f_vp = 0;
		private double f_vn = 0;
		private double f_wp = 0;
		private double f_wn = 0;
		private double f_su = 0;
		private double f_sv = 0;
		private double f_sw = 0;

		public int up = 0;
		public int un = 0;
		public int vp = 0;
		public int vn = 0;
		public int wp = 0;
		public int wn = 0;

		public bool su = false;
		public bool sv = false;
		public bool sw = false;

		public Pwm(double center_freq, double diffusion_freq, double deadtime, double sample_delaytime, double fs) {
			dt = 1 / fs;
			deadtime_fk = 1 - Math.Exp(-dt / deadtime);
			sample_delaytime_fk = 1 - Math.Exp(-dt / sample_delaytime);
			center_delta = center_freq * dt;
			diffusion_delta = diffusion_freq * dt;
			diffusion_width = 0.1 * center_freq;
		}

		public void Step(double i, double theta) {
			{
				d += diffusion_delta;
				d -= (int)d;
				var dfreq = diffusion_width * Math.Sin(2*Math.PI*d);
				c += center_delta + dfreq * dt;
				c -= (int)c;
			}

			bool u, v, w;
			{
				const double AMP = 1.1547;
				i *= AMP;
				var z = Math.Cos(3*theta)/6;
				var i_u = i*(Math.Cos(theta) - z);
				var i_v = i*(Math.Cos(theta + 2*Math.PI/3) - z);
				var i_w = i*(Math.Cos(theta - 2*Math.PI/3) - z);
				var c2 = 2 * c - 1;
				u = i_u > c2;
				v = i_v > c2;
				w = i_w > c2;
			}

			{
				var b_up = v && !w ? 1 : 0;
				var b_un = !v &&  w ? 1 : 0;
				var b_vp = w && !u ? 1 : 0;
				var b_vn = !w &&  u ? 1 : 0;
				var b_wp = u && !v ? 1 : 0;
				var b_wn = !u &&  v ? 1 : 0;
				f_up += deadtime_fk * (b_up - f_up);
				f_un += deadtime_fk * (b_un - f_un);
				f_vp += deadtime_fk * (b_vp - f_vp);
				f_vn += deadtime_fk * (b_vn - f_vn);
				f_wp += deadtime_fk * (b_wp - f_wp);
				f_wn += deadtime_fk * (b_wn - f_wn);
				up = f_up >= Threshold ? 1 : 0;
				un = f_un >= Threshold ? 1 : 0;
				vp = f_vp >= Threshold ? 1 : 0;
				vn = f_vn >= Threshold ? 1 : 0;
				wp = f_wp >= Threshold ? 1 : 0;
				wn = f_wn >= Threshold ? 1 : 0;
				f_up *= b_up;
				f_un *= b_un;
				f_vp *= b_vp;
				f_vn *= b_vn;
				f_wp *= b_wp;
				f_wn *= b_wn;
			}

			{
				var b_su = (up == 0 && un == 0) ? 1 : 0;
				var b_sv = (vp == 0 && vn == 0) ? 1 : 0;
				var b_sw = (wp == 0 && wn == 0) ? 1 : 0;
				f_su += sample_delaytime_fk * (b_su - f_su);
				f_sv += sample_delaytime_fk * (b_sv - f_sv);
				f_sw += sample_delaytime_fk * (b_sw - f_sw);
				su = f_su >= Threshold;
				sv = f_sv >= Threshold;
				sw = f_sw >= Threshold;
				f_su *= su ? 0 : 1;
				f_sv *= sv ? 0 : 1;
				f_sw *= sw ? 0 : 1;
			}
		}

		private double sqr(double theta) {
			var d = theta/(2*Math.PI);

			int n;
			if (d < 0) {
				n = (int)(1-d);
			} else if (theta > 1) {
				n = -(int)d;
			} else {
				n = 0;
			}
			d += n;

			if (d < 0.25) {
				return 1;
			} else if (d < 0.75) {
				return -1;
			} else {
				return 1;
			}
		}

		private double step24(double theta) {
			var d = theta / (2*Math.PI);
			d = 2*Math.PI*(int)(24*d - 0.5)/24;
			return Math.Cos(d);
		}
	}
}
