namespace Cl;

public class ClTerm(string[] coefs, ClBlade blade, int count = 1) {
	private record Group {
		public required string[] Coefs;
		public required int[] Bases;
		public int Count;
	}

	public int Count { get; } = count;

	public string[] Coefs { get; } = [.. coefs];

	public ClBlade Blade { get; } = new ClBlade(blade.Bases, blade.Sign);

	public string Id => string.Join("*", Coefs);

	public ClTerm GetReverse() {
		// 順序反転による符号の決定: g*(g-1)/2回の交換が必要
		var g = Blade.Bases.Length;
		var swapCount = g * (g - 1) / 2;
		var reverseSign = (swapCount % 2 == 0) ? 1 : -1;
		// 新しい符号を適用して項を複製
		var newBlade = new ClBlade(Blade.Bases, Blade.Sign * reverseSign);
		return new ClTerm(Coefs, newBlade, Count);
	}

	public override string ToString() {
		var s = Blade.Sign < 0 ? "-" : "";
		var c = Count == 1 ? "" : (Count + "*");
		var coef = Id;
		var g = Blade.ToString();
		var m = (!string.IsNullOrEmpty(coef) && !string.IsNullOrEmpty(g)) ? "*" : "";
		return s + c + coef + m + g;
	}

	public static ClTerm Product(ClTerm term1, ClTerm term2, in int[] metric) {
		// 基底を結合して簡約
		var b1 = term1.Blade.Bases;
		var b2 = term2.Blade.Bases;
		int[] combinedBases = [..b1, ..b2];
		var canonicalizedBlade = ClBlade.Canonicalize(combinedBases, metric);
		// t1の符号 * t2の符号 * 基底簡約で生じた符号を反映
		var finalSign = term1.Blade.Sign * term2.Blade.Sign * canonicalizedBlade.Sign;
		canonicalizedBlade.Sign = finalSign;
		// 係数を結合
		var c1 = term1.Coefs;
		var c2 = term2.Coefs;
		var combinedCount = term1.Count * term2.Count;
		string[] combinedCoefs = [..c1, ..c2];
		Array.Sort(combinedCoefs);
		return new ClTerm(combinedCoefs, canonicalizedBlade, combinedCount);
	}

	public static void Sort(ref ClTerm[] terms) {
		foreach (var term in terms) {
			// 係数順
			Array.Sort(term.Coefs, (a, b) => {
				return a.CompareTo(b);
			});
		}
		Array.Sort(terms, (a, b) => {
			var bases_a = a.Blade.Bases;
			var bases_b = b.Blade.Bases;
			// グレード順
			var g_diff = bases_a.Length - bases_b.Length;
			if (g_diff != 0) {
				return g_diff;
			}
			// 基底のインデックス順
			for (var i = 0; i < bases_a.Length; i++) {
				var e_diff = bases_a[i] - bases_b[i];
				if (e_diff != 0) {
					return e_diff;
				}
			}
			return 0;
		});
	}

	public static void Simplify(ref ClTerm[] terms) {
		// 基底のキーと係数のキーを組み合わせた一意のマップで集計する
		var groupMap = new Dictionary<string, Group>();
		foreach (var term in terms) {
			// 同類項を識別するためのユニークキー(例: "e1,e2|a*b")
			var compositeKey = $"{term.Blade.Id}|{term.Id}";
			// 実際の符号を考慮したカウント数 (count * sign)
			var deltaCount = term.Count * term.Blade.Sign;
			if (groupMap.TryGetValue(compositeKey, out Group? group)) {
				group.Count += deltaCount;
			} else {
				// 後でオブジェクトを再構成するために参照を保持
				groupMap.Add(compositeKey, new Group {
					Coefs = term.Coefs,
					Bases = term.Blade.Bases,
					Count = deltaCount
				});
			}
		}
		var count = groupMap.Values.Count(a => a.Count != 0);
		terms = new ClTerm[count];
		int index = 0;
		foreach (var group in groupMap.Values) {
			if (group.Count == 0) {
				continue;
			}
			// 最終的な符号と絶対値としてのcountを決定
			var finalSign = group.Count > 0 ? 1 : -1;
			var finalCount = Math.Abs(group.Count);
			// ClBladeとClTermを生成して結果に追加
			var newBlade = new ClBlade(group.Bases, finalSign);
			terms[index++] = new ClTerm(group.Coefs, newBlade, finalCount);
		}
	}
}
