using System;

namespace Motor {
	public class Model {
		private const double PHASE120 = 2 * Math.PI / 3;

		/// <summary>巻線抵抗[Ω]</summary>
		private const double R = 10;
		/// <summary>巻線インダクタンス[H]</summary>
		private const double L_c = 1e-3;
		/// <summary>巻線インダクタンス 突極性2次変動分[H]</summary>
		private const double L_d = 10e-6;
		/// <summary>逆起電力定数[V/(rad/s)]</summary>
		private const double Ke = 1000e-3;
		/// <summary>極数</summary>
		private const int PolePairs = 1;
		/// <summary>トルク定数[Nm/A]</summary>
		private const double Kt = PolePairs*Ke;
		/// <summary>慣性モーメント[kg*m^2]</summary>
		private const double J = 20e-3;
		/// <summary>摩擦係数[N*m*s/rad]</summary>
		private const double D = 2e-3;
		/// <summary>負荷トルク</summary>
		public double T_load = 0;

		/// <summary>サンプリング周期[s]</summary>
		private double dt = 0;

		/// <summary>回転子機械角速度[rad/s]</summary>
		public double omega_Rm = 0;
		/// <summary>回転子機械角[rad]</summary>
		public double theta_Rm = 0;

		/// <summary>3相電流<para>U相:I[0], V相:I[1], W相:I[2]</para></summary>
		public double[] I = { 0, 0, 0 };

		/// <summary>インダクタンス行列</summary>
		private readonly double[,] L = { { 0, 0, 0 }, { 0, 0, 0 }, { 0, 0, 0 } };
		/// <summary>[A|v]拡大係数行列</summary>
		private readonly double[,] Av = { { 0, 0, 0, 0 }, { 0, 0, 0, 0 }, { 0, 0, 0, 0 } };
		/// <summary>L*i_{n-1}</summary>
		private readonly double[] Li_n1 = { 0, 0, 0 };

		/// <param name="fs"></param>
		public Model(double fs) {
			dt = 1 / fs;
		}

		public void UpdateCircuit(double[] v_n) {
			var theta_e = PolePairs*theta_Rm;
			var omega_e = PolePairs*omega_Rm;

			/*** 逆起電力 ***/
			var KeOmega = Ke*omega_e;
			double[] e_n = {
				-KeOmega*Math.Sin(theta_e),
				-KeOmega*Math.Sin(theta_e - PHASE120),
				-KeOmega*Math.Sin(theta_e + PHASE120)
			};

			/*** インダクタンス(L) ***/
			var M_c = -0.5*L_c;
			var M_d = -0.5*L_d;
			var l_1 = Math.Cos(2*theta_e);
			var l_2 = Math.Cos(2*theta_e - PHASE120);
			var l_3 = Math.Cos(2*theta_e + PHASE120);
			var L_1 = L_c + L_d*l_1;
			var L_2 = L_c + L_d*l_2;
			var L_3 = L_c + L_d*l_3;
			var M_1 = M_c + M_d*l_1;
			var M_2 = M_c + M_d*l_2;
			var M_3 = M_c + M_d*l_3;
			L[0, 0] = L_1; L[0, 1] = M_3; L[0, 2] = M_2;
			L[1, 0] = M_3; L[1, 1] = L_2; L[1, 2] = M_1;
			L[2, 0] = M_2; L[2, 1] = M_1; L[2, 2] = L_3;

			/*** (L/dt + R)*i_n = v_n - e_n + L*i_{n-1}/dt ***/
			Av[0, 0] = L[0, 0]/dt + R;
			Av[0, 1] = L[0, 1]/dt;
			Av[0, 2] = L[0, 2]/dt;
			Av[0, 3] = v_n[0] - e_n[0] + Li_n1[0]/dt;

			Av[1, 0] = L[1, 0]/dt;
			Av[1, 1] = L[1, 1]/dt + R;
			Av[1, 2] = L[1, 2]/dt;
			Av[1, 3] = v_n[1] - e_n[1] + Li_n1[1]/dt;

			Av[2, 0] = L[2, 0]/dt;
			Av[2, 1] = L[2, 1]/dt;
			Av[2, 2] = L[2, 2]/dt + R;
			Av[2, 3] = v_n[2] - e_n[2] + Li_n1[2]/dt;

			Solve(Av, I);

			/*** L*i_{n-1} ***/
			Li_n1[0] = L[0, 0]*I[0] + L[0, 1]*I[1] + L[0, 2]*I[2];
			Li_n1[1] = L[1, 0]*I[0] + L[1, 1]*I[1] + L[1, 2]*I[2];
			Li_n1[2] = L[2, 0]*I[0] + L[2, 1]*I[1] + L[2, 2]*I[2];
		}

		public void UpdateRotor() {
			var theta_e = PolePairs*theta_Rm;

			/*** マグネットトルク(T_m) ***/
			var ix = I[0];
			var iy = (I[0] + 2*I[1]) / Math.Sqrt(3);
			var rx = Math.Cos(theta_e);
			var ry = Math.Sin(theta_e);
			var T_m = Kt*(iy*rx - ix*ry);

			/*** リラクタンストルク(T_r) ***/
			double T_r;
			{
				const double M2 = -0.5*L_d;
				var s_u = -2*Math.Sin(2*theta_e);
				var s_v = -2*Math.Sin(2*theta_e - PHASE120);
				var s_w = -2*Math.Sin(2*theta_e + PHASE120);
				var dthLu = L_d*s_u;
				var dthLv = L_d*s_v;
				var dthLw = L_d*s_w;
				var dthKuv = M2*s_u;
				var dthKvw = M2*s_v;
				var dthKwu = M2*s_w;
				double[,] dthL = {
					{ dthLu,  dthKuv, dthKwu },
					{ dthKuv, dthLv,  dthKvw },
					{ dthKwu, dthKvw, dthLw }
				};
				var dthLi = MatMul(dthL, I);
				T_r = 0.5*PolePairs*(I[0]*dthLi[0] + I[1]*dthLi[1] + I[2]*dthLi[2]);
			}

			/*** 位相・速度更新 ***/
			var num = omega_Rm + (T_m + T_r - T_load)*dt/J;
			var den = 1 + D*dt/J;
			omega_Rm = num / den;
			theta_Rm += omega_Rm*dt;
			theta_Rm = Wrap(theta_Rm);
		}

		public static double Wrap(double theta) {
			return Math.Atan2(Math.Sin(theta), Math.Cos(theta));
		}

		private static double[] MatMul(double[,] A, double[] v) {
			var n = v.Length;
			var x = new double[n];
			for (var i = 0; i < n; i++) {
				double sum = 0;
				for (var j = 0; j < n; j++) {
					sum += A[i, j] * v[j];
				}
				x[i] = sum;
			}
			return x;
		}

		private static void Solve(double[,] Ab, double[] x) {
			const double EPS = 1e-9;
			var n = x.Length;
			for (var i = 0; i < n; i++) {
				var maxRow = i;
				for (var k = i + 1; k < n; k++) {
					if (Math.Abs(Ab[k, i]) > Math.Abs(Ab[maxRow, i])) {
						maxRow = k;
					}
				}

				if (maxRow != i) {
					for (int j = 0; j < n + 1; j++) {
						(Ab[maxRow, j], Ab[i, j]) = (Ab[i, j], Ab[maxRow, j]);
					}
				}

				var den = Ab[i, i];
				if (Math.Abs(den) < EPS) {
					throw new InvalidOperationException("Matrix is singular");
				}
				for (var k = i + 1; k < n; k++) {
					var c = Ab[k, i] / den;
					for (var j = i; j < n + 1; j++) {
						if (i == j) {
							Ab[k, j] = 0;
						} else {
							Ab[k, j] -= c * Ab[i, j];
						}
					}
				}
			}

			for (var i = n - 1; i >= 0; i--) {
				x[i] = Ab[i, n] / Ab[i, i];
				for (var k = i - 1; k >= 0; k--) {
					Ab[k, n] -= Ab[k, i] * x[i];
				}
			}
		}
	}
}
