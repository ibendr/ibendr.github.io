// Rubikword - dom helpers

// NEW CLASS BASED VERSION ====================== V V V

const rnd       = (  n  => Math.floor( n * Math.random() ) ) ;
const rndOf     = (  L  => L.length && L[ rnd( L.length ) ] ) ;

const cl = (...a)=>a.map( x => console.log ( x.toString ? x.toString( ) : x ) ) ;
const i2 = [ 0 , 1 ] ;
const i5 = range( 5 ) ;

nToPx = ( s => typeof s == 'number' ? ( s + 'px' ) : s ) ;

class elem {
    // base class for anything that primarily wraps a html element
	el ; els ;
    constructor (...args) { this.makeEls (...args) ; }
    makeEls( tag , pa , cls , styl , ghosts ) {
	this.els = [ ] ;
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
// 		el.style.display = 'none' ;	// put in .css file ?
	    }
	    else this.el = el ;
	    // initial style settings
	    this.els.push( el ) ;
	    el.obj = this ;
	    ( pa ?? document.body ).appendChild( el ) ;  
	}
	if ( styl ) this.setStyle( styl ) ;
    }
    setPosSize( pos , siz , which , other ) {
	// shorthand set left, top, width, height with numbers +'px'ed ...  and other obect passed on to setStyle
	// omitting siz ( or pos ) sees no change to that pair - likewise null for an individual parameter
	// Use '' for a parameter to delete individual style setting and default to style sheet or layout
	for ( let el of ( which ? this.elss( which ) : this.els ) ) {
	    let st = el.style ;
	    if ( pos ) {
		if ( pos[ 0 ] ) st.left   = nToPx( pos[ 0 ] ) ;
		if ( pos[ 1 ] ) st.top    = nToPx( pos[ 1 ] ) ;
	    }
	    if ( siz ) {
		if ( siz[ 0 ] ) st.width  = nToPx( siz[ 0 ] ) ;
		if ( siz[ 1 ] ) st.height = nToPx( siz[ 1 ] ) ;
	    }
	}
	if ( other ) {
	    this.setStyle( other , which ) ;
	}
    }
    elss( l ) { return l.map( i => this.els[ i ] ) ; } // select els by index list
    setStyle( styl , which ) {
	for ( let el of ( which ? this.elss( which ) : this.els ) ) for ( let att in styl ) el.style[ att ] = styl[ att ] ;
    }
}


const eventConverts = {
    mousedown:  'startPoint' , mousemove: 'movePoint',  mouseup:  'endPoint', mouseleave: 'endPoint' ,
    touchstart: 'startPoint' , touchmove: 'movePoint',  touchend: 'endPoint' } ;
function findElementWithField( target , fun ) {
      let cnt = 0; // just in case element ancestry is recursive
      while ( target && ( cnt++ < 1000 ) ) {
// 	  console.log ( target ) ;
	  if ( target.obj ) if ( fun in target.obj ) return target ;
	  target = target.parentElement ;
      }
}

class elButton extends elem {
      lbl ; action ;
    constructor ( pa , lbl , action , ...posSiz ) {
	super( 'div' , pa , 'button' ) ;
	this.el.innerText = lbl ;
	this.action = action ;
	this.el.addEventListener( 'click' , action ) ;
	if ( posSiz.length ) this.setPosSize ( ...posSiz ) ;
    }
}
	

function omniHandler( event ) {
    let target = event.target ;
    let type = event.type
//     console.log ( target , type ) ;
    let conv = eventConverts[ type ] ;
    if ( conv ) {
// 	console.log( target , conv )
	target2 = findElementWithField( target , conv ) ;
	if ( target2 ) {
// 	    console.log( target2 )
	    if ( type.slice(0,5) == 'mouse' ) {
		// use 'mouse' as id of pointer sequence
		target2.obj[ conv ]( event , 'mouse' , event.pageX , event.pageY ) ;
	    }
	    else {
		for (let touch of event.changedTouches) {
		    target2.obj[ conv ]( event , touch.identifier , touch.pageX , touch.pageY ) ;
		}
	    }
	}
    }
}
    
function initPointerListeners( el ) {
//     console.log( 'starting pointer listeners on ', el )
    // for simple setup where only one touch or button-down-mouse-drag happening at a time
//     points = { } ;	// list of active 'points' i.e. mouse drags / touches
    if ( el.obj) el.obj.points = { } ;
    for ( let type in eventConverts ) {
	el.addEventListener( type ,  omniHandler ) ;
    }
}


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

// function initPointerListeners( el ) {
//     console.log( 'starting pointer listeners' )
//     // for simple setup where only one touch or button-down-mouse-drag happening at a time
//     points = { } ;	// list of active 'points' i.e. mouse drags / touches
//     
//     el.addEventListener( "mousedown",  ev => startPoint( ev , "mouse" , event.pageX , event.pageY ) ) ;
//     el.addEventListener( "mousemove",  ev =>  movePoint( ev , "mouse" , event.pageX , event.pageY ) ) ;
//     el.addEventListener( "mouseup",    ev =>   endPoint( ev , "mouse" , event.pageX , event.pageY ) ) ;
//     el.addEventListener( "mouseleave", ev =>   endPoint( ev , "mouse" , event.pageX , event.pageY ) ) ;
// 
//     el.addEventListener( "touchstart", ev => { for (let touch of event.changedTouches) {
// 						 startPoint( ev, touch.identifier , touch.pageX , touch.pageY ) ; }    });
//     el.addEventListener( "touchmove" , ev => { for (let touch of event.changedTouches) {
// 						  movePoint( ev, touch.identifier , touch.pageX , touch.pageY ) ; }    });
//     el.addEventListener( "touchend"  , ev => { for (let touch of event.changedTouches) {
// 						   endPoint( ev, touch.identifier , touch.pageX , touch.pageY ) ; }    });
// }


