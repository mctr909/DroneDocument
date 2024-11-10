namespace Cl;

public class ClAdj {
	public class Coef {
		public int Count { get; set; }

		public required string[] Coefs { get; init; }
	}

	public required List<Coef> Coefs { get; init; }

	public required ClBlade Blade { get; init; }

	private static readonly System.Text.RegularExpressions.Regex sRegex = new("^ \\+ ");

	public override string ToString() {
		var inner = "";
		foreach (var coef in Coefs) {
			var sign = coef.Count < 0 ? " - " : " + ";
			var countAbs = Math.Abs(coef.Count);
			var count = countAbs == 1 ? "" : (countAbs + "*");
			var joined = string.Join("*", coef.Coefs);
			var coefStr = string.IsNullOrEmpty(joined) ? "1" : joined;
			inner += $"{sign}{count}{coefStr}";
		}
		inner = sRegex.Replace(inner, "").Trim();
		if (inner.StartsWith("+ ")) {
			inner = inner[2..];
		}
		var blade = Blade.ToString();
		return blade == "1" ? inner : $"({inner})*{blade}";
	}
}
