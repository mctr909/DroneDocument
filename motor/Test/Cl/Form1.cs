namespace Cl;

public partial class Form1 : Form {
	public Form1() {
		InitializeComponent();
		var v2 = new ClTerm[] {
			new(["v1"], new ClBlade([1])),
			new(["v2"], new ClBlade([2]))
		};
		var v3 = new ClTerm[] {
			new(["v1"], new ClBlade([1])),
			new(["v2"], new ClBlade([2])),
			new(["v3"], new ClBlade([3]))
		};
		var v3t = new ClTerm[] {
			new(["v0"], new ClBlade([4])),
			new(["v1"], new ClBlade([1])),
			new(["v2"], new ClBlade([2])),
			new(["v3"], new ClBlade([3]))
		};
		var v4 = new ClTerm[] {
			new(["v1"], new ClBlade([1])),
			new(["v2"], new ClBlade([2])),
			new(["v3"], new ClBlade([3])),
			new(["v4"], new ClBlade([4]))
		};

		var W2 = new ClTerm[] {
			new(["ws"], new ClBlade([])),
			new(["w12"], new ClBlade([1, 2]))
		};
		var W3 = new ClTerm[] {
			new(["ws"], new ClBlade([])),
			new(["w23"], new ClBlade([2, 3])),
			new(["w31"], new ClBlade([3, 1])),
			new(["w12"], new ClBlade([1, 2]))
		};
		var W4 = new ClTerm[] {
			new(["ws"], new ClBlade([])),
			new(["w12"], new ClBlade([1, 2])),
			new(["w13"], new ClBlade([1, 3])),
			new(["w14"], new ClBlade([1, 4])),
			new(["w23"], new ClBlade([2, 3])),
			new(["w24"], new ClBlade([2, 4])),
			new(["w34"], new ClBlade([3, 4]))
		};
		var W4d = new ClTerm[] {
			new(["ws"], new ClBlade([])),
			new(["w12"], new ClBlade([1, 2])),
			new(["w34"], new ClBlade([3, 4])),
			new(["w1234"], new ClBlade([1, 2, 3, 4]))
		};

		var T3 = new ClTerm[] {
			new(["xs"], new ClBlade([])),
			new(["x01"], new ClBlade([4, 1])),
			new(["x02"], new ClBlade([4, 2])),
			new(["x03"], new ClBlade([4, 3]))
		};

		var cl = new Cl([-1, -1, -1, -1]);
		var clt = new Cl([-1, -1, -1, 0]);
		var m2 = cl.Sandwich(v2, W2);
		var m3 = cl.Sandwich(v3, W3);
		var m3t = clt.Sandwich(v3t, W3, T3);
		var m4 = cl.Sandwich(v4, W4);
		var m4d = cl.Sandwich(v4, W4d);

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
		str += "\r\n//R^4\r\n";
		foreach (var i in m4) {
			str += i.ToString() + "\r\n";
		}
		str += "\r\n//R^4 2ローテーション\r\n";
		foreach (var i in m4d) {
			str += i.ToString() + "\r\n";
		}

		textBox1.Text = str;
	}
}
