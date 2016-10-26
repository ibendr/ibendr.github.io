// ARRAY

/* Some extra methods for arrays.

Note that UNLIKE builtin array methods,  these are visible
to the    for (x in A) {...}   construct,  which otherwise usually
only returns x="0","1",... for the elements of A.  (On the other
hand the boolean operation (x in A) DOES see builtin methods,
e.g. ("splice" in [1,2,3]) returns true.

*/


Array.prototype.indexOf = function(x) {
	for (var i=0; i<this.length; i++) if (this[i]==x) return i; return -1 }
Array.prototype.remove = function(x) { // removes first instance
	var i=this.indexOf(x);	return (i>-1) && this.splice(i,1) }
Array.prototype.has = function(x) { return (this.indexOf(x)>-1) }
Array.prototype.last = function() { return this[this.length-1] }

function id(x) { return x } // should also be in object

Array.prototype.map = function(f,P)  {  // [f(x) for x in this if P(x)]
	var out=new Array;
	for (var i=0; i<this.length; i++)
		if ( (!P) || P(this[i]) ) out.push((f||id)(this[i]))
	return out }
Array.prototype.suchThat = function(P) { // subset by property
	return this.map(id,P) }	
