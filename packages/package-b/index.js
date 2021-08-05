const packageA = require("package-a");

const _ = require("lodash");
console.log("a22", packageA, packageA.a);

console.log("isEmpty", _.isEmpty(""));
