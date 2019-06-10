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

it("returns 10/2 ==5",function(done){
	assert.equal(calc.div(10,2), 5)
	done();
   });

it("fun checking",function(){
	assert.equal(calc.fun(19,19),"x and y are equal")
    });

it("function",function(){
	assert.equal(calc.fun_one(), "securifi emebedded systems")
   });

});

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

describe('Array', function() {
  describe('#indexOf()', function() {
    // pending test below
    it('should return -1 when the value is not present');
  });
});


describe('a suite of tests', function() {
   this.timeout(9000);

  it('should take less than 500ms', function(done) {
  	assert.equal(calc.div(10,2), 5)
    setTimeout(done, 2000);
  });
});
