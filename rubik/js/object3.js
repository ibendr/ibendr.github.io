// OBJECT

/* Miscellaneous functions for OOP  updated using js6 from Sep 2025
*/

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

// ARRAYS

// apparently not a good idea to add these as methods to Array.prototype,
//	although we could add them to a class extending Array
const arrayWithout = ( ( l , x ) => l.filter( y => ( y != x ) ) ) ;
    // last element of an array - 
const last = ( L => L.length ? L[ L.length - 1 ] : undefined ) ;	// from 2022 L.at(-1) does this
function reversed( L ) { let out = L.slice() ; out.reverse() ; return out; } ;   // from 2023 L.toReversed()

// generator (iterable) to enable...    for ( let i of range(8) ) {    etc.
//    (py compare ... rangeIter  is like python 2 xrange or python3 range,   while range is like python 2 range)
function *rangeIter( i , j , k ) {
    if ( ! k ) k = 1 ; 
    if ( j == null ) { j = i ; i = 0 } 
    let v = i ; while ( (k > 0) ? (v < j) : (v > j) ) { yield v ; v+=k }
}
// explicit array - stick to above version for gigantic imaginary ranges of iterations expected to be interrupted by other end conditions
const range = ( ...a ) => Array.from( rangeIter( ...a ) ) ;
// range iterator over n dimensions
function *rangeIterND( lengths ) {
    // check if any lengths zero, after which we can assume at least one element
    if ( prod( lengths ) == 0 ) return [ ] ;
    // start all zeros
    let pos = lengths.map( () => 0 ) ;
    let ok = true ;
    while ( ok ) {
	yield pos.slice() ;
	// increment - starting at start of array (so NOT in natural ordering)
	let d = 0;
	while ( ok && ( ( pos[ d ] = ( pos[ d ] + 1 ) % lengths[ d ] ) == 0 ) ) {
	    // wrapped back to zero
	    d += 1 ;
	    ok = ( d < lengths.length ) ;
	}
    }
}
const rangeND = ( lens ) => Array.from( rangeIterND ( lens ) ) ;
const arraySame  = ( ( n , x ) => range( n ).map( () => x ) ) ;
// const arrayJoin  = ( ( l ) => l.reduce( ( a , b ) => a.concat( b ) ) ) ; // replaced: use concat( ...l )
// make new array concatenating given ones
const concat = ( a , ...b ) => a ? a.concat( concat( ...b ) ) : [ ] ;   // can use Array method .flat if each argument definitely an array
const arrayMult  = ( ( n , l ) => arrayJoin( arraySame( n , l ) ) ) ;
const arrayIn    = ( ( x , l ) => l.indexOf( x ) > - 1 ) ;

// Multi-dimensional array


// TODO: 	give up on get/set handler doing subs?
//		add extended slice function slicing in multi dimensions (can't use "slice" as won't quite be back-compatible)
//		? get ArrayND constructor to return a normal Array when only one dimension
//		?? (a bit unrelated) do an extension of Array class to include custom methods
const arrayMultiDHandler = {
    get( it , pos ) { 
	let ind = posToIndex( it , pos ) ;
	    console.log( it, pos , ind );
	if ( ind instanceof Array ) {
	    // sub array
	    return console.log( it.lengths.filter( ( l , i ) => ( pos[ i ] == -1 ) ) , ind.map( i => it[ i ] ) ) ;
// 	    return new ArrayND( it.lengths.filter( ( l , i ) => ( pos[ i ] == -1 ) ) , ind.map( i => it[ i ] ) ) ;
// 	    return it.sub( pos ) ;	// TODO	 - WHY DOESN'T THIS WORK? (Although not strictly needed - just a shorthand) 'cos NaN is FUKT
	}
	let out = it[ ind ] ;
	return typeof out == 'function' ? out.bind( it ) : out ;
    } ,
    set( it , pos , val ) {
	let ind = posToIndex( it , pos ) ;
	if ( ind instanceof Array ) {
	    // sub array
	    it.setSub( pos , val ) ;
	    return true ;
	}
	it[ posToIndex( it , pos ) ] = val  ; return true ; }
}
function posToIndex( it , pos ) {
    // convert a position vector - WHICH IS ALREADY A STRING - into a single index for a given multi-dimensional array
    // allow reading and writing properties of inner array without applying index conversion
    if ( pos in it ) return pos ;
    // if any of the coordinates are -1 ( = wild ), we are dealing with a sub-Array
    let ps = pos.split(',').map( s=> parseInt(s) ) ;
    console.log( ps ) ;
    if ( ps.indexOf( -1 ) > -1 ) { console.log( ps.indexOf( -1 ) ) ;
	return it.subIndeces( ps ) ;
    }
    let i = 0  ;
    for ( let d = ps.length - 1 ; d > -1 ; d-- ) {
	i *= it.lengths[ d ] ;
	i += ps[ d ] ;
    }
    return i ;
}

class ArrayND extends Array {
    constructor( lengths , src ) {
	// lengths is dimensions. e.g. [3,2,4] gives 3x2x4 array
	// src is optional array-like object to copy content from (lengths still needed!)
	//
	// for compatibility with regular Array construction, we allow lengths to be a single number
	// (since .slice() will try to make a new Array of same subclass, calling this constructor with length)
	if ( typeof lengths == "number" ) lengths = [ lengths ] ;
	super( prod( lengths ) ) ;
	this.lengths = lengths ;
	if ( src ) for ( let i in range( this.length ) ) this[ i ] = src[ i ] ;
	this.posKeys = rangeND( lengths ) ;
	return new Proxy( this , arrayMultiDHandler ) ;
    }
    subIndeces( pos ) {
	// return indices for all the positions matching entries of pos which aren't -1
	let out = [ ] ;
	this.posKeys.forEach( ( p , i ) => {
	    if ( pos.filter( ( v , d ) => ( v != -1 ) && ( v != p[ d ] ) ).length == 0 ) out.push( i ) ;
	} );
	return out ;
    }
    sub( pos ) {
	// sub-ArrayND picking out elements with position matching entries of pos that aren't -1
	// e.g. sub( [ 1 , -1 , 2 , -1 ] returns 2-dimensional array,
	// with output[ [ x , y ] ] = this[ 1 , x , 2 , y ]
	let src = this.subIndeces( pos ).map( i => this[ i ] ) ;
	let lens = this.lengths.filter( ( l , i ) => ( pos[ i ] == -1 ) ) ;
	console.log( src , lens ) ;
	return new ArrayND( lens , src ) ;
    }
    setSub( pos , val ) {
	// set sub array to contents of val (flat Array or ArrayND)
	let inds = this.subIndeces( pos ) ;
	val.map( ( v , i ) => { this[ inds[ i ] ] = v ; } ) ;
    }
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
