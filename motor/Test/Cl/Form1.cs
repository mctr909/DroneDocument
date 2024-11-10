namespace Cl;

public partial class Form1 : Form {
	public Form1() {
		InitializeComponent();
		var v2 = new ClTerm[] {
			new(["v_{1}"], new ClBases([1])),
			new(["v_{2}"], new ClBases([2]))
		};
		var v3 = new ClTerm[] {
			new(["v_{1}"], new ClBases([1])),
			new(["v_{2}"], new ClBases([2])),
			new(["v_{3}"], new ClBases([3]))
		};
		var v3t = new ClTerm[] {
			new(["v_{0}"], new ClBases([4])),
			new(["v_{1}"], new ClBases([1])),
			new(["v_{2}"], new ClBases([2])),
			new(["v_{3}"], new ClBases([3]))
		};

		var R2 = new ClTerm[] {
			new(["r_{0}"], new ClBases([])),
			new(["r_{1,2}"], new ClBases([1, 2]))
		};
		var R3 = new ClTerm[] {
			new(["r_{0}"], new ClBases([])),
			new(["r_{2,3}"], new ClBases([2, 3])),
			new(["r_{3,1}"], new ClBases([3, 1])),
			new(["r_{1,2}"], new ClBases([1, 2]))
		};

		var T3 = new ClTerm[] {
			new(["t_{0}"], new ClBases([])),
			new(["t_{0,1}"], new ClBases([4, 1])),
			new(["t_{0,2}"], new ClBases([4, 2])),
			new(["t_{0,3}"], new ClBases([4, 3]))
		};

		var cl = new Cl([-1, -1, -1, -1]);
		var clt = new Cl([-1, -1, -1, 0]);
		var m2 = cl.Sandwich(v2, R2);
		var m3 = cl.Sandwich(v3, R3);
		var m3t = clt.Sandwich(v3t, R3, T3);

		var str = "//R^2\r\n";
		foreach (var i in m2) {
			str += i.ToString() + "\r\n";
		}

		str += "\r\n//R^3\r\n";
		foreach (var i in m3) {
			str += i.ToString() + "\r\n";
		}

		str += "\r\n//R^3 T\r\n";
		foreach (var i in m3t) {
			str += i.ToString() + "\r\n";
		}

		textBox1.Text = str;
	}
}
