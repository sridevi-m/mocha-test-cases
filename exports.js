module.exports = "securifi embedded systems";


module.exports.simpleMsg = "secruifi embeded systems at madhapur";

# funct
  module.exports.funct = function(msg){
 	console.log(msg);
  };
  
# object
 module.exports = {
 	fName : "gowrav",
 	tName : "rahul"
 }
 
// class
 module.exports = function(name,age,desgination,gender){
 	this.name = name;
 	this.age  = age;
 	this.desgination = desgination;
 	this.gender = gender;
 }


//multiple funcitons

exports.fun1 = function(msg1){
	console.log(msg1);
};


exports.fun2 = function(msg2){
	console.log(msg2);
};

exports.fun3 = function(msg3){
	console.log(msg3);
};

// multiple objects
exports.obj1 = {
	fName : "gowrav",
	tName : "rahul"
}

exports.obj2 = {
	fname : "securifi",
	tName : "embedded"
}

exports.obj3 = {
	fName : "vizag",
	tName : "hyderabad"
}

exports.obj4 = {
	fName : "almond",
	tName : "router"
}

exports.fun4 = function(x,y){
    console.log(x*y);
}
