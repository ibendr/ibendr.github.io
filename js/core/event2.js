// EVENTS


/* 
 * June 2015 : version 2
 * 
 * intentions -
 * 
 *  - shorter function names: on, notOn, fire
 * 
 *  - streamline treating a method of an object as a fireable event
 * 
*/


// requires : array1

// event handlers are functions f(e,t) where e is event object
//  (as passed by DOM in the case of html events,  available for
//  custom use for user-defined events) and t is the
//  target/source element.  f should return true if the event
//  should still be handled by other (previously added) handlers.

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
    