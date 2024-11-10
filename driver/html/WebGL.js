/// <reference path="common/math.js"/>
/// <reference path="common/model.js"/>
/// <reference path="common/render.js"/>
/// <reference path="common/drawer.js"/>
/// <reference path="common/viewpad.js"/>
/** @type {Render} */
let gRender;
/** @type {ViewPad} */
let gViewPad;
let gScale;
let gObjFileName = "";
function loop() {
	gViewPad.update();

	gRender.Clear();

	// カメラの位置カメラの姿勢
	gRender.Cam.position = gViewPad.position;
	gRender.Cam.azimuth = gViewPad.azimuth;
	gRender.Cam.elevation = gViewPad.elevation;
	gRender.Cam.tilte = gViewPad.tilte;
	gRender.ApplyCamera();

	// 光源の向き, 環境光の色
	gRender.Light.position = [0, 1000, 1000];
	gRender.Light.ambientColor = [0.1, 0.1, 0.1, 1];
	gRender.ApplyLight();

	// OBJファイルモデル
	if (gRender.BindModel(gObjFileName)) {
		let s = gScale.value * 0.1;
		let matScale = new mat4();
		matScale.set([
			s,0,0,0,
			0,s,0,0,
			0,0,s,0,
			0,0,0,1
		]);
		let matModel = new mat4();
		matModel.setIdentity();
		matModel.setMul(matModel, matScale);
		for (let i=0; i<gRender.GroupCount; i++) {
			gRender.DrawModel(matModel, i);
		}
	}

	gRender.Flush();
	window.requestAnimationFrame(loop);
}

(function() {
	window.requestAnimationFrame =
		window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.msRequestAnimationFrame
	;
})();

onload = function() {
	document.getElementById("file1").addEventListener("change", function() {
		/** @type {File[]} */
		let files = document.getElementById('file1').files;
		let model = new Model();
		for (let i = 0; i < files.length; i++) {
			let reader = new FileReader();
			reader.onload = function(ev) {
				gObjFileName = files[i].name;
				model.loadFile(gObjFileName, ev.target.result + "");
				gRender.AddModels(model);
			};
			reader.readAsText(files[i], "utf-8");
		}
	});
	gScale = document.getElementById('scale');
	gScale.style.width = 200;
	gViewPad = new ViewPad("viewpad", 200, 200);
	gViewPad.setElevation(45);
	gRender = new Render(
		document.getElementById("canvas"),
		800, 600,
		document.getElementById("vs").innerHTML,
		document.getElementById("fs").innerHTML
	);
	loop();
};
