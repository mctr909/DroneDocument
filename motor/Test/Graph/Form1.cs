using System;
using System.Drawing;
using System.Windows.Forms;

namespace Graph {
	public partial class Form1 : Form {
		public Form1() {
			InitializeComponent();
		}

		private void Form1_Load(object sender, EventArgs e) {
			var lineA = new Svg.Obj()
			{
				Color = "blue"
			};
			var lineB = new Svg.Obj()
			{
				Color = "red"
			};
			for (int i = 0; i < 1000; i++) {
				var px = i / 1000f;
				var py = 0.5 + 0.5*Math.Cos(2 * Math.PI * px);
				lineA.Points.Add(new PointF(i, (float)(256 * py)));
				py = 0.5 + 0.5 * Math.Sin(2 * Math.PI * px);
				lineB.Points.Add(new PointF(i, (float)(256 * py)));
			}
			Svg.Save(AppContext.BaseDirectory + "\\test.svg", 1024, 256, lineA, lineB);
		}
	}
}
