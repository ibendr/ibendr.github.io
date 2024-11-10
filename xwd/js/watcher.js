// Register events on change of an object property



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
    else {
	if ( target.__proto__ && target.__proto__.evWatchFields &&
	    target.evWatchFields == target.__proto__.evWatchFields ) {
		// inherited prototype watchlist - need to duplicate it
// 		alert( target.evWatchFields ) ;
		target.evWatchFields = { } ;
		for ( fld in target.__proto__.evWatchFields ) {
		    target.evWatchFields[ fld ] = target.__proto__.evWatchFields[ fld ].slice() ;
		}
	    }
    }
		
    // And check whether the field is already watched
    if ( field in target.evWatchFields ) return
    else {
	if ( ! ( old_setter = target.__lookupSetter__() ) ) {
	    // not already a pseudo property - make it one
	    if ( ! hidden ) hidden = '_' + field ;
	    target[ hidden ] = target[ field ] ;
	    target.evWatchFields[ field ] = [ ] ; 
	    Object.defineProperty(  target , field , {
		get: function( ) { return this[ hidden ] } ,
		set: function( newV ) {
// 		    alert( field + ':' + v )
                    var oldV = this[ hidden ]
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
