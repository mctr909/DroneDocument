/// <reference path="cl.js" />
let v = [
	new ClTerm(["v1"], new ClGrade([1])),
	new ClTerm(["v2"], new ClGrade([2])),
	new ClTerm(["v3"], new ClGrade([3]))
];
let R = [
	new ClTerm(["r"], new ClGrade([])),
	new ClTerm(["r23"], new ClGrade([2, 3])),
	new ClTerm(["r31"], new ClGrade([3, 1])),
	new ClTerm(["r12"], new ClGrade([1, 2]))
];
let T = [
	new ClTerm(["t"], new ClGrade([])),
	new ClTerm(["t1"], new ClGrade([4,1])),
	new ClTerm(["t2"], new ClGrade([4,2])),
	new ClTerm(["t3"], new ClGrade([4,3]))
];

let c = new Cl(-1, -1, -1, 0);
let M = c.sandwich(v, [R]);
let str = "";
for (let i of M) {
	str += i.display + "<br>";
}
document.getElementById("disp").innerHTML = str;
