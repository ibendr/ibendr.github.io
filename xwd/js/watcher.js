// Register events on change of an object property



function evWatch( target , field , hidden ) {
    // setup watching of attribute field of object target
    // hidden specifies the name for the hidden version of the variable
    // which defaults to '_' + field
    // Make sure target object is set up for watching
    if ( !target.evWatchFields ) target.evWatchFields = { } ;
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
		set: function( v ) {
// 		    alert( field + ':' + v )
		    this[ hidden ] = v ;
		    if ( ears = this.evWatchFields[ field ] ) {
			self = this ;
			ears.forEach( function ( ear ) {
			    ear.apply( self , [ v ] )
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
