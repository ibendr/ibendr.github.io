// Rubikword - dom helpers

// NEW CLASS BASED VERSION ====================== V V V

class elem {
    // base class for anything that primarily wraps a html element
	el ; els ;  
    constructor( tag , pa , cls , styl , ghosts ) {
	this.els = [ ]
	for ( let n = 0 ; n < 1 + ( ghosts ?? 0 ) ; n++ ) {
	    let el = document.createElement( tag ) ;
	    if ( cls ) {
		// add initial class or class list
		if ( typeof cls == 'string' ) cls = [ cls ] ;
		for ( let c of cls ) el.classList.add( c ) ;
	    }
	    // make extra duplicates for multiple appearances (e.g. during wraparound)
	    if ( n ) {
		el.classList.add( 'ghost' ) ;	    
		el.style.display = 'none' ;	// put in .css file ?
	    }
	    else this.el = el ;
	    // initial style settings
	    this.els.push( el ) ;
	    this.el.obj = this ;
	    ( pa ?? document.body ).appendChild( el ) ;	    
	}
	if ( styl ) this.setStyle( styl ) ;
    }
    setStyle( styl , which ) {
	for ( let el of which ?? this.els ) for ( let att in styl ) el.style[ att ] = styl[ att ] ;
    }
}


// class El extends Element {


// Main one - shorthand for object creation
function makeEl( tag , pa , cls , obj ) {
    // make element type tag, append to pa, give classes cls and .obj = obj
    let el = document.createElement( tag ) ;
    if ( cls ) {
	if ( typeof cls == 'string' ) cls = [ cls ] ;
	for ( let c of cls ) el.classList.add( c ) ;
    }
    ( pa ?? document.body ).appendChild( el ) ;
    if ( obj ) { el.obj = obj ; obj.el = el ; }
    return el ;
}

function initPointerListeners( ) {
    console.log( 'starting pointer listeners' )
    // for simple setup where only one touch or button-down-mouse-drag happening at a time
    points = { } ;	// list of active 'points' i.e. mouse drags / touches
    
    elHost.addEventListener( "mousedown",  ev => startPoint( ev , "mouse" , event.pageX , event.pageY ) ) ;
    elHost.addEventListener( "mousemove",  ev =>  movePoint( ev , "mouse" , event.pageX , event.pageY ) ) ;
    elHost.addEventListener( "mouseup",    ev =>   endPoint( ev , "mouse" , event.pageX , event.pageY ) ) ;
    elHost.addEventListener( "mouseleave", ev =>   endPoint( ev , "mouse" , event.pageX , event.pageY ) ) ;

    elHost.addEventListener( "touchstart", ev => { for (let touch of event.changedTouches) {
						 startPoint( ev, touch.identifier , touch.pageX , touch.pageY ) ; }    });
    elHost.addEventListener( "touchmove" , ev => { for (let touch of event.changedTouches) {
						  movePoint( ev, touch.identifier , touch.pageX , touch.pageY ) ; }    });
    elHost.addEventListener( "touchend"  , ev => { for (let touch of event.changedTouches) {
						   endPoint( ev, touch.identifier , touch.pageX , touch.pageY ) ; }    });
}


