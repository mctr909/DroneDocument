class ClGrade {
	/** @type {number} */
	sign;
	/** @type {number[]} */
	bases;

	/**
	 * @param {number[]} bases
	 * @param {number} sign
	 */
	constructor(bases, sign=1) {
		this.sign = sign;
		this.bases = [...bases];
	}

	get key() {
		return this.bases.join(",");
	}

	get display() {
		const s = this.bases.length == 0 ? "1" : "";
		const m = this.bases.map(i => "e" + i).join("");
		return s + m;
	}

	/**
	 * @param {number[]} bases
	 * @param {number[]} metric
	 * @returns {ClGrade}
	 */
	static canonicalizeBases(bases, metric) {
		let list = [...bases];
		let sign = 1;
		let changed = true;
		while (changed) {
			changed = false;
			for (let i = 0; i < list.length - 1; i++) {
				if (list[i] === list[i + 1]) {
					// 隣り合う要素が同じなら符号数を適用して削除
					sign *= metric[list[i] - 1];
					list.splice(i, 2);
					changed = true;
					break;
				}
				if (list[i] > list[i + 1]) {
					// 反交換関係：ei*ej = -ej*ei
					[list[i], list[i + 1]] = [list[i + 1], list[i]];
					sign *= -1;
					changed = true;
					break;
				}
			}
		}
		return new ClGrade(list, sign);
	}
}

class ClTerm {
	/** @type {number} */
	count;
	/** @type {string[]} */
	coefs;
	/** @type {ClGrade} */
	grade;

	/**
	 * @param {string[]} coefs
	 * @param {ClGrade} grade
	 * @param {number} count
	 */
	constructor(coefs, grade, count=1) {
		this.count = count;
		this.coefs = [...coefs];
		this.grade = new ClGrade(grade.bases, grade.sign);
	}

	get key() {
		return this.coefs.join("*");
	}

	get display() {
		const s = this.grade.sign < 0 ? "-" : "+";
		const c = this.count === 1 ? "" : (this.count + "*");
		const coef = this.key;
		const g = this.grade.display;
		const m = (coef && g) ? "*" : "";
		return s + c + coef + m + g;
	}

	/**
	 * @returns {ClTerm}
	 */
	reverse() {
		// 順序反転による符号の決定: g*(g-1)/2回の交換が必要
		const g = this.grade.bases.length;
		const swapCount = (g * (g - 1)) / 2;
		const reverseSign = (swapCount % 2 === 0) ? 1 : -1;
		// 新しい符号を適用して項を複製
		const newGrade = new ClGrade(this.grade.bases, this.grade.sign * reverseSign);
		return new ClTerm(this.coefs, newGrade, this.count);
	}

	/**
	 * @param {ClTerm} term1
	 * @param {ClTerm} term2
	 * @param {number[]} metric
	 * @returns {ClTerm}
	 */
	static product(term1, term2, metric) {
		// 基底を結合して簡約
		const b1 = term1.grade.bases;
		const b2 = term2.grade.bases;
		const combinedBases = [...b1, ...b2];
		const canonicalizedBases = ClGrade.canonicalizeBases(combinedBases, metric);
		// t1の符号 * t2の符号 * 基底簡約で生じた符号
		const finalSign = term1.grade.sign * term2.grade.sign * canonicalizedBases.sign;
		canonicalizedBases.sign = finalSign;
		// 係数を結合
		const c1 = term1.coefs;
		const c2 = term2.coefs;
		const combinedCount = term1.count * term2.count;
		let combinedCoefs = [...c1, ...c2];
		combinedCoefs.sort();
		return new ClTerm(combinedCoefs, canonicalizedBases, combinedCount);
	}
}

class Cl {
	/** @type {number[]} */
	#metric = [];

	/**
	 * @param {...number} metric
	 */
	constructor(...metric) {
		this.#metric = [...metric];
	}

	/**
	 * @param {ClTerm[]} v
	 * @param {ClTerm[][]} Ms
	 */
	sandwich(v, Ms) {
		let result = [...v];
		for (const M of Ms) {
			const M_inv = M.map(t => t.reverse());
			const left = this.multiply(M, result);
			result = this.multiply(left, M_inv);
		}
		Cl.sortTerms(result);
		// グレードと基底ごとにまとめる
		/**
		 * @typedef CoefGroup
		 * @property {number} count
		 * @property {string[]} coefs
		 */
		/**
		 * @typedef GradeGroup
		 * @property {ClGrade} grade
		 * @property {Map<string, CoefGroup>} coefMap
		 */
		/**
		 * @type {Map<string, GradeGroup>}
		 */
		const gradeMap = new Map();
		for (const t of result) {
			const gKey = t.grade.key; // 例："1,2"
			const cKey = t.key;       // 例："a*b"
			if (!gradeMap.has(gKey)) {
				gradeMap.set(gKey, {
					grade: new ClGrade(t.grade.bases),
					coefMap: new Map()
				});
			}
			// 符号を考慮した実質的なカウント
			const effectiveCount = t.count * t.grade.sign;
			const gradeGroup = gradeMap.get(gKey);
			if (gradeGroup.coefMap.has(cKey)) {
				let coef = gradeGroup.coefMap.get(cKey);
				coef.count += effectiveCount;
				gradeGroup.coefMap.set(cKey, coef);
			} else {
				gradeGroup.coefMap.set(cKey, {
					coefs: t.coefs,
					count: effectiveCount
				});
			}
		}
		// 集計したMapを扱いやすい配列形式に整形して返す
		const finalReport = [];
		for (const [gKey, gradeGroup] of gradeMap) {
			const coefList = [];
			for (const [cKey, coefGroup] of gradeGroup.coefMap) {
				if (coefGroup.count === 0) {
					continue;
				}
				coefList.push({
					key: cKey,
					count: coefGroup.count, // 正負を含む数値（例: 2 や -1）
					coefs: coefGroup.coefs
				});
			}
			if (coefList.length > 0) {
				finalReport.push({
					// 表示用のヘルパー文字列：例 "(2*a-1*b)*e1e2"
					display: (() => {
						const inner = coefList.map(coef => {
							const s = coef.count < 0 ? "-" : "+";
							const c = Math.abs(coef.count) === 1 ? "" : (Math.abs(coef.count) + "*");
							const coefStr = coef.key || "1";
							return `${s}${c}${coefStr}`;
						}).join("").replace(/^\+/, ""); // 先頭の+は省略
						return gradeGroup.grade.display === "1" ? inner : `(${inner})*${gradeGroup.grade.display}`;
					})(),
					grade: gradeGroup.grade,
					coefs: coefList
				});
			}
		}
		return finalReport;
	}

	/**
	 * @param {ClTerm[]} M1
	 * @param {ClTerm[]} M2
	 * @returns {ClTerm[]}
	 */
	multiply(M1, M2) {
		const results = [];
		for (const t1 of M1) {
			for (const t2 of M2) {
				results.push(ClTerm.product(t1, t2, this.#metric));
			}
		}
		return Cl.#simplifyTerms(results);
	}

	/**
	 * @param {ClTerm[]} terms
	 */
	static sortTerms(terms) {
		terms.sort((a, b) => {
			// 基底の長さで比較
			const bases_a = a.grade.bases;
			const bases_b = b.grade.bases;
			if (bases_a.length !== bases_b.length) {
				return bases_a.length - bases_b.length;
			}
			// 基底の辞書順で比較
			for (let i = 0; i < bases_a.length; i++) {
				if (bases_a[i] !== bases_b[i]) {
					return bases_a[i] - bases_b[i];
				}
			}
			// 係数の辞書順で比較
			if (a.key < b.key) return -1;
			if (a.key > b.key) return 1;
			return 0;
		});
	}

	/**
	 * @param {ClTerm[]} M
	 * @returns {ClTerm[]}
	 */
	static #simplifyTerms(M) {
		// 基底のキーと係数のキーを組み合わせた一意のマップで集計する
		const sumMap = new Map();
		for (const t of M) {
			// 同類項を識別するためのユニークキー (例: "e1,e2|a*b")
			const compositeKey = `${t.grade.key}|${t.key}`;
			// 実際の符号を考慮した実質的なカウント数 (count * sign)
			const effectiveCount = t.count * t.grade.sign;
			if (sumMap.has(compositeKey)) {
				const existing = sumMap.get(compositeKey);
				existing.effectiveCount += effectiveCount;
			} else {
				// 後でオブジェクトを再構成するために参照を保持
				sumMap.set(compositeKey, {
					coefs: t.coefs,
					gradeBases: t.grade.bases,
					effectiveCount: effectiveCount
				});
			}
		}
		const simplified = [];
		for (const [_, data] of sumMap) {
			if (data.effectiveCount === 0) {
				continue;
			}
			// 最終的な符号と絶対値としてのcountを決定
			const finalSign = data.effectiveCount > 0 ? 1 : -1;
			const finalCount = Math.abs(data.effectiveCount);
			// ClGradeとClTermを生成して結果に追加
			const newGrade = new ClGrade(data.gradeBases, finalSign);
			simplified.push(new ClTerm(data.coefs, newGrade, finalCount));
		}
		return simplified;
	}
}
