var calc = require("./calc.js");
var assert = require('assert');

describe("calc test",function(){
	it("returns 4+5=9",function(done){
		assert.equal(calc.add(4,5), 9);
		done();
	})
});
