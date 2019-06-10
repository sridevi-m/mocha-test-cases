var assert = require('assert');
var calc = require("./calc.js");


describe("calc test",function(){
	this.timeout(10000)
	 it("returns 4+5=9",function(done){
	 	assert.equal(calc.add(4,5), 9);
		setTimeout(done,2000);
	});

it("returns 4*5=20",function(done){
	 	assert.equal(calc.mul(4,5), 20);
		setTimeout(done,2000);
	});

it("returns 5-4=1",function(done){
	 	assert.equal(calc.sub(5,4), 1);
		setTimeout(done,2000);
	});

it("returns 10/2 ==5",function(done){
	assert.equal(calc.div(10,2), 5)
	setTimeout(done,2000);
   });

it("x and y are equal",function(done){
	assert.equal(calc.fun(19,19),"x and y are equal")
	    	setTimeout(done,2000);
    });

it("securifi emebedded systems",function(done){
	assert.equal(calc.fun_one(), "securifi emebedded systems")
		setTimeout(done,2000);
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

describe("test case timeout", function(){    // it will excute after 2 secs 
	this.timeout(10000);
		it("should take 2sec", function(done){
			assert.equal(calc.fun_three(),"please subscribe it")
			setTimeout(done,2000);

		});
});

