// OBJECT

/* Miscellaneous functions for OOP  updated using js6 from Sep 2025
*/


// For use in proxy extensions (see proxy-extend.js for example usage)
const defaultGetSet = {
    get( it , prop )        { return ( ( typeof prop != "string" ) || ( prop in it ) ) ?   it[ prop ]         : it._get( prop       ) ; } ,
    set( it , prop , val )  { return ( ( typeof prop != "string" ) || ( prop in it ) ) ? ( it[ prop ] = val ) : it._set( prop , val ) ; }
} ;

// wrap a function in one that keeps a record of previously computed.
// main purpose is to generate quasi-primitives which show up as equal


function preCompute( fun ) {
    let G = globalThis ;
    let name = fun.name ;
    if ( G[ name ] == fun ) { // check if things are making sense ?
	const extr = ext => { let out = name ; while ( out in G ) out+= ext ; return out ; }
	let made   = ( G[ extr( '_made'  ) ] = { } ) ;
	let inner  = ( G[ extr( '_inner' ) ] = fun ) ;
	G[ name ] = ( ...args ) => {
	    let key = args.join('~~') ;
	    return made?.[ key ] ?? ( made[ key ] = fun( ...args ) ) ;
	} ;
	G[ extr( '_kill' ) ] = ( ...args ) => { // forced garbage collection
	    return delete made[ args.join('~~') ] ;
	} ;
    }
}

function merge( ...args ) {
    // Copy attributes of [multiple] objects into single new one
    // With one argument, returns a shallow clone, as does .slice(0)
    var out = { } ;
    mergeIn( out , ...args ) ;
    return out ;
}

function mergeIn( X , ...args) {  // In-place merge:
	// Copy attributes of 2nd,3rd,... objects into first
    for ( let arg of args ) for ( let ind in arg ) X[ ind ] = arg[ ind ] ;
}

function newapply(cls,args) { // Shorthand to pass args to constructor
	var it = new cls // hopefully gets protoype properties only
	cls.apply( it , args )
	return it
	}

// base 60 - extend digits aka hexadecimal to get 60 possibilities in a single char
// similar to base64 but different (it uses ABC... for 012...)
function NtoB60 ( n ) { return ( n < 60 ) ? chr( 48 + n + 7 * ( n > 9 ) + 6 * ( n > 35 ) ) : NtoB60( Math.floor( n / 60 ) ) + NtoB60( n % 60 ) ; }
function B60toN ( s ) {
    let n = 0
    for ( let i = 0 ; i < s.length ; i++ ) {
	c = s.charCodeAt( i ) ;
	n = 60 * n + ( c - 48 - 7 * ( c > 64 ) - 6 * ( c > 96 ) ) ;
    }
    return n ;
}

// STRINGS

const leadUpper = ( str => str[ 0 ].toUpperCase() + str.slice( 1 ) ) ;

// An extra string method to capitalise first letters of words
const leadsUpper = ( ( str , sep ) => str.split( sep ?? " " ).map( leadUpper ).join( sep ?? " " ) ) ;
	
// identity (for one variable) and null functions - can be handy
const fId = ( x => x ) ;
const f0 = ( () => {} ) ;

// shorthand to apply a series of functions of one variable (composition)
doFns = function ( L , x ) {
    var y = x ;
    for ( let f of L ) y = f( y ) ;
    return y ;
}

// modulus that behaves properly - i.e. always returns 0 ... m-1 even with negative input
//  whereas (-3) % 5 evaluates to -3
function mod( i , m ) { return ( ( i % m ) + m ) % m ; }

// extract integers from string, ignoring material in-between
// character-by-character - easier in the end!
function parseInts( s , allowNeg ) {
    let ns = [] ;
    let n = 0 ;
    let sign = 1 ;
    let live = false ;
    for ( let c of ( s + '.' ).split( '' ) ) {
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
    }
    return ns ;
}


function parseURL( url ) {					// 2025 - u = new URL(document.URL) ; p = u.searchParams ; ...
    // return an object describing elements of the URL			// not quite the same but less work, could be used here
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
//  sum & product of a list of numbers
function sum( l ) { return l.reduce( function( x,y ) { return x+y } , 0 ) }
function prod( l ) { return l.reduce( function( x,y ) { return x*y } , 1 ) }
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
function stSiz( x ) { return Math.round( x ) + stUnits ; }  // 2025 - it may be that fractional pixels sometimes make sense because they may be virtual pixels anyway


// convert calculated pixel distances into string with integer and "px" - duplicate of same in object2.js

var stUnits = "px"
// round number x to n decimals
function rndDec( x , n ) {
    return Math.round( x * 10 ** ( n || 0 ) ) / 10 ** ( n || 0 ) ;
}
function stSiz( x , n ) { return ( n ? rndDec( x , n ) : Math.round( x ) ) + stUnits ; }

clog = console.log ;

// Nov 2024 - something I found online about reading file in
function loadFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
}
