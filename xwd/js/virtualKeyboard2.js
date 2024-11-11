/* Framework for a simple soft keyboard.
 * ver 2 - rewrite more OOP
 * 
 * use data- tags on html elements to avoid
 * needing separate event functions
 * 
 * attribute names will all start with data-vkbd-
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
	    key.fun( key.args ) ;
	}
	// otherwise fire keyboard event
	else {
	    fireKeyDown( key.code ) ;
	}
    }
    killBubble( ev ) ;
}
function fireKeyDown( k ) {
	// Fire a keydown event with keyCode k
	var ev = document.createEvent( 'HTMLEvents' );
	ev.initEvent( 'keydown' , false , true );
	ev.which = k ;
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
    this.pa   = pa ;
    this.fun  = null ;
    this.code = null ; 
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
	this.label = arg[ 0 ] ;
	this.width = arg[ 1 ] || 1 ;
	this.code  = arg[ 2 ] || ord( arg[ 0 ] ) ;
	// if code isn't number or string...
	if ( ! typeof this.code == 'number' ) {
	    if ( typeof this.code == 'string' ) {
		this.code = ord( this.code ) ;
	    }
	    else {
		if ( typeof this.code == 'function' ) {
		    this.fun  = this.code ;
		    this.args = [ ] ;
		}
		else {
		    this.fun  = this.code[ 0 ] ;
		    this.args = this.code.slice( 1 ) ;
		}
		this.code = null ;
	    }
	}
    }
    this.el.textContent = this.label ;
}
    
function VirtualKeyboard( pa , typ , w ) {
    // Constructor for a virtual keyboard with pa as parent element and typ an object
    // describing the keyboard. optionally w is width in pixels
    
    // default values
    var pa  = pa  || document.body ;
    var typ = typ || virtualKeyboardTypes[ 'alphaOnlyUpper' ] ;
    
    this.typ  = typ ;
    this.el   = elem( 'div' , pa , 'virtualKeyboard' ) ;
    this.rows = typ[ 'rows' ] ;
    var kbd = this ;
    this.keys = [ ] ;
//     this.nextIndex = 0 ;
    this.nRows = 0 ;
    for (var row of this.rows) {
	// row can be array of keys (each is string or array) or just 
	// a single string, in which case we assume one character per key
	var rowPos = typ.offsets[ this.nRows ] ;
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
	this.nRows ++ ;
    }
    var self = this ;
    
    this.el.onmousedown = function( ev ) { vKeyDo( ev , self ) } ;
//     this.el.onmousedown = function( ev ) { vKeyDo( ev , pa ) } ;
    this.el.onmouseup = this.el.onclick = killBubble ;

    this.resize() ;
}
const keyHeightMin = 15 ;
mergeIn( VirtualKeyboard.prototype, {
    highlightTime: 300 ,
    resize: function ( w , h ) {
	// Get the full width so we can calculate individual key-widths
	var fullWidth = w || parseInt( window.getComputedStyle( this.el ).width ) ;
	var keyWidth  = Math.floor( fullWidth / this.typ.widthKeys ) ;
	var keyHeight = ( h && Math.floor( ( h ) / this.nRows ) ) || keyWidth ; 
	var keyGap = keyHeight >> 4 ;
	this.el.style.height = stSiz( this.nRows         * keyHeight ) ;
	this.el.style.width  = stSiz( this.typ.widthKeys * keyWidth  ) ;
	for (key of this.keys) {
	    var st  = key.el.style ;
	    var pos = key.pos ;
	    st.height = stSiz( keyHeight - keyGap ) ;
	    st.width  = stSiz( keyWidth * key.width - keyGap ) ;
	    st.top  = stSiz( keyWidth  * pos[ 0 ] + keyGap ) ;
	    st.left = stSiz( keyHeight * pos[ 1 ] ) ; // ( rowOffset + keyN ) * keyWidth ;
	    st.fontSize   = stSiz( keyHeight * 1.0 * key.width / ( 1 + key.label.length ) ) ;
	    st.lineHeight = stSiz( keyHeight * 0.75 ) ;
	}
    } 
} ) ;
// combine two types of keyboard (no culling repeats at this stage)
function vkCombine( vk1 , vk2 ) {
    // combine two virtual keyboard types
    return {
	rows :        vk1.rows.concat( vk2.rows ) ,
	offsets :     vk1.offsets.concat( vk2.offsets ) ,
	widthKeys :   Math.max( vk1.widthKeys , vk2.widthKeys )
    } ;
}
// Some basic type to get started
virtualKeyboardTypes = {
	 alphaOnlyUpper : {
		 rows: [ "QWERTYUIOP" , "ASDFGHJKL" , "ZXCVBNM" ] ,   // keys on each row
		 offsets : [ 0 , 0.4 , 0.8 ]  ,                       // row offsets in key-widths
		 widthKeys : 10                                       // total width needed in key-widths 
		                    // (which was computable as maximum (number of keys + offset) across rows, but
		                    // now more complicated as we have variable width keys.)
	 },
	 alphaUpperNav : {
		 rows: [	"QWERTYUIOP" , 
				"ASDFGHJKL" , 
			 [ [ "tab"    , 1.2 ,  9 ] , 'Z','X','C','V','B','N','M', [ "\u232b" , 1.2 , 8 ] ] ,
			 [ [ "hom"    , 1.2 , 36 ] , [ "end"    , 1.2 , 35 ] , 
			   [ "\u21e7" , 1.2 , 38 ] , [ "\u21e9" , 1.2 , 40 ] , 
			   [ "\u21e6" , 1.2 , 37 ] , [ "\u21e8" , 1.2 , 39 ] ] ] ,
		 offsets : [ 0 , 0.5 , 0 , 0 ]  ,                       // row offsets in key-widths
		 widthKeys : 10                                       // total width needed in key-widths 
	 },
	 alphaOnlyLower : {
		 rows: [ "qwertyuiop" , "asdfghjkl" , "zxcvbnm" ] ,   // keys on each row
		 offsets : [ 0 , 0.4 , 0.8 ]  ,                       // row offsets in key-widths
		 widthKeys : 10                                       // total width needed in key-widths 
		                    // (which was computable as maximum (number of keys + offset) across rows, but
		                    // now more complicated as we have variable width keys.)
	 },
	 alphaSillyUpper : {  // testing
		 rows: [ 
		    [ "Q","W","E","R","T","Y","U","I","O","P" ,  [ "\u232b" , 1.2 , 8 ] ] ,
		    [ "A","S","D","F","G","H","J","K","L" ,   [ "^" , 1.6 , 36 ] ], 
		    [ [ "?" , 0.8 , [ function( m ) { alert( m ) } , "???" ] ] ,
			'Z','X','C','V','B','N','M',' ',   [ "v" , 2.2 , 35 ] , ] ] , 
		 offsets : [ 0 , 0.4 , 0 ]  ,                       // row offsets in key-widths
		 widthKeys : 11.2                                       // total width needed in key-widths 
		                    // (which was computable as maximum (number of keys + offset) across rows, but
		                    // now more complicated as we have variable width keys.)
	 }
	 
} ;
