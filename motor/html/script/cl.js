class ClV {
	/** @type {string} */
	coef;
	/** @type {number} */
	i;
	/**
	 * @param {string} coef
	 * @param {number} i (0-based index)
	 */
	constructor(coef, i) {
		this.coef = coef;
		this.i = i;
	}
}

class ClB {
	/** @type {string} */
	coef;
	/** @type {number} */
	i;
	/** @type {number} */
	j;
	/**
	 * @param {string} coef
	 * @param {number} i (0-based index)
	 * @param {number} j (0-based index)
	 */
	constructor(coef, i, j) {
		this.coef = coef;
		this.i = i;
		this.j = j;
	}
}

class ClM {
	/** @type {string} */
	scalar;
	/** @type {Array<ClB>} */
	bivectors;
	/**
	 * @param {string} scalar
	 * @param {...ClB} bivectors
	 */
	constructor(scalar, ...bivectors) {
		this.scalar = scalar;
		this.bivectors = bivectors.map(b => new ClB(b.coef, b.i, b.j));
	}
}

class ClGrade {
	/** @type {number} */
	sign;
	/** @type {Array<number>} */
	bases;
	/**
	 * @param {number} sign
	 * @param {Array<number>} bases
	 */
	constructor(sign, bases) {
		this.sign = sign;
		this.bases = bases.map(b => b);
	}
}

class ClCoef {
	/** @type {number} */
	sign;
	/** @type {Array<Array<string>>} */
	coefs;
	/** @type {string} */
	name;
	/**
	 * @param {number} sign
	 * @param {Array<Array<string>>} coefs
	 */
	constructor(sign, coefs) {
		this.sign = sign;
		this.coefs = coefs.map(c => [...c]);
		this.name = coefs.join("*");
	}
}

class ClTerm {
	/** @type {ClGrade} */
	grade;
	/** @type {Array<ClCoef>} */
	coefs;
	/** @type {string} */
	gradeKey;
	/**
	 * @param {ClGrade} grade
	 * @param {Array<ClCoef>} coefs
	 */
	constructor(grade, coefs) {
		this.grade = new ClGrade(grade.sign, grade.bases);
		this.coefs = coefs.map(c => new ClCoef(c.sign, c.coefs));
		this.gradeKey = this.grade.bases.join(",");
	}
}

class Cl {
	/** @type {Array<number>} */
	#bases = [];

	/**
	 * @param {...number} bases
	 */
	constructor(...bases) {
		this.#bases = [...bases];
	}

	/**
	 * @param {Array<ClV>} vector
	 * @param {...ClM} motor
	 */
	createMotor(vector, ...motor) {
		/** @type {Array<ClTerm>} */
		let MvMr = [];
		for (const v of vector) {
			MvMr.push(new ClTerm(new ClGrade(1, [v.i]), [new ClCoef(1, [[v.coef]])]));
		}

		for (const m of motor) {
			let mScalar = m.scalar;
			let mBivectors = m.bivectors;
			// 左作用
			/** @type {Array<ClTerm>} */
			let Mv = [];
			{
				// スカラー部
				for (const v of MvMr) {
					let mv_s = [new ClCoef(1, [[mScalar]]), ...v.coefs];
					Mv.push(new ClTerm(new ClGrade(v.grade.sign, v.grade.bases), mv_s));
				}
				// 二重ベクトル部
				for (const mb of mBivectors) {
					let mCoef = mb.coef;
					let mi = mb.i;
					let mj = mb.j;
					if (mi === mj) {
						throw new Error(mCoef + "は(ei≠ej)としてください");
					}
					for (const v of MvMr) {
						let mv_b = [new ClCoef(1, [[mCoef]]), ...v.coefs];
						let bases;
						if (v.grade.sign < 0) {
							bases = [mj, mi, ...v.grade.bases];
						} else {
							bases = [mi, mj, ...v.grade.bases];
						}
						let grade = this.#canonicalizeBases(bases);
						Mv.push(new ClTerm(grade, mv_b));
					}
				}
				// 同類項をまとめる
				this.#grouping(Mv);
			}

			// リバース
			{
				for (const mv of Mv) {
					let mvCoefs = mv.coefs;
					let mvGrade = mv.grade;
					// スカラー部
					let mvm_s = [...mvCoefs, new ClCoef(1, [[mScalar]])];
					MvMr.push(new ClTerm(mvGrade, mvm_s));
					// 二重ベクトル部
					for (const mb of mBivectors) {
						let mvmr_b = [...mvCoefs, new ClCoef(-1, [[mb.coef]])];
						let grade = this.#canonicalizeBases([...mvGrade.bases, mb.i, mb.j]);
						MvMr.push(new ClTerm(grade, mvmr_b));
					}
				}
				// 同類項をまとめる
				this.#grouping(MvMr);
			}
		}

		// 表示
		this.#sort(MvMr);
		let line = "";
		for (const t of MvMr) {
			line += "(";
			t.coefs.forEach((c, idx) => {
				if (idx > 0) {
					line += c.sign < 0 ? " - " : " + ";
				} else if (c.sign < 0) {
					line += "-";
				}
				line += c.name;
			});
			line += ")";
			if (t.grade.bases.length != 0) {
				line += "e";
				for (const b of t.grade.bases) {
					line += b;
				}
			}
			line += "<br>";
		}
		document.getElementById("disp").innerHTML = line;
	}

	/**
	 * @param {Array<ClTerm>} terms
	 */
	#sort(terms) {
		terms.sort((a, b) => {
			let diffCount = a.grade.bases.length - b.grade.bases.length;
			if (diffCount === 0) {
				let diffLen = a.gradeKey.length - b.gradeKey.length;
				if (diffLen === 0) {
					return a.gradeKey.localeCompare(b.gradeKey);
				} else {
					return diffLen;
				}
			} else {
				return diffCount;
			}
		});
	}

	/**
	 * @param {Array<number>} bases
	 * @returns {ClGrade}
	 */
	#canonicalizeBases(bases) {
		let list = [...bases];
		let sign = 1;
		let changed = true;
		while (changed) {
			changed = false;
			for (let i = 0; i < list.length - 1; i++) {
				// 大きい添字を右へ送る
				if (list[i] > list[i + 1]) {
					[list[i], list[i + 1]] = [list[i + 1], list[i]];
					sign *= -1;
					changed = true;
				}
				// ei*ei = gi
				if (list[i] === list[i + 1]) {
					sign *= this.#bases[list[i]];
					list.splice(i, 2);
					changed = true;
					break;
				}
			}
		}
		return new ClGrade(sign, list);
	}

	/**
	 * @param {Array<ClTerm>} terms
	 */
	#grouping(terms) {
		/**
		 * @typedef {Object} CoefGroup
		 * @property {number} count
		 * @property {Array<string>} coefs
		 */
		/**
		 * @typedef Grade
		 * @property {Map<string, CoefGroup>} coefGroupMap
		 * @property {Array<number>} bases
		 */
		/** @type {Map<string, Grade>} */
		const gradeList = new Map();
		for (const term of terms) {
			let coefSign = term.grade.sign;

			// 項の係数を集める
			/** @type {Array<string>} */
			const coefs = [];
			for (const c of term.coefs) {
				coefSign *= c.sign;
				coefs.push(...c.coefs);
			}
			coefs.sort();

			// 対象のグレードを探し、なければ作る
			/** @type {Grade} */
			let grade;
			const gradeKey = term.gradeKey;
			if (gradeList.has(gradeKey)) {
				grade = gradeList.get(gradeKey);
			} else {
				grade = {
					coefGroupMap: new Map(),
					bases: [...term.grade.bases]
				};
				gradeList.set(gradeKey, grade);
			}

			// 係数をまとめる
			const groupedCoef = coefs.join("*");
			if (grade.coefGroupMap.has(groupedCoef)) {
				let group = grade.coefGroupMap.get(groupedCoef);
				group.count += coefSign;
			} else {
				grade.coefGroupMap.set(groupedCoef, {
					count: coefSign,
					coefs: [...coefs]
				});
			}
		}

		// グレード毎にまとめる
		terms.length = 0;
		for (const g of gradeList.values()) {
			const groupedCoefs = [];
			for (const [key, group] of g.coefGroupMap) {
				if (group.count === 0) {
					continue;
				}
				const sign = group.count < 0 ? -1 : 1;
				const abs = Math.abs(group.count);
				let coefs;
				if (key === "") {
					coefs = [[String(abs)]];
				} else if (abs === 1) {
					coefs = [[...group.coefs]];
				} else {
					coefs = [[abs, ...group.coefs]];
				}
				groupedCoefs.push(new ClCoef(sign, coefs));
			}
			if (groupedCoefs.length === 0) {
				continue;
			}
			terms.push(new ClTerm(new ClGrade(1, g.bases), groupedCoefs));
		}
	}
}
