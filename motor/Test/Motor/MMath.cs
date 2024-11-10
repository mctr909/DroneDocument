using System;

namespace Motor {
	class MMath {
		public static double Wrap(double theta) {
			return Atan2(Math.Sin(theta), Math.Cos(theta));
		}

		public static double Atan2(double y, double x) {
			return Math.Atan2(y, x);
		}
	}
}

