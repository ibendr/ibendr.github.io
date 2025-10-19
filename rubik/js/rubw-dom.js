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
    // 		(we could load our own properties onto the html object, but I reckon that's poor form and risks name clashes,
    //		especially with the possibility of browsers adding their own custom fields to such objects.)
    // The actual element is el, and also els[ 0 ], with the array els allowing for the possibility that the object will be shown as
    //		multiple (very similar) html elements. This array should NOT be used for components within the object. It is really
    //		for when the object needs multiple representations. Classic case - object appearing in multiple places,
    //		such as in contexts with wraparound. Shadowing might be another case.
	el ; els ;
	// the constructor just wraps makeEls, which could be called on other objects
    constructor (...args) { this.makeEls (...args) ; }
    destructor( ) {
	    // called when discarding an object - this removes the element from the DOM tree
	    // hopefully everything else taken care of by garbage collection if we avoid cyclic references
	    for ( let el of this.els ) el.remove() ;
	    this.el = null ;
	    this.els = [ ] ;
    }
    makeEls( tag , pa , cls , styl , proxies ) {
	    // tag	html tag (e.g. 'div', 'p', etc.)
	    // pa	parent element (TODO: or parent elem object?)
	    // cls	class or list of classes to add - note class "proxy" will be added for proxy elements
	    // styl	object with style information
	    // proxies	number of extra elements to create (which will have same classes & styles)
	this.els = [ ] ;
	let paEl = null ;
	if ( pa ) {
	   this.pa = pa ;
	   if ( pa instanceof Element ) paEl = pa ;
	   else if ( pa.el ) paEl = pa.el ;
	   }
	for ( let n = 0 ; n < 1 + ( proxies ?? 0 ) ; n++ ) {
	    let el = document.createElement( tag ) ;
	    if ( cls ) {
		// add initial class or class list
		if ( typeof cls == 'string' ) cls = [ cls ] ;
		for ( let c of cls ) el.classList.add( c ) ;
	    }
	    // make extra duplicates for multiple appearances (e.g. during wraparound)
	    if ( n ) {
		el.classList.add( 'proxy' ) ;	    
// 		el.style.display = 'none' ;	// put in .css file ?
	    }
	    else this.el = el ;
	    // initial style settings
	    this.els.push( el ) ;
	    el.obj = this ;
	    if ( paEl ) paEl.appendChild( el ) ;
	}
	if ( styl ) this.setStyle( styl ) ;
    }
    setPosSize( pos , siz , which , other ) {
	// shorthand set left, top, width, height with numbers +'px'ed ...  and other obect passed on to setStyle
	// omitting siz ( or pos ) sees no change to that pair - likewise null for an individual parameter
	// Use '' for a parameter to delete individual style setting and thereby default to style sheet or layout
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

class elButton extends elem {
      lbl ; action ;
    constructor ( pa , lbl , action , ...posSiz ) {
	super( 'div' , pa , 'button' ) ;
	this.el.innerText = lbl ;
	this.action = action ;
	this.el.addEventListener( 'click' , action ) ;
	this.el.addEventListener( 'mousedown' , ev => ev.preventDefault() ) ; // avoid ugly accidental text-highlighting
	if ( posSiz.length ) this.setPosSize ( ...posSiz ) ;
    }
}

// POINTER EVENTS ... framework to reduce mouse-drags and touch-drags to one set of methods - startPoint, movePoint, endPoint

const eventConverts = {
    mousedown:  'startPoint' , mousemove: 'movePoint',  mouseup:  'endPoint', mouseleave: 'endPoint' ,
    touchstart: 'startPoint' , touchmove: 'movePoint',  touchend: 'endPoint' } ;

function findElementWithField( target , prop , maxTries ) {
      let cnt = 0; // just in case element ancestry is recursive
      while ( target && ( cnt++ < ( maxTries ?? 100 ) ) ) {
// 	  console.log ( target ) ;
	  if ( target.obj ) if ( prop in target.obj ) return target ;
	  target = target.parentElement ;
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
    if ( el.obj ) el.obj.points = { } ;
    for ( let type in eventConverts ) {
	el.addEventListener( type ,  omniHandler ) ;
    }
}

// DRAGGING

