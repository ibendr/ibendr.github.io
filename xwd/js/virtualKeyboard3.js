/* Framework for a simple soft keyboard.
 * ver 2 - rewrite more OOP
 * 
 * use data- tags on html elements to avoid
 * needing separate event functions
 * 
 * attribute names will all start with data-vkbd-
 * 
 * ver 3 - include 'sub-keyboards'
 * 
 * we assume prior inclusion of object2.js
 */

// names of attributes we'll use
const aPref = 'data-vkbd-' ; 
const aInd  = aPref + 'index' ;		//
// const aType = aPref + 'type' ;	// 0 = key code 	1 = function
// const aCode = aPref + 'code' ;  // numeric key code	[ fun , [ args ] ]	// CAN'T DO STRUCTURES!

function vKeyDo( ev , pa ) {
    var el  = ev.target ;
    // if click between keys, ignore (still cancel bubble)
    if ( el && el.classList && el.classList.contains( 'vKbdKey' ) ) {
	var k   = parseInt( el.getAttribute( aInd ) ) ;
	var key = pa.keys[ k ] ;
	var hiT = pa.highlightTime || 250 ;
	// highlight key for next 250ms or so
	el.classList.add( 'highlight' ) ;
	setTimeout( function() {
	    el.classList.remove( 'highlight' ) ; } , hiT ) ;
	// call custom function if there is one
	if ( key.fun ) {
	    key.fun.apply( key.obj , key.args ) ;
	}
	// otherwise fire keyboard event
	else {
	    fireKeyDown( key.code , key.mods ) ;
	}
	ev.preventDefault( ) ;
	killBubble( ev ) ;
    }
}
function fireKeyDown( k , m ) {
	// Fire a keydown event with keyCode k and modifier mask m
	var ev = document.createEvent( 'HTMLEvents' );
	ev.initEvent( 'keydown' , false , true );
	ev.which = k ;
	if ( m ) {
	    ev.shiftKey = ( k & 1 ) ? true : false ;
	    ev.ctrlKey  = ( k & 2 ) ? true : false ;
	    ev.altKey   = ( k & 4 ) ? true : false ;
	    ev.metaKey  = ( k & 8 ) ? true : false ;
	}
	document.dispatchEvent( ev );
}
function killBubble( ev ) { ev.stopPropagation( ) ; }
function keyCodeFromStr ( s ) {
    // TODO - handle trickier cases!
    return s.charCodeAt( 0 ) ;
}
function VirtualKey( pa , arg ) {
    // Constructor for one key of a virtual keyboard
    // pa is parent keyboard
    // arg can be:
    //		string: simple key, fires key code for character displayed
    //		array: [ label , width (relative to "regular" key) , action/s ]
    //			where action is number for keyCode or function to call
    //		instance of vKeyboardType, which means this key brings up another
    //			keyboard, e.g. of symbols or upper-case letters or a menu
    this.pa   = pa ;
    this.fun  = null ;	// function to call, and 'this' object and arguments
    this.obj  = null ;
    this.args = null ;
    this.code = null ;	// keyCode to fire 
    this.el   = elem( "div" , ( pa && pa.el ) , "vKbdKey" ) ;
    // we assume this will be pushed onto pa.keys, where
    //	its index will be the current length of that array
    this.el.setAttribute( aInd , '' + pa.keys.length ) ;
    
    // Process arg - simplest case string gives label and key code
    if (  typeof arg == "string" ) {
	this.label = arg ;
	this.width = 1 ;
	this.code  = ord( arg ) ;
    }
    // ...otherwise up to three parameters in array...
    else {
	this.label = arg[ 0 ].split('\n') ;
	this.code  = arg[ 1 ] || ord( arg[ 0 ][ 0 ] ) ;
	this.width = arg[ 2 ] || 1 ;
	this.fontS = arg[ 3 ] || 0 ;	// 0 is auto
	this.lineH = arg[ 4 ] || 0 ;
	
	var code = this.code ;
	// code is...	number : return that keycode (simple case)
	//		string : return keycode of first character
	//			(converted to number here)
	//		function : the function to be called rather
	//			than firing a key event
	//		vKeyboardType : bring up a sub-keyboard
	//		array  : [ keycode , modifiers ]
	//				OR
	//			 [ function , args ]
	if ( typeof code == 'number' ) {
	    if ( code == -1 ) {
		this.code = null ;
		this.fun  = switchKeyboard ;
		this.args = [ pa , pa.supKbd ] ;
		this.el.classList.add( 'contrast' ) ;
	    }		
	}
	else {
	    this.code = null ;
	    if ( typeof code == 'string' ) {
		this.code = ord( code ) ;
		this.mods = 0 ;
	    }
	    else if ( typeof code == 'function' ) {
		    this.fun  = code ;
		    this.obj  = null ;
		    this.args = [ ] ;
	    }
	    else if ( code instanceof vKeyboardType ) {
		    this.fun  = switchKeyboard ;
		    this.obj  = null ;
		    var subKbd = new VirtualKeyboard( pa.el.parentElement , code , pa ) ;
		    subKbd.el.style.display = 'none' ;
		    this.el.classList.add( 'contrast' ) ;
		    this.args = [ pa , subKbd ] ;
	    }
	    else if ( code instanceof Array && code.length > 1 ) {
		if ( typeof code[ 0 ] == 'function' ) {
		    this.fun  = code[ 0 ] ;
		    this.obj  = code[ 1 ] ;
		    this.args = code.slice( 2 ) ;
		}
		else if ( typeof code[ 1 ] == 'number' ) {
		    if ( typeof code[ 0 ] == 'number' ) {
			this.code = code[ 0 ] ;
			this.mods = code[ 1 ] ;
		    }
		    else if ( typeof code[ 0 ] == 'number' ) {
			this.code = ord( code[ 0 ] ) ;
			this.mods = code[ 1 ] ;
		    }
		}
	    }
	}
    }
    var continuing = false ;
    var longest = 0 ;
    for ( var line of this.label ) {
	if ( continuing ) {
	    this.el.appendChild( elem( 'br' ) ) ;
	}
	else {
	    continuing = true ;
	}
	this.el.appendChild( document.createTextNode( line ) )
	if ( longest < line.length ) longest = line.length ;
    }
    if ( ! this.lineH ) {
	this.lineH = 0.96 / this.label.length ;
    }
    if ( ! this.fontS ) {
	this.fontS = Math.min( this.width * 1.2 / ( 1 + longest ) , this.lineH ) ;
    }
/*	
    this.el.textContent = this.label[ 0 ] ;
    if ( this.label.length > 1 ) {
	for ( var i = 1 ;  i<this.label.length ; i++ ) {
	    this.el.appendChild( elem( 'br' ) ) ;
	    this.el.appendChild( document.createTextNode( this.label[ i ] ) ) ;
	}
    }*/
}
function switchKeyboard( k1 , k2 ) {
    k1.el.style.display = 'none' ;
    k2.el.style.display = 'block'  ;
}
function VirtualKeyboard( pa , typ , kbdPa ) {
    // Constructor for a virtual keyboard with pa as parent element and typ an object
    // describing the keyboard.
    // option kbdPa is parent keyboard if this is a subkeyboard
    // default values
    var pa  = pa  || document.body ;
    // we'll change to a more useful default one once we develop it!
    var typ = typ || virtualKeyboardTypes[ 'alphaOnlyUpper' ] ;
    
    this.typ  =   typ ;
    this.el     = elem( 'div' , pa , 'virtualKeyboard' ) ;
    this.rows   = typ[ 'rows'   ] ;
    this.aspect = typ[ 'aspect' ] ;
    var kbd = this ;
    this.keys = [ ] ;
    this.supKbd = kbdPa ;
//     this.nextIndex = 0 ;
    this.nRows = 0 ;
    this.widthKeys = 0 ;
    for (var row of this.rows) {
	// row can be array of keys (each is string or array) or just 
	// a single string, in which case we assume one character per key
	var rowPos = typ.offsets[ this.nRows ] || 0 ;
	if ( typeof row == "string" ) {
	    row = row.split( "" ) ;
	}
	for ( var arg of row ) {
	    var key = new VirtualKey( this , arg )
	    // position is in units of standard key size
	    key.pos = [ this.nRows , rowPos ] ;
	    rowPos += key.width ;
	    this.keys.push( key ) ;
	}
	if ( this.widthKeys < rowPos ) this.widthKeys = rowPos ;
	this.nRows ++ ;
    }
    var self = this ;
    
    // add event listeners
    // mouse
    this.el.addEventListener( "mousedown"  , function( ev ) { vKeyDo( ev , self ) } ) ;
    this.el.addEventListener( "mouseup"    , killBubble ) ;
    this.el.addEventListener( "mouseclick" , killBubble ) ;
//     this.el.onmousedown = function( ev ) { vKeyDo( ev , self ) } ;
//     this.el.onmouseup = this.el.onclick = killBubble ;
    // touch
    this.el.addEventListener( "touchstart"  , function( ev ) {	vKeyDo( ev , self ) } ) ;
    this.el.addEventListener( "touchend"    , killBubble ) ;
    this.el.addEventListener( "touchcancel" , killBubble ) ;
    this.el.addEventListener( "touchmove"   , killBubble ) ;
    
//     this.el.
    
    this.resize() ;
}
const keyHeightMin = 15 ;
mergeIn( VirtualKeyboard.prototype, {
    highlightTime: 300 ,
    resize: function ( w , h ) {
	// Get the full width so we can calculate individual key-widths
	var fullWidth = w || parseInt( window.getComputedStyle( this.el ).width ) ;
	var keyWidth  = Math.floor( fullWidth / this.widthKeys ) ;
	var keyHeight = ( h && Math.floor( ( h ) / this.nRows ) ) || ( keyWidth * this.aspect ) ; 
	var keyGap = keyHeight >> 4 ;
	this.el.style.height = stSiz( this.nRows     * keyHeight ) ;
	this.el.style.width  = stSiz( this.widthKeys * keyWidth  ) ;
	for (var key of this.keys) {
	    var st  = key.el.style ;
	    var pos = key.pos ;
	    st.height = stSiz( keyHeight - keyGap ) ;
	    st.width  = stSiz( keyWidth * key.width - keyGap ) ;
	    st.top  = stSiz( keyHeight  * pos[ 0 ]  + keyGap ) ;
	    st.left = stSiz( keyWidth   * pos[ 1 ] ) ; // ( rowOffset + keyN ) * keyWidth ;
	    // font size will depend on how long the label is
	    st.fontSize   = stSiz( keyHeight * key.fontS ) ;
	    st.lineHeight = stSiz( keyHeight * key.lineH ) ;
	}
    } 
} ) ;
// combine two types of keyboard (no culling repeats at this stage)
function vkCombine( vk1 , vk2 ) {
    // combine two virtual keyboard types
    return vKeyboardType(
	vk1.rows.concat( vk2.rows ) ,
	vk1.offsets.concat( vk2.offsets ) ,
	Math.max( vk1.widthKeys , vk2.widthKeys ) ,
	( vk1.aspect + vk2.aspect ) / 2 
			) ;
}
// as of ver 3, a class for keyboard types
function vKeyboardType( rows , offsets /*, widthKeys*/ , aspect ) {
    this.rows		= rows ;	// keys on each row
    this.offsets	= offsets ;	// row offsets in key-widths
//     this.widthKeys	= widthKeys || 0 ;	// total width needed in key-widths   // 0 => we'll compute
// 		                    // (which was computable as maximum (number of keys + offset) across rows, but
// 		                    // now more complicated as we have variable width keys.)
    this.aspect		= aspect || 1 ;	// multiply by width for height of keys
}
// vKeyboardType.prototype = new Object ;

function textWH( s ) {
    // width, height of piece of multi-line text
    var lines = s.split('\n') ;
    var h = lines.length ;
    var w = 0 ;
    for (var line in lines) {
	if ( w < line.length ) w = line.length ;
    }
    return [ w , h ] ;
}
// Some basic type to get started
virtualKeyboardTypes = {
	 alphaOnlyUpper : new vKeyboardType (
		 [ "QWERTYUIOP" , "ASDFGHJKL" , "ZXCVBNM" ] , 
		 [ 0 , 0.4 , 0.8 ]  /*, 10*/ ) ,
	 alphaUpperNav :  new vKeyboardType (
		 [ "QWERTYUIOP" , "ASDFGHJKL" , 
		    [ [ "tab"    ,  9 , 1.2  ] , 'Z','X','C','V','B','N','M', [ "\u232b" , 8 , 1.2 ] ] ,
		    [ [ "home"   , 36 , 1.2  ] , [ "end"    , 35 , 1.2 ] , 
		      [ "\u21e7" , 38 , 1.2  ] , [ "\u21e9" , 40 , 1.2 ] , 
		      [ "\u21e6" , 37 , 1.2  ] , [ "\u21e8" , 39 , 1.2 ] ,
		      [ "pgUp"   , 33 , 1.2  ] , [ "pgDn"   , 34 , 1.2 ]	] ]  ,
		 [ 0 , 0.5 , 0 , 0 ]  /*, 10*/ ) ,
	 alphaOnlyLower : new vKeyboardType (
		 [ "qwertyuiop" , "asdfghjkl" , "zxcvbnm" ] ,   // keys on each row
		 [ 0 , 0.4 , 0.8 ]  /*, 10*/ ) ,
	 alphaSillyUpper : new vKeyboardType (  // testing
		 [  [ "Q","W","E","R","T","Y","U","I","O","P" ,  [ "\u232b" , 8 , 1.2 ] ] ,
		    [ "A","S","D","F","G","H","J","K","L" ,   [ "^" , 36 , 1.6 ] ], 
		    [ [ "?" , [ function( m ) { alert( m ) } , "???" ], 0.8  ] ,
			'Z','X','C','V','B','N','M',' ',   [ "v" , 35 , 2.2 ] , ] ] , 
		 [ 0 , 0.4 , 0 ]  /*, 11.2*/ )
} ;
