// Register events on change of an object property
//
// 2025 Sep update ...
//	- haven't spotted any new features making this redundant just yet (checked Proxy)
//	- but have to update some of the deprecated methods used
//
//	- adding watching of method calls
//

function evWatchCall( target , field , hidden ) {
    evWatch( target , field , hidden ) ;
}
    
    // 
function evWatchSet( target , field , hidden ) {
    evWatch( target , field , hidden ) ;
    // And check whether the field is already watched
    if ( field in target.evWatchFields ) return ;
    else {		// TODO __lookupSetter__ is deprecated. => Object.getOwnPropertyDescriptor() need to check ( target ) and ( target.constructor.prototype )
	let desc = Object.getOwnPropertyDescriptor( target , field ) ;
	if ( ! desc ) {
	    // shouldn't be asking to watch a property of an object that isn't its own ... ?
	    console.warn( 'attempt to watch property not individually owned by instance' , target , field ) ;
	    return ;
	}
	if ( 'value' in desc ) {
	    // not already a pseudo property - make it one
	    if ( ! hidden ) hidden = '_' + field ;
	    target[ hidden ] = target[ field ] ;
	    target.evWatchFields[ field ] = [ ] ; 
	    Object.defineProperty(  target , field , {
		get: function( ) { return this[ hidden ] } ,
		set: function( newV ) {
// 		    alert( field + ':' + v )
                    let oldV = this[ hidden ] ;
		    this[ hidden ] = newV ;
		    if ( ears = this.evWatchFields[ field ] ) {
			self = this ;
			ears.forEach( function ( ear ) {
			    ear.apply( self , [ newV , oldV ] )
			} ) ;
		    }
		}
	    } )
	}
    }
}


function evWatch( target , field , hidden ) {
    // setup watching of attribute field of object target
    // hidden specifies the name for the hidden version of the variable
    // which defaults to '_' + field
    // Make sure target object is set up for watching
    // 2024 ... this was modiying the protoytpe's list when
    //		that was not already overridden by instance
//     if ( !target.evWatchFields ) target.evWatchFields = { } ;
    if ( !target.evWatchFields ) { // no watch list so make one
	target.evWatchFields = { } ;
    }
    else {	// 2025 stopped using __proto__ ! ( "Note: The use of __proto__ is controversial and discouraged.
	      //					Its existence and exact behavior have only been standardized
	    //					as a legacy feature to ensure web compatibility, while it presents
	  //					several security issues and footguns. 
	if ( ! target.hasOwnProperty( 'evWatchFields' ) ) {
		// inherited prototype watchlist - need to duplicate it - including duplicating its (array) elements
// 		alert( target.evWatchFields ) ;
		newList = { } ;
		for ( fld in target.evWatchFields ) {
		    newList[ fld ] = target.evWatchFields[ fld ].slice() ;
		}
		target.evWatchFields = newList ;
	    }
    }
}

function evOnChange( target , field , listener ) {
    // register a function - listener - to call when attrribute
    // field of object target is changed
    evWatch( target , field ) ;
    var ears = target.evWatchFields[ field ] ;
    if ( typeof listener == "function" )
	ears.push( listener )
    else
	// assume list of listeners to add
	target.evWatchFields[ field ] = ears.concat( listener ) ;
}

// 2024 ... specialised watcher which copies new value (or function of it)
//	to a specified field in another object.

//	NOTE - depends on doFns from object2.js

function evOnChangeCopy( obj1 , field1 , obj2 , field2 , funs ) {
    // make function to copy value into obj2.field2, with or without extra processing
    var fun = ( ! funs ) ? function ( x ) { obj2[ field2 ] = x }
			 : function ( x ) { obj2[ field2 ] = doFns( funs , x ) } ;
    // register it as listener on obj1.field1
    evOnChange( obj1 , field1 , fun ) ;
    // call the copy function just created to initialise value of target field
    //		should this be "applied" on an object?
    fun ( obj1[ field1 ] ) ;
//     if ( ! funs ) {	// omit funs for more efficient direct copy
// 	evOnChange( obj1 , field1 , function ( x ) { obj2[ field2 ] = x } ) ;
//     }
//     else {		// funs is array of functions to be applied in sequence (composed)
// 	// default for field2 is copy of field1
// 	if ( ! field2 ) field2 = field1 ;
// 	evOnChange( obj1 , field1, function ( x ) { obj2[ field2 ] = doFns( funs , x ) } ) ;
//     }
}
function evOnChangeCopyText( obj , field , el , field2 ) {
    // shorthand to copy value of field into textContent (or other specified field) of html element
    field2 = field2 || "textContent" ;
    evOnChange( obj , field , function ( x ) { el[ field2 ] = x } ) ;
}
