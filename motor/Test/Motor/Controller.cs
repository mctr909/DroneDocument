using System;

namespace Motor {
	public class Controller {
		private const double TAU = 2 * Math.PI;
		private const double INV_SQRT3 = 1 / 1.7320508;

		/** 指令値比例ゲイン */
		private const double Kp_I = 1.0;
		/** 指令値積分ゲイン */
		private const double Ki_I = 1.6;

		/** サンプリング周期[s] */
		private double dt = 0;

		/** 回転子ベクトル(LPF係数) */
		private double R_fk = 0;
		/** 回転子ベクトル(x軸LPF値) */
		private double R_x = 0;
		/** 回転子ベクトル(y軸LPF値) */
		private double R_y = 0;

		/** 固定子角速度(LPF係数) */
		private double omega_fk = 0;
		/** 固定子磁界角速度[rad/s] */
		public double omega_S { get; private set; } = 0;
		/** 固定子磁界位相[rad] */
		public double theta_S { get; private set; } = 0;
		/** 回転子位相[rad] */
		public double theta_R { get; private set; } = 0;

		/** 電流実測値補正 */
		private double I_adj = 0;
		/** 電流制限 */
		private double I_lim = 0;
		/** 電流指令積分値 */
		private double I_int = 0;
		/** 電流指令値[0,1) */
		public double I_cmd { get; private set; } = 0;
		/** 目標角速度[rad/s] */
		public double omega_T { get; set; } = 0;

		public Controller(double i_adj, double i_lim, double r_fc, double omega_fc, double fs) {
			I_adj = i_adj;
			I_lim = i_lim;
			R_fk = 1 - Math.Exp(-2 * Math.PI * r_fc / fs);
			omega_fk = 1 - Math.Exp(-2 * Math.PI * omega_fc / fs);
			dt = 1 / fs;
			InitStator(0, 0);
			InitRotor(1, 0);
		}

		public void InitStator(double omega, double theta) {
			theta_S = theta + Math.Sign(omega) * Math.PI/2;
			omega_S = omega;
			I_cmd = 0;
			I_int = 0;
		}

		public void InitRotor(double i, double theta) {
			R_x = i*Math.Cos(theta);
			R_y = i*Math.Sin(theta);
		}

		public void Step(double sens_Ru, double sens_Rv) {
			/*** 位相・速度更新 ***/
			// (R_x, R_y)(回転子ベクトルLPF)
			var sens_Ry = -(sens_Ru + 2*sens_Rv) * INV_SQRT3;
			R_x += R_fk * (sens_Ru - R_x);
			R_y += R_fk * (sens_Ry - R_y);
			// θ_R(回転子位相)
			theta_R = MMath.Atan2(R_y, R_x);

			// φ(負荷角[rad]) = θ_S(固定子位相) - θ_R(回転子位相)
			var phi = MMath.Wrap(theta_S - theta_R);
			// φ_t(目標負荷角[rad])
			var phi_t = MagneticField.GetLoadAngleFromGeodeticLine(0, theta_R, phi, omega_S);
			// φ_e(誤差負荷角[rad]) = φ_t(目標負荷角) - φ(負荷角)
			var phi_e = MMath.Wrap(phi_t - phi);

			// ω_S(固定子磁界角速度) 更新
			omega_S += omega_fk * (phi_e/dt - omega_S);
			// θ_S(固定子磁界位相) 更新
			theta_S = MMath.Wrap(theta_S + omega_S * dt);

			/*** 電流指令値更新(速度制御) ***/
			var i_e = I_adj * (omega_T - omega_S);
			var i_d = i_e * dt;
			var i_cmd = Kp_I * i_e + Ki_I * (I_int + i_d);

			// 電流制限
			if (i_cmd > I_lim) {
				i_cmd = I_lim;
			} else if (i_cmd < -I_lim) {
				i_cmd = -I_lim;
			} else {
				I_int += i_d;
			}
			I_cmd = i_cmd / I_lim;
		}
	}
}
