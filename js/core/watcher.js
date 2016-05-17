// Register events on change of an object property



function evWatch( target , field , hidden ) {
    // setup watching of attribute field of object target
    // hidden specifies the name for the hidden version of the variable
    // which defaults to '_' + field
    if ( !target.evWatchFields ) target.evWatchFields = { } ;
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

/*

var eventHandlers = new Object()

function on( name , fun , force , posn ) {
	// (You will need to use initHandler first to intercept DOM events)
	// force=true makes handler be added even if it already has been (allows duplicate)
	// By default the newest added handlers are called first.  To override this,
	//  set posn to intended place in list for newly added handler - 0 is last executed.
	if (!(name in eventHandlers)) eventHandlers[name]=new Array()
	if ( (!eventHandlers[name].has(fun)) || force) {
		if (posn!=undefined) eventHandlers[name].splice(posn,0,fun)
		else eventHandlers[name].push(fun)
	}	}
function notOn(name,fun) { 
	if ( ! ( name in eventHandlers ) ) { // error!
		alert("ERROR: tried to remove handler for " + name + " event - none defined.")
		}
	else eventHandlers[ name ].remove( fun )
	}
function treatAsEvent( cls , name ) {
    // let obj.name( e ) be called by fire( "name" , e ,obj ) if obj is of type class
    on( name , function ( e , t , name ) {
	if ( t instanceof cls ) return t[ name ].apply( t , e )
	else return true;
    } );
}
	
function initHandler( name , nonDoc ) {
    // set nonDoc = true for user-generated events with no DOM listener
    if ( ! ( name in eventHandlers ) ) {
	var preEx = null ;
	if ( ! nonDoc ) {
	    //   Could we be saving time if we just use document.addEventListener()  ?  - should change in next version
	    // check for preexisting document.on<name> function - retain it as first action
	    preEx = eval( 'document.on' + name ) ;
	    eval( '_oldOn_' + name + ' = function( e ) { return fire( "' + name + '" , e ) }' ) ;
	    eval( 'document.on' + name + ' = _oldOn_' + name ) ;
	}
	eventHandlers[ name ] = preex ? new Array( preEx ) : new Array() ;
	}
    }

function fire( name , e , t ) {
// Handle event of given name
// e is event object (as passed by DOM - so somewhat browser-dependant)
// t (optional) is target - save wrapping it in e for user-defined events
    if ( name in eventHandlers ) {
	var hans = eventHandlers[ name ]
	if ( hans.length ) {
	    if ( e == undefined ) {
		e = window.event ;      	// for IE
		if ( ! e ) return true ;	// for stuffups
		}
	    if ( t == undefined ) t = e.target || e.srcElement ;
	    for ( var i = hans.length - 1 ; i >= 0 ; i-- ) {
		var f = hans[ i ] ;
		if ( ! f( e , t , name ) ) return false ;
	}   }	}
    return true ;
    }


    
// Some backward compatibility

addEventHandler    = on ;
handleEvent        = fire ;
removeEventHandler = notOn ;
    */