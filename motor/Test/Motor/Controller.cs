using System;

namespace Motor {
	public class Controller {
		/** 速度指令値 */
		public double Cmd { get; private set; } = 0;
		/** 固定子磁界位相[rad] */
		public double ThetaS { get; private set; } = 0;
		/** 固定子磁界角速度[rad/s] */
		public double OmegaS { get; private set; } = 0;
		/** 目標角速度[rad/s] */
		public double OmegaT { get; set; } = 0;

		/** 指令値比例ゲイン */
		private const double Kp = 1.0;
		/** 指令値積分ゲイン */
		private const double Ki = 0.9;

		/** 速度制限 */
		private readonly double Lim;
		/** 固定子角速度(LPF係数) */
		private readonly double OmegaFk;
		/** サンプリング周期[s] */
		private readonly double Dt;

		/** 速度指令積分値 */
		private double Int = 0;

		public Controller(double lim, double omegaFc, double fs) {
			Lim = lim;
			OmegaFk = 1 - Math.Exp(-2 * Math.PI * omegaFc / fs);
			Dt = 1 / fs;
			InitStator(0, 0);
		}

		public void InitStator(double omega, double theta) {
			OmegaS = omega;
			ThetaS = theta;
			Cmd = 0;
			Int = 0;
		}

		public void Step(double thetaR, double omegaR) {
			// φ(負荷角[rad]) = θ_S(固定子位相) - θ_R(回転子位相)
			var phi = MMath.Wrap(ThetaS - thetaR);
			// φ_t(目標負荷角[rad])
			var phi_t = MagneticField.GetLoadAngleFromGeodeticLine(0, thetaR, phi, OmegaS);
			// φ_e(誤差負荷角[rad]) = φ_t(目標負荷角) - φ(負荷角)
			var phi_e = MMath.Wrap(phi_t - phi);

			// ω_S(固定子磁界角速度) 更新
			OmegaS += OmegaFk * (phi_e/Dt - OmegaS);
			// θ_S(固定子磁界位相) 更新
			ThetaS = MMath.Wrap(ThetaS + OmegaS * Dt);

			/*** 速度指令値更新 ***/
			var oe = OmegaT - omegaR;
			var od = oe * Dt;
			var cmd = Kp * oe + Ki * (Int + od);
			// 制限
			if (cmd > Lim) {
				cmd = Lim;
			} else if (cmd < -Lim) {
				cmd = -Lim;
			} else {
				Int += od;
			}
			Cmd = cmd / Lim;
		}
	}
}
