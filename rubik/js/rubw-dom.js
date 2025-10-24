// Rubikword - dom helpers

// NEW CLASS BASED VERSION ====================== V V V

const htmlTagsAll = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup data datalist dd del details dfn dialog dir div dl dt em embed fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script search section select small source span strike strong style sub summary sup svg table tbody td template textarea tfoot th thead time title tr track tt u ul var video wbr'.split(' ') ;

const rnd       = (  n  => Math.floor( n * Math.random() ) ) ;
const rndOf     = (  L  => L.length && L[ rnd( L.length ) ] ) ;

const cl = (...a)=>a.map( x => console.log ( x.toString ? x.toString( ) : x ) ) ;
const i2 = [ 0 , 1 ] ;
const i5 = range( 5 ) ;

nToPx = ( s => typeof s == 'number' ? ( s + 'px' ) : s ) ;
toPx  = ( x => Math.floor( x ) + 'px' ) ;

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
	    for ( let el of this.els ) { el.remove() ; el.obj = null ; }
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
    constructor ( pa , lbl , action , posSiz , hoverTxt ) {
	super( 'div' , pa , 'button' ) ;
	this.el.innerText = lbl ;
	this.action = action ;
	this.el.addEventListener( 'click' , action ) ;
	this.el.addEventListener( 'mousedown' , ev => ev.preventDefault() ) ; // avoid ugly accidental text-highlighting
	if ( hoverTxt ) {
	    // text to display when mouse hovers over - style left to CSS
	    htmlTree( [ 'span' , hoverTxt , 'hovertext' ] , this.el ) ;
	}
	if ( posSiz ) if ( posSiz.length ) this.setPosSize ( ...posSiz ) ;
    }
}

function htmlInsertPs( it , txt , replace ) {
    // add one or sequence of <p> objects to element 
    //		it	target (host) Element or elem
    //		txt	array of strings for content (or single string with \n to split lines)
    //		replace	if true, replace existing content
    if ( it.el ) it = it.el ;	// get actual Element from elem
    if ( replace ) it.innerText = '' ;
    if ( typeof txt == "string" ) txt = txt.split( '\n' ) ;
    txt.map( ( t , i ) => {
	let p = document.createElement( 'p' ) ;
	p.innerText = t ;
	it.appendChild( p ) ;
    } ) ;
}
var htmlTagsOK = htmlTagsAll ; // I'm only using internally so should be fine?

function htmlTree( x , pa , replace , notDefaultPs ) {
    // insert tree structure of elements  ...  is this easier / better than grappling with TrustedTypePolicyFactory etc. ?
    //		x	string				for a textNode / sequence of p-elements
    //			[ tag , sub , classList ]	for an element/s, where sub is innerText or array of x arguments for recursive call
    //			[ ... ]				multiple subNodes to add, each in format for x
    //								note if first element is string that happens to be a tag name, skip it e.g. x = [ , 'div' , ... ]
    //	e.g. 'Hi' , [ 'p' , 'Hello' ] , [ 'span' , 'world' , 'def' ] , [ 'div' , [ [ 'p' ,"G'day" ] , [ 'p' , "mate" ] ] ]
    //		pa		parent (host) Element or elem to append completed tree to
    //		replace		if true, replace existing content
    let it = null ; // output
    if ( typeof x == "string" ) {
	// raw text node if notDefaultPs set, otherwise a sequence of <p> elements for the lines
	if ( notDefaultPs )	it = document.createTextNode( x ) ;
	else			x = x.split( '\n' ).map( l => [ 'p' , l ] ) ;
    }
    if ( it == null ) if ( x instanceof Array ) if ( x.length ) {
	// check if we should consider x an element or array of subTrees
	if ( ( x.length < 4 ) && ( arrayIn( x[ 0 ] , htmlTagsOK ) ) ) {
	    let [ tag , sub , cls ] = x ;
	    it = document.createElement( tag ) ;
	    if ( cls ) {
		// add initial class or class list
		if ( typeof cls == 'string' ) cls = [ cls ] ;
		for ( let c of cls ) it.classList.add( c ) ;
	    }
	    if ( sub ) {
		if ( typeof sub == "string" ) {
		    it.innerText = sub ;
		}
		else {
		    // array of subTrees to add to new element 'it'
		    for ( let subX of sub ) {
			htmlTree( subX , it , false , notDefaultPs )
		    }
		}
	    }
	}
	else {
	    // array of subTrees to add directly to pa ( 'it' will remain null )
	    for ( let subX of x ) {
		htmlTree( subX , pa , replace , notDefaultPs ) ;
		replace = false ;	// after first addition we want to stop deleting!
	    }
	}
    }
    if ( it ) {
	let paEl = pa?.el ?? pa ;
	if ( paEl ) {
	    if ( replace )	paEl.innerText = '' ;	// surprisingly powerful destroyer of content!
	    paEl.appendChild( it ) ;
	}
    }
    return it ;
}

// VISUAL EFFECTS

function spinStyle( st , r , t , andThen ) {
//     console.log( d , t ) ;
    st.transitionProperty = 'transform' ;
    st.transitionTimingFunction =  'ease-in-out' ;   //  d ? 'ease-in' : 'ease-out' ;
    st.transitionDuration = t + 'ms' ;
    st.transform = `rotate3d( 0, 1, 0, ${r}turn )` ;
    if ( andThen ) setTimeout( andThen , t ) ;
}
function spinDialog( it , txt , andThen , disTxt , waitTime , spinTime ) {
    // spin html element around, showing txt as if it was on the back of the element
    // if disTxt set, make a dismiss button with that text on it, otherwise pause in proportion to the amount of text, then swing back and call andThen
    let el  = it?.el ?? it ;
    let db  = el.cloneNode( 0 ) ;	// make shallow clone - no children just outer box
    db.classList.add( 'dialog' ) ; 	// let stylesheet do the rest
    let ste = el.style ;
    let andNext = ( () => {  unSpinDialog( el , db , spinTime , andThen ) ; } ) ;
    spinTime = spinTime ?? 600 ;
    htmlTree ( txt , db , true ) ;	    // put text (possibly html) in dialog box
    if ( disTxt ) { 	// make dismiss button
	if ( typeof disTxt != 'string' ) disTxt = 'OK' ;
	let lines = disTxt.split( '\n' ) ;
	let len = Math.max( ...lines.map( l => l.length ) ) ;
	let wid = Math.floor( parseInt( db.style.width  ) / 5 ) ;
	let ht  = parseInt( db.style.height ) * ( 0.02 + 0.13 * lines.length ) ;
	let fontS = ht * 0.85 ;
	fontS = Math.min( fontS , wid / ( len * 0.24 ) ) ;
	let btn = new elButton( db , disTxt , andNext , [ , , , 
		{ position: 'relative' , width: ( 3 * wid ) + 'px' , height: ht + 'px' , left: ( wid ) + 'px' , fontSize: fontS + 'px' } ] , "continue" ) ;
    }
    else {
	setTimeout( andNext , 2 * spinTime + ( waitTime || ( 100 * txt.length ) ) );
    }
    el.appendChild( db ) ;
    // spin element thorugh 180 deg
    // and show dialog box (covers target element) when half-way around second lap
    setTimeout( ()=> {
	db.style.display = 'block' ; 
    } , 1.33 * spinTime );
    spinStyle( ste , 1 , 2 * spinTime ) ;
    return andNext ; // so it can be called if user dismisses dialog by other means
}

function unSpinDialog( el , db , spinTime , andThen ) {
    // spin back to home position
    // and remove dialog box half-way around second lap
    setTimeout( ()=> { 	db.remove() ;     } , 1.35 * spinTime );    
    setTimeout( 	andThen    	    , 2.0  * spinTime );    
    spinStyle( el.style , 0 , 2 * spinTime ) ;
    
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




// all html tags... (?) from   https://www.w3schools.com/tags/
// var   htmlTagsOK  = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup data datalist dd del details dfn dialog dir div dl dt em embed fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script search section select small source span strike strong style sub summary sup svg table tbody td template textarea tfoot th thead time title tr track tt u ul var video wbr'.split(' ') ; // cull dangers?
