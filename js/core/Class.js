// New idea (30/9/11) - instead of bypassing js object mechanisms,
//	(hence slowing execution and losing other
//	little benefits like predictable use of __proto__ chain
//	and related functions,  and code highlighting)
// lets work with them but make the subclassing mechanisms more fluent


function id(x) { return x }
function do0() {}

function Class() {
	// Second attempt...
	//
	//	all but one arguments are superclasses,
	//	last argument is an object which roughly
	//	corresponds to prototype.
	//
	//	Special property names are reserved:
	//
	//		_init_		initialisation routine
	//
	var arglen = arguments.length
	var _init = null
	var _proto = null
	var _super = null
	var _supers = new Array()
	if (arglen==0) {
		// default new class:
		_init = function() {} // Can't use do0 - will get
			// prototype attached which may be altered
			// distinctly for distinct classes
		_proto = new Object()
		}
	else {
		var proto1 = arguments[arglen - 1]
		_init = proto1["_init_"] || function() {}
		if (arglen > 1) _super = arguments[0]
		else _super = Object
		_proto = new _super	// makes __proto__ chain work
		// Copy list of supers
		for (var i=0; i<arglen-1; i++) _supers.push(arguments[i])
		//  and merge prototypes if more than one super
		if (arglen>2) for (var i=arglen-2; i>=0; i--) {
			// Do backwards to give first-listed higher precedence
			//  this repeats attributes for _supers[0]
			// (which is _super) but they may have been overwritten
			var proto2 = _supers[i].prototype
			if (proto2) for (a in proto2) _proto[a]=proto2[a]
			}
		// Finally merge in new protoype given as last argument
		for (a in proto1) _proto[a]=proto1[a]
		}
	// Wrap it all up and return it
	_init.prototype = _proto
	return _init
	}




function subclass1(fun) {		// earlier version - forgot prototypes
	// Make a subclass of all the given classes
	//  (passed as unnamed arguments after fun)
	//  with a constructor which calls all the parent
	//  constructors (in the order the parents are given)
	//  and then the given function fun
	// Arguments for the new constructor are arrays / nulls
	//  for the individual parent constructors followed
	//  by the arguments for fun (MAYBE ALSO AS ARRAY? - CAN'T SLICE arguments)
	var parents = arguments.slice(1)
	// DON'T USE : var out = new Function(...)  !!
	var np = parents.length
	var out = fun	// fun IS the constructor if no parent classes
	if (np) {
		var code = "function("
		for (i=0; i<np; i++)
			code = code + "p" + i + ","
		code = code + "pf) { "
		for (i=0; i<np; i++)
			code = code + parents[i].name + 
				".apply(this,p" + i + "); "
		code = code + "fun.apply(this,arguments.slice(" + np + ") }"
		out = eval(code)
		}
	return out
	}


