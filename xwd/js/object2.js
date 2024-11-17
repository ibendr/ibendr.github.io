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

function arrayWithout( l , x ) {
        s = l.slice( ) ;
        while ( ( i = s.indexOf( x ) ) > -1 ) {
                s = s.slice( 0 , i ).concat( s.slice( i + 1 ) ) ;
        }
        return s ;
}

// Describing objects, usually for debugging purposes
function describe(x,brief) {
	var v,out=""
	for (a in x) {
		try {v = x[a]} catch (e) {v = "--UNABLE TO RETRIEVE VALUE--"}
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
	
// The identity function - often handy.
function funId(x) { return x }

// shorthand to apply a series of functions of one variable (composition)
doFns = function ( L , x ) {
    var y = x ;
    if ( L ) {
	L.forEach( function ( f ) { 
	    y = f( y ) } ) ;
    }    return y }

// grab an array of the keys of a dictionary object

function dictKeys( obj ) { return Object.keys( obj );
//   out = [];
//   for ( var key in obj ) out.push( key );
//   return out;
}

// modulus that behaves properly - i.e. always returns 0 ... m-1 even with negative input
function mod( i , m ) { return ( i < 0 ) ? ( i % m ) + m : ( i % m ) ; }

// extract integers from string, ignoring material in-between
// character-by-character - easier in the end!
function parseInts( s , allowNeg ) {
    var ns = [] ;
    var n = 0 ;
    var sign = 1 ;
    var live = false ;
    ( s + '.' ).split( '' ).forEach( function( c ) {
        d = parseInt( c ) ;
        if ( isNaN( d ) ) {
            // ignore non-digits , but store number if we've read one
            if ( live ) {
                ns.push( sign * n ) ;
                live = false ;
                n = 0 ;
            }
            // but look out for minus sign just before a number
            sign = ( allowNeg && ( c == '-' ) ) ? -1 : 1 ;
        }
        else {
            n = 10 * n + d ;
            live = true ;
        }
    }) ;
    return ns ;
}
function parseURL( url ) {
    // return an object describing elements of the URL
    var urlParts = { } ;
    var urlQindex = url.indexOf( '?' ) + 1 ;
    var urlStem = urlQindex ? url.slice( 0 , urlQindex - 1 ) : url ;
    var urlCindex = urlStem.indexOf( ':' ) ;
    urlParts[ "protocol" ] = urlCindex ? urlStem.slice( 0 , urlCindex ) : '' ;
    urlStem = urlStem.slice( urlCindex + 1 ) ;
    var urlSindex = urlStem.lastIndexOf( '/' ) ;
    urlParts[ "docRoot"  ] = urlStem.slice( 0 , urlSindex ) ;
    urlParts[ "filename" ] = urlStem.slice( urlSindex + 1 ) ;
    var extr = ( urlExtra = urlQindex ? url.slice( urlQindex ) : '' ) ;
    if ( extr ) {
	var extraParts = extr.split( '&' ) ;
	extraParts.forEach( function ( part ) {
	    var eqIndex =  part.indexOf( '=' ) ;
	    if ( eqIndex > 0 ) {
		urlParts[ part.slice( 0 , eqIndex ) ] = part.slice( eqIndex + 1 ) ;
	    }
	} ) ;
    }
    return urlParts ;
}
//  sum a list of numbers
function sum( l ) { return l.reduce( function( x,y ) { return x+y } , 0 ) }
function concat( a , b ) { return a.concat( b ) }
// chr and ord
chr = String.fromCharCode
ord = function( s , i ) { return s.charCodeAt( i || 0 ) }
// function to treat { } as dictionary of lists
function listDictAdd( l , i , x ) {
  // make new list if first item by this index
  if ( ! ( i in l ) ) l[ i ] = [ ] ;
  l[ i ].push( x )
}
// convert calculated pixel distances into string with integer and "px"
var stUnits = "px"
function stSiz( x ) { return Math.round( x ) + stUnits ; }

// Simple shorthand for creating an element with a particular parent and class(es)
// Saves importing full dom module
// NOTE: this may duplicate the definition in other modules, so beware of possible conflicts
// Initially, it was lifted verbatim from xwdInterfaceHtml.js
function elem( tag , pa , clss ) {
    var el = document.createElement( tag ) ;
    if ( pa ) {
	pa.appendChild( el ) ;
    }
    if ( clss ) {
	if ( ! ( clss instanceof Array ) ) clss = [ clss ] ;
	clss.forEach( function ( cls ) {
	    el.classList.add( cls ) ;
	} ) ;
    }
    return el ;
}
function elemInsert( pa , kid ) {
    // put kid as FIRST element of pa
    pa.insertBefore( kid , pa.firstElementChild ) ;
}
function last( L ) {
    // last element of an array
    if ( L instanceof Array ) {
	return L[ L.length - 1 ];
    }
}

// convert calculated pixel distances into string with integer and "px" - duplicate of same in object2.js

var stUnits = "px"
// round number x to n decimals
function rndDec( x , n ) {
    return Math.round( x * 10 ** ( n || 0 ) ) / 10 ** ( n || 0 ) ;
}
function stSiz( x , n ) { return ( n ? rndDec( x , n ) : Math.round( x ) ) + stUnits ; }

// function clog( x ) { console.log( x ) ; }
clog = console.log ;
