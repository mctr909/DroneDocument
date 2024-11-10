namespace Cl;

public class ClBlade(in int[] bases, int sign = 1) {
	public int Sign { get; set; } = sign;

	public int[] Bases { get; } = [.. bases];

	public string Id => string.Join(",", Bases);

	public override string ToString() {
		var s = Bases.Length == 0 ? "1" : "";
		var m = string.Join("", Bases.Select(i => "e" + i));
		return s + m;
	}

	public static ClBlade Canonicalize(in int[] bases, in int[] metric) {
		List<int> list = [.. bases];
		int sign = 1;
		var changed = true;
		while (changed) {
			changed = false;
			for (var i = 0; i < list.Count - 1; i++) {
				if (list[i] == list[i + 1]) {
					// 隣り合う要素が同じなら符号数を適用して削除
					sign *= metric[list[i] - 1];
					list.RemoveRange(i, 2);
					changed = true;
					break;
				}
				if (list[i] > list[i + 1]) {
					// 反交換関係：ei*ej = -ej*ei
					(list[i], list[i + 1]) = (list[i + 1], list[i]);
					sign *= -1;
					changed = true;
					break;
				}
			}
		}
		return new ClBlade([.. list], sign);
	}
}
