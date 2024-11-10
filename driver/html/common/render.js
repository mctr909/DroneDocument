/// <reference path="math.js"/>
/// <reference path="model.js"/>

class AttributeVar {
	/**
	 * WebGLコンテキスト
	 * @type {WebGLRenderingContext}
	 */
	#gl;
	/**
	 * 頂点
	 * @type {GLuint}
	 */
	#vertex;

	/**
	 * @param {WebGLRenderingContext} gl
	 * @param {WebGLProgram} program
	 */
	constructor(gl, program) {
		this.#gl = gl;
		this.#vertex = gl.getAttribLocation(program, "vertex");
	}

	/**
	 * VBO/IBOをバインド
	 * @param {ModelAttr} modelAttr
	 */
	bindBuffer(modelAttr) {
		this.#bindVbo(modelAttr.ver, this.#vertex, WebGLRenderingContext.FLOAT, 3);
		this.#gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, modelAttr.idx);
	}

	/**
	 * VBO/IBOを生成
	 * @param {Model} model
	 * @returns {ModelAttr}
	 */
	createBuffer(model) {
		let attr = new ModelAttr();
		attr.ver = this.#createVbo(model.ver);
		attr.idx = this.#createIbo(model.idx);
		attr.grp = [];
		for (let i=0; i<model.grp.length; i++) {
			attr.grp.push(model.grp[i]);
		}
		return attr;
	}

	/**
	 * VBO/IBOを削除
	 * @param {ModelAttr} modelAttr
	 */
	removeBuffer(modelAttr) {
		this.#gl.deleteBuffer(modelAttr.ver);
		this.#gl.deleteBuffer(modelAttr.idx);
	}

	/**
	 * VBOをバインド
	 * @param {WebGLBuffer} vbo
	 * @param {GLuint} location
	 * @param {GLenum} type
	 * @param {GLint} size
	 */
	#bindVbo(vbo, location, type, size) {
		this.#gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, vbo);
		this.#gl.enableVertexAttribArray(location);
		this.#gl.vertexAttribPointer(location, size, type, false, 0, 0);
	}

	/**
	 * VBOを生成
	 * @param {number[]} data
	 */
	#createVbo(data) {
		let vbo = this.#gl.createBuffer();
		let array = new Float32Array(data);
		this.#gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, vbo);
		this.#gl.bufferData(WebGLRenderingContext.ARRAY_BUFFER, array, WebGLRenderingContext.STATIC_DRAW);
		this.#gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, null);
		return vbo;
	}

	/**
	 * IBOを生成
	 * @param {number[]} data
	 */
	#createIbo(data) {
		let ibo = this.#gl.createBuffer();
		let array = new Int16Array(data);
		this.#gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, ibo);
		this.#gl.bufferData(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, array, WebGLRenderingContext.STATIC_DRAW);
		this.#gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, null);
		return ibo;
	}
}

class UniformVar {
	/**
	 * WebGLコンテキスト
	 * @type {WebGLRenderingContext}
	 */
	#gl;
	/**
	 * MVP行列
	 * @type {WebGLUniformLocation}
	 */
	#mvpMatrix;
	/**
	 * モデル行列
	 * @type {WebGLUniformLocation}
	 */
	#mMatrix;
	/**
	 * モデル逆行列
	 * @type {WebGLUniformLocation}
	 */
	#invMatrix;
	/**
	 * モデル色
	 * @type {WebGLUniformLocation}
	 */
	#color;
	/**
	 * 視線方向
	 * @type {WebGLUniformLocation}
	 */
	#eyeDirection;
	/**
	 * 光源位置
	 * @type {WebGLUniformLocation}
	 */
	#lightPosition;
	/**
	 * 光源色
	 * @type {WebGLUniformLocation}
	 */
	#ambientColor;

	#matV = new mat4();
	#matVP = new mat4();
	#matMVP = new mat4();
	#matInvM = new mat4();

	/**
	 * @param {WebGLRenderingContext} gl
	 * @param {WebGLProgram} program
	 */
	constructor(gl, program) {
		this.#gl = gl;
		this.#mvpMatrix = gl.getUniformLocation(program, "mvpMatrix");
		this.#mMatrix = gl.getUniformLocation(program, "mMatrix");
		this.#invMatrix = gl.getUniformLocation(program, "invMatrix");
		this.#color = gl.getUniformLocation(program, "color");
		this.#eyeDirection = gl.getUniformLocation(program, "eyeDirection");
		this.#lightPosition = gl.getUniformLocation(program, "lightPosition");
		this.#ambientColor = gl.getUniformLocation(program, "ambientColor");
	}

	/**
	 * モデルを描画
	 * @param {mat4} matM
	 * @param {Group} group
	 */
	drawModel(matM, group) {
		// uniformへ座標変換行列を登録
		this.#matMVP.setMul(this.#matVP, matM);
		this.#matInvM.setInverse(matM);
		this.#gl.uniformMatrix4fv(this.#mvpMatrix, false, this.#matMVP.Array);
		this.#gl.uniformMatrix4fv(this.#mMatrix, false, matM.Array);
		this.#gl.uniformMatrix4fv(this.#invMatrix, false, this.#matInvM.Array);
		// モデルを描画
		this.#gl.uniform4fv(this.#color, group.color);
		this.#gl.drawElements(WebGLRenderingContext.TRIANGLES, group.size, WebGLRenderingContext.UNSIGNED_SHORT, group.ofs);
	}

	/**
	 * カメラ設定を適用
	 * @param {mat4} matP
	 * @param {Cam} cam
	 */
	applyCamera(matP, cam) {
		// ビュー×プロジェクション座標変換行列
		const d = 100;
		let eye = [0, d*Math.sin(cam.elevation), d*Math.cos(cam.elevation)];
		let up = [Math.sin(cam.tilte), Math.cos(cam.tilte), 0]
		this.#matV.setView(cam.position, eye, up, cam.azimuth);
		this.#matVP.setMul(matP, this.#matV);
		// uniformへ視線を登録
		this.#gl.uniform3fv(this.#eyeDirection, eye);
	}

	/**
	 * 光源設定を適用
	 * @param {Light} light
	 */
	applyLight(light) {
		// uniformへ光源を登録
		this.#gl.uniform3fv(this.#lightPosition, light.position);
		this.#gl.uniform4fv(this.#ambientColor, light.ambientColor);
	}
}

class ModelAttr {
	/**
	 * 頂点
	 * @type {WebGLBuffer}
	 */
	ver;
	/**
	 * インデックス
	 * @type {WebGLBuffer}
	 */
	idx;
	/**
	 * グループ
	 * @type {Group[]}
	 */
	grp;
}

class Light {
	/**
	 * 位置
	 * @type {number[]}
	 */
	position = [0.0, 0.0, 0.0];
	/**
	 * 色
	 * @type {number[]}
	 */
	ambientColor = [0.1, 0.1, 0.1, 1.0];
}

class Cam {
	/**
	 * 位置
	 * @type {number[]}
	 */
	position = [0, 0, 0];
	/**
	 * 方位角
	 * @type {number}
	 */
	azimuth = 0;
	/**
	 * 仰角
	 * @type {number}
	 */
	elevation = 0;
	/**
	 * 姿勢
	 * @type {number[]}
	 */
	tilte = 0;
}

class Render {
	/** @type {HTMLCanvasElement} */
	#canvas;
	/**
	 * WebGLコンテキスト
	 * @type {WebGLRenderingContext}
	 */
	#gl;
	/**
	 * attribute変数
	 * @type {AttributeVar}
	 */
	#attributeVar;
	/**
	 * uniform変数
	 * @type {UniformVar}
	 */
	#uniformVar;

	/**
	 * モデルリスト
	 * @type {Map<string, ModelAttr>}
	 */
	#modelList;
	/**
	 * バインド中モデル
	 * @type {ModelAttr}
	 */
	#bindingModel;
	/**
	 * プロジェクション行列
	 * @type {mat4}
	 */
	#matP;

	/**
	 * カメラ
	 * @type {Cam}
	 */
	Cam;
	/**
	 * 光源
	 * @type {Light}
	 */
	Light;

	get GroupCount() {
		if (null == this.#bindingModel) {
			return 0;
		} else {
			return this.#bindingModel.grp.length;
		}
	}

	/**
	 * @param {HTMLCanvasElement} canvas
	 * @param {number} width
	 * @param {number} height
	 * @param {string} vs
	 * @param {string} fs
	 */
	constructor(canvas, width, height, vs, fs) {
		this.#canvas = canvas;
		this.#canvas.width = width;
		this.#canvas.height = height;

		this.#modelList = new Map();
		this.#bindingModel = null;
		this.#matP = new mat4();
		this.Cam = new Cam();
		this.Light = new Light();

		this.#matP.setPerspective(45, 0.5, 500, width / height);

		this.#gl = this.#canvas.getContext("webgl");
		// 拡張機能を有効化する
		if(!this.#gl.getExtension('OES_standard_derivatives')){
			console.log('OES_standard_derivatives is not supported');
			return;
		}
		this.#gl.enable(WebGLRenderingContext.DEPTH_TEST);
		this.#gl.depthFunc(WebGLRenderingContext.LEQUAL);
		this.#gl.enable(WebGLRenderingContext.CULL_FACE);

		let v_shader = this.#createShader(vs, WebGLRenderingContext.VERTEX_SHADER);
		let f_shader = this.#createShader(fs, WebGLRenderingContext.FRAGMENT_SHADER);
		let program = this.#createProgram(v_shader, f_shader);
		this.#attributeVar = new AttributeVar(this.#gl, program);
		this.#uniformVar = new UniformVar(this.#gl, program);
	}

	/**
	 * シェーダを生成
	 * @param {string} source
	 * @param {GLenum} type
	 * @returns {WebGLShader}
	 */
	#createShader(source, type) {
		let shader = this.#gl.createShader(type);
		this.#gl.shaderSource(shader, source);
		this.#gl.compileShader(shader);
		if (this.#gl.getShaderParameter(shader, WebGLRenderingContext.COMPILE_STATUS)) {
			return shader;
		} else {
			alert(this.#gl.getShaderInfoLog(shader));
			return null;
		}
	}

	/**
	 * プログラムオブジェクトを生成しシェーダをリンク
	 * @param  {...WebGLShader} shaders
	 * @returns {WebGLProgram}
	 */
	#createProgram(...shaders) {
		let program = this.#gl.createProgram();
		for (let i in shaders) {
			this.#gl.attachShader(program, shaders[i]);
		}
		this.#gl.linkProgram(program);
		if (this.#gl.getProgramParameter(program, WebGLRenderingContext.LINK_STATUS)) {
			this.#gl.useProgram(program);
			return program;
		} else {
			alert(this.#gl.getProgramInfoLog(program));
			return null;
		}
	}

	/**
	 * モデルを追加
	 * @param {...Model} models
	 */
	AddModels(...models) {
		for (let i=0; i<models.length; i++) {
			let model = models[i];
			let id = model.id;
			let attr;
			if (this.#modelList.has(id)) {
				attr = this.#modelList.get(id);
				this.#attributeVar.removeBuffer(attr);
			}
			attr = this.#attributeVar.createBuffer(model);
			this.#modelList.set(id, attr);
		}
	}

	/**
	 * モデルを削除
	 * @param  {...string} ids
	 */
	RemoveModels(...ids) {
		for (let i=0; i<ids.length; i++) {
			let id = ids[i];
			if (this.#modelList.has(id)) {
				let attr = this.#modelList.get(id);
				this.#attributeVar.removeBuffer(attr);
				this.#modelList.delete(id);
			}
		}
	}

	/**
	 * モデルをバインド
	 * @param {string} id
	 * @returns {boolean}
	 */
	BindModel(id) {
		if (this.#modelList.has(id)) {
			this.#bindingModel = this.#modelList.get(id);
			this.#attributeVar.bindBuffer(this.#bindingModel);
			return true;
		} else {
			this.#bindingModel = null;
			return false;
		}
	}

	/**
	 * モデル行列を設定して描画
	 * @param {mat4} matM
	 * @param {number} groupIndex
	 */
	DrawModel(matM, groupIndex) {
		if (null == this.#bindingModel) {
			return;
		}
		let grp = this.#bindingModel.grp[groupIndex];
		this.#uniformVar.drawModel(matM, grp);
	}

	/**
	 * カメラ設定を適用
	 */
	ApplyCamera() {
		this.#uniformVar.applyCamera(this.#matP, this.Cam);
	}

	/**
	 * 光源設定を適用
	 */
	ApplyLight() {
		this.#uniformVar.applyLight(this.Light);
	}

	/**
	 * canvasを初期化
	 */
	Clear() {
		this.#gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.#gl.clearDepth(1.0);
		this.#gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
	}

	/**
	 * コンテキストの再描画
	 */
	Flush() {
		this.#gl.flush();
	}
}
