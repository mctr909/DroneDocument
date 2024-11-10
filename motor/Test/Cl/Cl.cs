namespace Cl;

public class Cl(int[] metric) {
	private readonly int[] Metric = [.. metric];

	private record Group {
		public required ClBlade Blade { get; init; }
		public required Dictionary<string, ClAdj.Coef> CoefMap { get; init; }
	}

	public List<ClAdj> Sandwich(ClTerm[] v, params ClTerm[][] Ms) {
		// サンドイッチ積
		ClTerm[] terms = [.. v];
		foreach (var M in Ms) {
			ClTerm[] reverse = [.. M.Select(t => t.GetReverse())];
			var left = Multiply(M, terms);
			terms = Multiply(left, reverse);
		}
		// ブレードIDと係数IDの複合キー、2階層の辞書で集計
		var bladeMap = new Dictionary<string, Group>();
		foreach (var term in terms) {
			var bladeId = term.Blade.Id;
			var coefId = term.Id;
			if (!bladeMap.TryGetValue(bladeId, out var blade)) {
				blade = new Group {
					Blade = new ClBlade(term.Blade.Bases),
					CoefMap = []
				};
				bladeMap[bladeId] = blade;
			}
			var deltaCount = term.Count * term.Blade.Sign;
			if (blade.CoefMap.TryGetValue(coefId, out var coef)) {
				coef.Count += deltaCount;
			} else {
				blade.CoefMap[coefId] = new ClAdj.Coef {
					Coefs = [.. term.Coefs],
					Count = deltaCount
				};
			}
		}
		// ClAdj.Coef.Count == 0を取り除く
		var result = new List<ClAdj>(bladeMap.Count);
		foreach (var group in bladeMap.Values) {
			var coefs = group.CoefMap.Values
				.Where(c => c.Count != 0)
				.ToList();
			if (coefs.Count > 0) {
				result.Add(new ClAdj {
					Blade = group.Blade,
					Coefs = coefs
				});
			}
		}
		// 係数順にソート
		foreach (var blade in result) {
			blade.Coefs.Sort((a, b) => {
				var coef_a = a.Coefs;
				var coef_b = b.Coefs;
				// 符号順(+先, -後)
				var sign_diff = Math.Sign(b.Count) - Math.Sign(a.Count);
				if (sign_diff != 0) {
					return sign_diff;
				}
				// 係数の個数順
				var count_diff = coef_a.Length - coef_b.Length;
				if (count_diff != 0) {
					return count_diff;
				}
				// 係数の文字順
				for (var i = 0; i < coef_a.Length; i++) {
					if (coef_a[i] != coef_b[i]) {
						return coef_a[i].CompareTo(coef_b[i]);
					}
				}
				return 0;
			});
		}
		// グレード・基底順にソート
		result.Sort((a, b) => {
			var bases_a = a.Blade.Bases;
			var bases_b = b.Blade.Bases;
			// グレード順
			var g_diff = bases_a.Length - bases_b.Length;
			if (g_diff != 0) {
				return g_diff;
			}
			// 基底順
			for (var i = 0; i < bases_a.Length; i++) {
				var e_diff = bases_a[i] - bases_b[i];
				if (e_diff != 0) {
					return e_diff;
				}
			}
			return 0;
		});
		return result;
	}

	public ClTerm[] Multiply(ClTerm[] M1, ClTerm[] M2) {
		var results = new ClTerm[M1.Length * M2.Length];
		int index = 0;
		foreach (var t1 in M1) {
			foreach (var t2 in M2) {
				results[index++] = ClTerm.Product(t1, t2, Metric);
			}
		}
		ClTerm.Simplify(ref results);
		return results;
	}
}
