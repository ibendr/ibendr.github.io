// extensions of ARRAY

/*  Split from object3.js Oct 2025
 * 
 * 	Array1 extends Array with some convenient extra methods, including slice with step
 * 
 * 	ArrayN provides n-dimensional arrays by exotic mechanism of self - Proxy wrapping (!)
 * 
 * 	If I was more inclined to trust it, I might use same technique to make Array1 support negative indices and python-style slice notation
 * 	In the meantime, I can always go ahead and use ArrayN in one dimension.
*/

// Misc helper functions
const arrayIn = ( ( x , A ) => ( A.indexOf( x ) > -1 ) ) ; // now obsolete - use  A.includes( x )

class Array1 extends Array {
//   constructor( ) { super( arguments ) ; } // defaults to using super()
  without( x ) { return this.filter( y => ( y != x ) ) ; }
  last( i ) { return this.length ? this[ this.length - 1 - ( ( i ?? 0 ) % this.length ) ] : undefined ; }	// from 2022 L.at(-1-i) does this
  toReversed( ) { let out = this.slice( ) ; out.reverse( ) ; return out ; } ;   // builtin from 2023
  // override builtin method
  slice( start , end , step ) {
      if ( ! step ) return super.slice( start , end ) ;
      start = start ?? ( step < 0 ? this.length - 1 : 0 ) ;
      end   = end   ?? ( step < 0 ? -1 : this.length ) ;
      let len = ( ( end - start ) / step ) >> 0 ;
      if ( len < 1 ) return new Array1( ) ;
      let out = new Array1( len ) ;
      for ( let i = 0 ; i < len ; i ++ ) out[ i ] = this[ start + i * step ] ;
      return out ;
  }
  get indeces() { return range( this.length ) ; }	//	differs from .keys() which ignores empty slots
//   get kys { return Array.from( this.keys( ) ) ; }
  multi( n ) { return concat( arraySame( n , this ) ) ; }
}
// generator (iterable) to enable...    for ( let i of range(8) ) {    etc.
//    (py compare ... rangeIter  is like python 2 xrange or python3 range,   while range is like python 2 range)
function *rangeIter( i , j , k ) {
    if ( ! k ) k = 1 ; 
    if ( j == null ) { j = i ; i = 0 } 
    let v = i ; while ( (k > 0) ? (v < j) : (v > j) ) { yield v ; v += k }
}
// explicit array - stick to above version for gigantic imaginary ranges of iterations expected to be interrupted by other end conditions
const range = ( ...a ) => Array1.from( rangeIter( ...a ) ) ;
// range iterator over n dimensions
function *rangeIterND( lengths ) {
    // check if any lengths zero, after which we can assume at least one element
    if ( prod( lengths ) == 0 ) return [ ] ;
    // start all zeros
    let pos = lengths.map( () => 0 ) ;
    let ok = true ;
    while ( ok ) {
	yield pos.slice() ;
	// increment - starting at end of array for natural ordering
	let d = lengths.length - 1 ;
	while ( ok && ( ( pos[ d ] = ( pos[ d ] + 1 ) % lengths[ d ] ) == 0 ) ) {
	    // wrapped back to zero
	    d -= 1 ;
	    ok = ( d > -1 ) ;
	}
    }
}
const rangeND = ( lens ) => Array1.from( rangeIterND ( lens ) ) ;
const arraySame  = ( ( n , x ) => range( n ).map( () => x ) ) ; // an Array of length n filled with x
// const arrayJoin  = ( ( l ) => l.reduce( ( a , b ) => a.concat( b ) ) ) ; // replaced: use concat( ...l )
// make new array concatenating given ones
const concat = ( a , ...b ) => a ? a.concat( concat( ...b ) ) : [ ] ;   // can use Array method .flat if each argument definitely an array

// shorthand to make string representation of slice objects e.g. '4:7' ... 
//	not currently used since ' [ 3, '4:7' ] just as concise as ' [ 3, slicer(4,7) ] '
//	but could be handy when variables used ... ' [ x, y1 + ':' + y2 ] vs [ x , slicer( y1 , y2 ) ]   ( or [ x , [ y1 , y2 ].join(':') ] ?! )	
function slicer( ) { return Array.from( arguments ).join( ':' ) ; }
// const slicer = ( ) => Array.from( arguments ).join( ':' ) ; // cannot use 'arguments' in arrow function
function indexOrSlice( s , len ) {
    // s is string , len is length of target (for default upper values)
    // returns a single index or an array of indices
  //    '' defaults to ':'
  if ( ( s == '' ) || ( s == ':' ) ) return range( len ) ;
  let ss = s.split(':') ;
  // single number = index
  if ( ss.length < 2 ) return parseInt( ss[ 0 ] ) ;
  let [ start , end , step ] = ss ;
  step  = step  ? parseInt( step )  : 1 ;
  start = start ? parseInt( start ) : ( step > 0 ?  0  : len - 1 ) ;
  end   = end   ? parseInt( end   ) : ( step > 0 ? len :   - 1   ) ;
  // filter range to be forgiving on e.g. L[2:10] where L.length < 10
  return range( start , end , step ).filter( i => ( -1 < i ) && ( i < len ) ) ;
}
  
// Multi-dimensional array

//	Can be accessed as a flat array L[ i ] or via cordinates e.g. L[ [ 1 , 0 ] ]
// 		use null index for wildcard to get a sub-Array ( each wildcard increases dimension of result )		e.g. L[ [ null , 2 ] ]
//		use 'slice object' (a string) e.g. '3:5' to do roughly the same but with only specified range of that coordinate ( null same as ':' )
// 	Note 	[1,null,2] , [1,undefined,2] , [1,'',2]	  ALL get converted to string as '1,,2'    but BEWARE [1,2,] -> '1,2' , so use  [1,2,null] to get '1,2,'

// minimal getter / setter - hands these functions to ones defined in the class
const genericGetSet = {
    get( it , ...args )	 { return it._get( ...args ) ; } ,
    set( it , ...args )	 { return it._set( ...args ) ; }
}

// TODO - ?? - stop trusting this weird self-proxying shit and implement a
//		simple extension of Array1 with custom .at and .set   ??

class ArrayN extends Array1 {
    constructor( lengths , src ) {
	// lengths is dimensions. e.g. [3,2,4] gives 3x2x4 array
	// src is optional array-like object to copy content from ( lengths is still needed! 
	//		But we might add ArrayN.from( ) in some logical way? nested arrays? )
	//
	// for compatibility with regular Array construction, we allow lengths to be a single number
	// (since .slice() will try to make a new Array of same subclass, calling this constructor with length)
	if ( typeof lengths == "number" ) lengths = [ lengths ] ;
	// steps = multipliers for unit moves along axes, last being overall size
	let steps = new Array1( 1 ) ;
	steps[ 0 ] = 1 ;
	lengths.map( ( len , dir ) => { steps.push( ( steps[ dir ] * len ) ) ; } ) ;
	steps.reverse( ) ;
	super( steps[ 0 ] ) ;
	this.it = this ;	// the Array1 which this object will Proxy-wrap
			  // note that current 'this' won't be the 'this' that our methods see
	this.lengths = lengths ;
	this.steps   = steps ;
	this.dim     = lengths.length ;
	this.dims    = range( this.dim ) ;
	this.posKeys = rangeND( lengths ) ;
	if ( src ) for ( let i in range( this.length ) ) this[ i ] = src[ i ] ;
	      // the Proxy is used as the new object, and will be the 'this' that methods see.
	      //  To call the methods of the wrapped / parent Array1,  use this.it.<method>
	return new Proxy( this , genericGetSet ) ;
    }
    _get( prop , ...args ) {
	let ind = this.convProp( prop ) ;
	if ( ind instanceof Array ) return this.getSlice( ind , ...args ) ;
	let out = Reflect.get( this.it , ind , ...args ) ;
	return ( typeof out == 'function' ) ? out.bind( this ) : out ;
    }
    _set( prop , ...args ) {
	let ind = this.convProp( prop ) ;
	return ( ind instanceof Array ) ? this.setSlice( ind , ...args ) : Reflect.set( this.it , ind , ...args ) ;
    }
    convProp( prop ) {
	// convert property name - i.e. if it has comma/s, make into index OR position vector
	if ( typeof prop != "string" ) return prop ; // for Symbols
// 	console.log( prop );
	let pos = prop.split(',') ;
	if ( pos.length < 2 ) return prop ;
	// if any of the coordinates are null ( = wild ), we are dealing with a sub-Array
 	let slicing = false ;
	let ps = pos.map( ( s , i ) => { let out = indexOrSlice( s , this.lengths[ i ] ) ;
				    slicing ||= ( out instanceof Array ); return out ; } ) ;	
	return  slicing ? ps : sum( this.dims.map( d => ps[ d ] * this.steps[ d + 1 ] ) ) ;
    }
    subIndeces( pos ) {
	// return indices for all the positions matching entries of pos
	console.log( pos ) ;
	let out = [ ] ;
	this.posKeys.forEach( ( p , i ) => {
	    let ok = true ;
	    for ( let d of range( p.length ) ) {
		let v = pos[ d ] ;
		if ( ( v == null ) || ( v == p[ d ] ) ) continue ;
		if ( ( v instanceof Array ) && ( v.indexOf( p[ d ] ) > -1 ) ) continue ;
		ok = false ;
		break ;
	    }
	    if ( ok ) out.push( i ) ;
// 	    if ( pos.filter( ( v , d ) => ( v != -1 ) && ( v != p[ d ] ) ).length == 0 ) out.push( i ) ; // neater code but slower
	} );
	return out ;
    }
    getSlice( pos ) {
	// sub-ArrayND picking out elements with position matching entries of pos that aren't -1
	// e.g. sub( [ 1 , -1 , 2 , -1 ] returns 2-dimensional array,
	// with output[ [ x , y ] ] = this[ 1 , x , 2 , y ]
	let src = this.subIndeces( pos ).map( i => this[ i ] ) ;
	let lens = this.dims.map( d => 
	      ( ( pos[ d ] == null )		?     this.lengths[ d ] :
	      ( ( pos[ d ] instanceof Array ) 	? pos[ d ].length 	:   0   ) ) ).filter( i => !!i ) ;
	console.log( src , lens ) ;
	return new ArrayN( lens , src ) ;
    }
    setSlice( pos , val ) {
	// set sub array to contents of val (flat Array or ArrayND)
	let inds = this.subIndeces( pos ) ;
	val.map( ( v , i ) => { this[ inds[ i ] ] = v ; } ) ;
    }
    doToSlice( pos , fun ) {
	return this.setSlice( pos , fun( this.getSlice( pos ) ) ) ;
    }
}

