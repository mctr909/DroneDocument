using System;

namespace Motor
{
	public class MagneticField
	{
		/** 電流センサ有効 遷移区間下限[rad/s] */
		private const double SensTransitionMin = 2 * Math.PI * 4;
		/** 電流センサ有効 遷移区間上限[rad/s] */
		private const double SensTransitionMax = 2 * Math.PI * 10;
		/** 電流センサ有効 遷移区間幅[rad/s] */
		private const double SensTransitionWidth = SensTransitionMax - SensTransitionMin;

		public static double GetLoadAngleFromGeodeticLine(double i_r, double theta_r, double phi, double omega_s)
		{
			return Math.PI / 2;
		}
	}
}
