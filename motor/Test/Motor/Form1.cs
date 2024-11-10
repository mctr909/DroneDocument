using System;
using System.Drawing;
using System.Windows.Forms;
using System.Windows.Forms.DataVisualization.Charting;

namespace Motor {
	public partial class Form1 : Form {
		static readonly Font font = new Font("Consolas", 11);
		const int Charts = 3;
		const int ChartMarginX = 8;
		const int ChartMarginY = 8;
		Series seriesI, seriesIU, seriesIV, seriesIW;
		Series seriesRth, seriesSth;
		Series seriesRHz, seriesSHz;

		public Form1() {
			InitializeComponent();
			SetupChart();
		}

		private void SetupChart() {
			SetupArea(chartI);
			seriesI = chartI.Series.Add("i");
			seriesIU = chartI.Series.Add("iU");
			seriesIV = chartI.Series.Add("iV");
			seriesIW = chartI.Series.Add("iW");
			seriesI.Color = Color.FromArgb(111, 131, 131);
			seriesIU.Color = Color.FromArgb(0, 171, 171);
			seriesIV.Color = Color.FromArgb(171, 171, 0);
			seriesIW.Color = Color.FromArgb(171, 0, 171);
			seriesI.ChartType = SeriesChartType.Line;
			seriesIU.ChartType = SeriesChartType.Line;
			seriesIV.ChartType = SeriesChartType.Line;
			seriesIW.ChartType = SeriesChartType.Line;
			seriesI.BorderWidth = 3;

			SetupArea(chartRotor, 1);
			seriesRth = chartRotor.Series.Add("θR[rad]");
			seriesSth = chartRotor.Series.Add("θS[rad]");
			seriesRth.Color = Color.FromArgb(0, 171, 171);
			seriesSth.Color = Color.FromArgb(171, 171, 0);
			seriesRth.ChartType = SeriesChartType.Line;
			seriesSth.ChartType = SeriesChartType.Line;

			SetupArea(chartFreq);
			seriesRHz = chartFreq.Series.Add("fR[Hz]");
			seriesSHz = chartFreq.Series.Add("fS[Hz]");
			seriesRHz.Color = Color.FromArgb(0, 171, 171);
			seriesSHz.Color = Color.FromArgb(171, 171, 0);
			seriesRHz.ChartType = SeriesChartType.Line;
			seriesSHz.ChartType = SeriesChartType.Line;
		}

		private static void SetupArea(Chart chart, double intervalY = 0, double intervalX = 100, string titleX = "[msec]") {
			chart.Legends[0].Font = font;
			chart.Legends[0].Alignment = StringAlignment.Near;

			var area = chart.ChartAreas[0];
			area.AxisX.Title = titleX;
			area.AxisX.Interval = intervalX;
			area.AxisX.TitleForeColor = Color.LightGray;
			area.AxisX.LineColor = Color.Gray;
			area.AxisX.LabelStyle.Format = "0";
			area.AxisX.LabelStyle.ForeColor = Color.LightGray;
			area.AxisX.MajorGrid.LineColor = Color.Gray;

			area.AxisY.Interval = intervalY;
			area.AxisY.LineColor = Color.Gray;
			area.AxisY.LabelStyle.Angle = 0;
			area.AxisY.LabelStyle.ForeColor = Color.LightGray;
			area.AxisY.MajorGrid.LineColor = Color.Gray;
		}

		private void SetupSize(Chart chart) {
			var width = Width - ChartMarginX*2 - 16;
			var height = (Height - 39 - ChartMarginY*(Charts+1)) / Charts;
			chart.Width = width;
			chart.Height = height;

			var area = chart.ChartAreas[0];
			area.Position.Auto = false;
			area.Position.X = 0;
			area.Position.Y = 0;
			area.Position.Width = 100.0f * (width - 85) / width;
			area.Position.Height = 100.0f;

			var legend = chart.Legends[0];
			legend.Position.Auto = false;
			legend.Position.X = 100.0f * (width - 100) / width;
			legend.Position.Y = 0;
			legend.Position.Width = 100.0f * 100 / width;
			legend.Position.Height = 75;
		}

		private void Form1_SizeChanged(object sender = null, EventArgs e = null) {
			chartI.Left = ChartMarginX;
			chartI.Top = ChartMarginY;
			SetupSize(chartI);

			chartRotor.Left = ChartMarginX;
			chartRotor.Top = chartI.Bottom + ChartMarginY;
			SetupSize(chartRotor);

			chartFreq.Left = ChartMarginX;
			chartFreq.Top = chartRotor.Bottom + ChartMarginY;
			SetupSize(chartFreq);
		}

		private void Form1_Load(object sender, EventArgs e) {
			var fs = 20000;
			var c = new Controller(10, 50, fs);
			var m = new Model(fs);
			var p = new Pwm(1200, 20, 2.0/fs, 1.0/fs, fs);
			var pwm_fk = 1 - Math.Exp(-4000.0/fs);

			var omega_init = 2 * Math.PI * 5;
			c.OmegaT = 2 * Math.PI * 50;
			m.omega_Rm = omega_init;
			c.InitStator(omega_init, 0);

			double[] v = { 0, 0, 0 };

			for (int i = 0; i < 2*fs; i++) {
				c.Step(m.theta_Rm, m.omega_Rm);

				p.Step(c.Cmd, c.ThetaS);
				const double V = 12;
				v[0] += pwm_fk*((p.up - p.un) * V - v[0]);
				v[1] += pwm_fk*((p.vp - p.vn) * V - v[1]);
				v[2] += pwm_fk*((p.wp - p.wn) * V - v[2]);
				m.UpdateCircuit(v);
				m.UpdateRotor();

				var t = (double)i / fs;
				var msec = t * 1000;
				var iy = (m.I[2] - m.I[1]) / Math.Sqrt(3);
				var ir = Math.Sqrt(m.I[0]*m.I[0] + iy*iy);
				seriesI.Points.AddXY(msec, ir);
				seriesIU.Points.AddXY(msec, m.I[0]);
				seriesIV.Points.AddXY(msec, m.I[1]);
				seriesIW.Points.AddXY(msec, m.I[2]);
				seriesRth.Points.AddXY(msec, m.theta_Rm);
				seriesSth.Points.AddXY(msec, c.ThetaS);
				seriesRHz.Points.AddXY(msec, m.omega_Rm / (2 * Math.PI));
				seriesSHz.Points.AddXY(msec, c.OmegaS / (2 * Math.PI));
			}
			Form1_SizeChanged();
		}
	}
}
