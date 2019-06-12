var msg = require("./variables.js");
console.log(msg);

var msg = require("./variables.js");
console.log(msg.simpleMsg);

var msg = require("./variables.js");
msg.funct("hello india")


var msg  = require("./variables.js");
console.log(msg.fName+ " "+ msg.tName);


var msg = require("./variables.js");
var msg2 = new msg("gowrav",23, "node js developer", "male");
console.log(msg2.name+ " "+ msg2.age+ " "+msg2.desgination+ " "+msg2.gender);


// multiple functions import

var msgs =require("./variables.js");
msgs.fun1("india");
msgs.fun2("pakistan");
msgs.fun3("ammerica");
msgs.fun4(5,6);


// import multiple objects
var msg = require("./variables.js");
console.log(msg.obj4.tName);
console.log(msg.obj2.fName);
