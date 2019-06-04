var assert = require('assert');
var calc = require("./calc.js");


describe("calc test",function(){
	 it("returns 4+5=9",function(done){
	 	assert.equal(calc.add(4,5), 9);
   
		done();
	});

it("returns 4*5=20",function(done){
	 	assert.equal(calc.mul(4,5), 20);
   
		done();
	});

it("returns 5-4=1",function(done){
	 	assert.equal(calc.sub(5,4), 1);
   
		done();
	});
	
});
