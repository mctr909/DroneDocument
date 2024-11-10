class Group {
	/** @type {number} */
	ofs;
	/** @type {number} */
	size;
	/** @type {number[]} */
	color;
	/** @type {string} */
	name;
	/** @type {string} */
	mtlFile;
	/** @type {string} */
	mtlName;
	/**
	 * @param {string} name
	 * @param {number} ofs
	 * @param {number} size
	 */
	constructor(name, ofs, size=0) {
		this.ofs = ofs;
		this.size = size;
		this.name = name;
		this.color = [0,1,0,1];
		this.mtlFile = "";
		this.mtlName = "";
	}
}

class Mtl {
	/** @type {string} */
	fileName;
	/** @type {string} */
	id;
	/** @type {number} */
	kdr;
	/** @type {number} */
	kdg;
	/** @type {number} */
	kdb;
}

class Model {
	/** @type {string} */
	id;
	/** @type {number[]} */
	ver = [];
	/** @type {number[]} */
	idx = [];
	/** @type {Group[]} */
	grp = [];
	/** @type {Mtl[]} */
	mtl = [];

	/**
	 * @param {string} fileName
	 * @param {string} text
	 */
	loadFile(fileName, text) {
		if (fileName.indexOf(".obj") >= 0) {
			this.#loadObj(fileName, text);
		}
		if (fileName.indexOf(".mtl") >= 0) {
			this.#loadMtl(fileName, text);
		}
		for (let iG=0; iG<this.grp.length; iG++) {
			let g = this.grp[iG];
			for (let iM=0; iM<this.mtl.length; iM++) {
				let m = this.mtl[iM];
				if (m.fileName == g.mtlFile && m.id == g.mtlName) {
					g.color[0] = m.kdr;
					g.color[1] = m.kdg;
					g.color[2] = m.kdb;
					break;
				} 
			}
		}
	}

	/**
	 * @param {string} fileName
	 * @param {string} text
	 */
	#loadObj(fileName, text) {
		let lines = text
			.replace(/\r\n/g, "\n")
			.replace(/\r/g, "\n")
			.split("\n");
		this.id = fileName;
		let mtllib = "";
		let usemtl = "";
		/** @type {Group} */
		let grp = null;
		for (let i=0; i<lines.length; i++) {
			let line = lines[i];
			let cols = line.split(" ");
			switch (cols[0]) {
			case "mtllib":
				mtllib = cols[1];
				break;
			case "usemtl":
				usemtl = cols[1];
				break;
			case "v":
				this.ver.push(cols[1]*1, cols[2]*1, cols[3]*1);
				break;
			case "g":
				grp = new Group(cols[1], this.idx.length);
				this.grp.push(grp);
				break;
			case "f":
				if (grp == null) {
					grp = new Group("", 0);
					this.grp.push(grp);
				}
				grp.mtlFile = mtllib;
				grp.mtlName = usemtl;
				this.#toTriangle(grp, cols);
				break;
			}
		}
	}

	/**
	 * @param {string} fileName
	 * @param {string} text
	 */
	#loadMtl(fileName, text) {
		let lines = text
			.replace(/\r\n/g, "\n")
			.replace(/\r/g, "\n")
			.split("\n");
		/** @type {Mtl} */
		let mtl = null;
		for (let i=0; i<lines.length; i++) {
			let line = lines[i];
			let cols = line.split(" ");
			switch (cols[0]) {
			case "newmtl":
				mtl = new Mtl();
				mtl.fileName = fileName;
				mtl.id = cols[1];
				this.mtl.push(mtl);
				break;
			case "Kd":
				mtl.kdr = cols[1]*1;
				mtl.kdg = cols[2]*1;
				mtl.kdb = cols[3]*1;
				break;
			}
		}
	}

	/**
	 * @param {Group} grp
	 * @param {string[]} cols
	 */
	#toTriangle(grp, cols) {
		const N = cols.length - 1;
		const NH = N >>> 1;
		for (let i = 1; i < NH; i++) {
			let bl = cols[i].split("/")[0] - 1;
			let br = cols[i + 1].split("/")[0] - 1;
			let tr = cols[N - i].split("/")[0] - 1;
			let tl = cols[N - i + 1].split("/")[0] - 1;
			this.idx.push(tl, bl, br);
			this.idx.push(br, tr, tl);
			grp.size += 6;
		}
		if (N%2 != 0) {
			let br = cols[NH].split("/")[0] - 1;
			let tr = cols[NH+1].split("/")[0] - 1;
			let tl = cols[NH+2].split("/")[0] - 1;
			this.idx.push(br, tr, tl);
			grp.size += 3;
		}
	}
}
