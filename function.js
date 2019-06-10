exports.add = function(i, j) {
	return i + j;
};

exports.mul = function(i,j){
	return i*j;
};

exports.sub = function(i,j){
	return i-j;
};

exports.div = function(i,j){
	return i/j;
};

exports.fun = function(x,y){
	if(x==y){
		return "x and y are equal"
	}else{
		return "x and y are not equal"
	}
};
 
exports.fun_one = function(){
	return "securifi emebedded systems"
};
