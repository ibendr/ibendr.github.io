// OBJECT

/* Miscellaneous functions for OOP
*/

function _array(L) {
	// Create an Array object from an array-like object
	// Implemented to overcome problems with the arguments
	// 	array not actually being one.
	if (L.length!=undefined) {
		out = new Array()
		for (i=0; i<L.length; i++)
			if (L[i]) out[i] = L[i]
		return out
	}	}

function merge() {
	// Copy attributes of [multiple] objects into single new one
	// With one argument, returns a shallow clone, as does .slice(0)
	var out={}
	for (var i=0;i<arguments.length;i++) {
		var Y=arguments[i] 
		for (var a in Y) out[a]=Y[a]
		}
	return out
	}

function mergeIn(X) {  // In-place merge:
	// Copy attributes of 2nd,3rd,... objects into first
	for (var i=1;i<arguments.length;i++) {
		var Y=arguments[i]
		for (var a in Y) X[a]=Y[a]
	}	}

function func(str) { // evaluate (run-time compile) a function
	var it;	return eval("it=function"+str) }

function newapply(cls,args) { // Shorthand to pass args to constructor
	var it = new cls // hopefully gets protoype properties only
	cls.apply(it,args)
	return it
	}



// Describing objects, usually for debugging purposes
function describe(x,brief) {
	var v,out=""
	for (a in x) {
		try {v = x[a]} catch (e) {v = "--UNABLE TO RETIREVE VALUE--"}
		if ( (!brief) || ( v && ((typeof v)!="function") && (a!=a.toUpperCase()) ) )
			out+='\n'+a+': '+v
	  }
	return out
	}
// shorthand
function ad(x,b) { alert(describe(x,b)) }

// an alert that eventually gives up,  handy in some debugging situations
var _aalert_cnt = 0
var _aalert_max = 5	// how many to show before staaarting to skip them
var _aalert_xtra = 1000	// how often to show one after skipping starts
function aalert(m) {
  if ( ( _aalert_cnt++ < _aalert_max ) || ( ( _aalert_cnt % _aalert_xtra ) == 0 ) )
	return alert(m)
	}

// An extra string method to capitilise first letters of words
String.prototype.toLeadUpperCase = function(sep) {
	// sep is optional argument - string of separator characters
	sep = sep || " "
	out = ""
	upper = true
	for (i=0; i<this.length; i++) {
		c = this[i]
		if (upper) c = c.toUpperCase()
		upper = (sep.indexOf(c) > -1)
		out += c
		}
	return out
	}