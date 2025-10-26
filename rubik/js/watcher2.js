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
function evWatchSet( target , field , hidden , canMakeVal ) {
    evWatchPrep( target , field , hidden ) ;
    // desc should come back as undefined if target doesn't have its OWN property named field, 
    //	or a descriptor { } object containing fields 'value', 'writable' is not a pseudo-property, 'get' and/or 'set' if it is.
    // NOTE - variables declared at the top of a class declaration ARE initialised as own properties of each instance,
    //	EVEN those declared in a superclass. (So they are "inherited" from superclass, but still "own" properties)
    //	HOWEVER the methods declared in the class declaration ARE NOT - they belong to the class's prototype!
    //	WHICH includes getters and setters, and hence the properties they define
    let itOrProto = target ;
    let height = 0 ;
    let desc =  Object.getOwnPropertyDescriptor( target , field ) ;
    // try to find property descriptor in target and it's prototype chain
    while ( itOrProto && ! desc ) { 
	console.log( itOrProto ) ;
	itOrProto = Object.getPrototypeOf( itOrProto ) ;
	if ( itOrProto ) {
	    height ++ ;
	    desc = Object.getOwnPropertyDescriptor( itOrProto , field ) ;
	}
    }
    if ( height ) {
	console.warn( 'attempt to watch property not individually owned by instance' , target , field ) ;
	if ( desc ) {
	    // found property descriptor higher in proto chain... use it tp reproduce property as own property of target
	    //	this will take care of inheriting setters/getters, and other params
	    Object.defineProperty( target , field , desc ) ;
	}
	else {
	    // not found in proto chain ... make if we're allowed
	    if ( canMakeVal ) {
		target[ field ] = canMakeVal ;
		desc = { } ;
	    }
	    else {
		throw new Error( `Failed to find property ${field} in proto chain of ${target} to height ${height}` ) ;
		return ;
	    }
	}
	// shouldn't be asking to watch a property of an object that isn't its own ... ?
	// use desc as descriptor for instance's own property - then it inherits getters / setters et al
// 	    target.field = target.field ;	// ! now there should be an own property...
// 	    desc = Object.getOwnPropertyDescriptor( target , field ) ;
// 	    height = 0 ;
// 	    // ...but if not for some reason, bail
// 	    if ( ! desc ) {
// 		console.warn( '...and could not create local copy so watch failed' ) ;
// 		return ;
// 	    }
    }
    // set up our getter and setter - wrap existing ones or create new ones
    let getter = desc?.get ;
    let setter = desc?.set ;
    // We only need to set up a private field if we're not calling an inherited setter
    if ( ! setter ) {
	// pick a name for hidden field
	if ( ! hidden ) hidden = '_' + field ;
	// ... avoiding clash with existing name
	while ( hidden in target ) hidden = '_' + hidden ;
	target[ hidden ] = target[ field ] ;
	setter = ( v => { target[ hidden ] = v ; } ) ;
    }
    if ( ! getter ) getter = ( ( ) => target[ hidden ] ) ;
    target.evWatchFields[ field ] = [ ] ; 
    Object.defineProperty( target , field , {
	get: ( ) => {
	    let val = getter( ) ;
// 		console.log( 'Getting ' + field + ' ... ' + val ) ;
	    return val ;
	} ,
	set: ( newV ) => {
// 		console.log( 'Setting ' + field + ' : ' + newV ) ;
	    let oldV = getter( ) ;
	    setter( newV ) ;
	    if ( ears = target.evWatchFields[ field ] ) {
		ears.map( ( ear ) => ear.apply( target , [ newV , oldV ] ) ) ;
		}
	    }
	}) ;
}

function evWatchPrep( target , field ) {
    // prepare to setup watching of attribute field of object target, i.e. set up evWatchFields object
    if ( !target.evWatchFields ) { // no watch list so make one
	target.evWatchFields = { } ;
    }
    if ( target.evWatchFields ) if ( field in target.evWatchFields ) return ;
    else {			// 2025 stopped using __proto__ ! ( "Note: The use of __proto__ is controversial and discouraged.
	if ( ! target.hasOwnProperty( 'evWatchFields' ) ) {
	    // the watchlist is has is inherited from prototype - we need to duplicate it - including duplicating its (array) elements
// 		alert( target.evWatchFields ) ;
	    let newList = { } ;
	    for ( let fld in target.evWatchFields ) {
		newList[ fld ] = target.evWatchFields[ fld ].slice() ;
	    }
	    target.evWatchFields = newList ;
	}
    }
}

function evOnChange( target , field , listener , canMakeVal ) {
    // register a function - listener - to call when attrribute
    // field of object target is changed
    evWatchSet( target , field , null , canMakeVal ) ;
    let ears = target.evWatchFields[ field ] ;
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
    let fun = ( ! funs ) ? function ( x ) { obj2[ field2 ] = x }
			 : function ( x ) { obj2[ field2 ] = doFns( funs , x ) } ;
    // register it as listener on obj1.field1
    evOnChange( obj1 , field1 , fun ) ;
    // call the copy function just created to initialise value of target field
    //		should this be "applied" on an object?
    fun ( obj1[ field1 ] ) ;
}
function evOnChangeCopyText( obj , field , el , field2 ) {
    // shorthand to copy value of field into textContent (or other specified field) of html element
    field2 = field2 || "textContent" ;
    evOnChange( obj , field , function ( x ) { el[ field2 ] = x } ) ;
}
