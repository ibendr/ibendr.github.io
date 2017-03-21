/* Framework for a simple soft keyboard.
 * I decided to write this to get around some of the issues I was having with the Android keyboard,
 *  especially retrieving keyboard events accurately. When predictive text or other things are
 *  invoked, the keycode 229 (keyboard buffer busy) is sent to the keyboard listener instead of the
 *  actual key pressed.
 * 
 *    vKey2    branches from virtualKeyboard, going to a more object-oriented approach
 * 
 *  separation of layers -
 * 
 *   abstract keys - labels, actions, positions on grid
 * 
 *   html presentation
 * 
 *  action is object (to be this), function to apply, 
 *   plus extra arguments to pass (as well as event and target)
 */
vkKeyLabels = {
    Left: 	'\u2190',
    Up: 	'\u2191',
    Right: 	'\u2192',
    Down: 	'\u2193',   
    Backspace:	'\u232b',
    Del:	'\u2421'
} ;
vkKeyCodes = {
    Backspace:	8,
    Tab:	9,
    Enter:	13,
    Shift:	16,
    Ctrl:	17,
    Alt:	18,
    Pause:	19,
    CapsLock:	20,
    Esc:	27,
    Space:	32,
    PgUp:	33,
    PgDn:	34,
    End:	35,
    Home:	36,
    Left: 	37,
    Up: 	38,
    Right: 	39,
    Down: 	40,
    Ins:	45,
    Del:	46,
    F1:  	112,
    F2:  	113,
    F3:  	114,
    F4:  	115,
    F5:  	116,
    F6:  	117,
    F7:  	118,
    F8:  	119,
    F9:  	120,
    F10:	121,
    F11:	122,
    F12:	123,
    NumLock:	144,
    ScrollLock:	145,
//     semi-colon	186,
//     equal sign	187,
//     comma	188,
//     dash	189,
//     period	190,
//     forward slash	191,
//     grave accent	192,
//     open bracket	219,
//     back slash	220,
//     close braket	221,
//     single quote	222,
    NULL:	0
} ;
function vKeyboardSpec( obj ) {
}

vKeyboardSpec.prototype = {
    expandRows: function ( ) {
	this.lefts = [ ] ;
	if ( ! this.keyWidth ) this.keyWidth = 0 ;
	this.rows.forEach( function( row , rowN ) {
	    // row can be array of keys (each is string or array) or just 
	    // a single string, in which case we assume one character per key
	    if ( typeof row == "string" ) {
		    row = row.split( "" ) ;
	    }
	    var rowPos = this.offsets[ rowN ] ;
// 	    var theseLefts = [ rowPos ] ;
	    var rowTop = rowN ;
	    row.forEach( function( key , keyN ) {
		// key is either string (label == key to simulate) or array
		//  for more control [ label , width , [ actions ] ] where
		//  each 'action' is a key code to send (positive integer)
		//  or some action ( NOTE:yet to implement )
		if (  typeof key == "string" ) key = [ key ] ;
		var kLabel = key[ 0 ] ;
		var kWidth = key[ 1 ] || 1 ;
		var kCode  = key[ 2 ] || key[ 0 ].split('') ;
		var kLeft  = key[ 3 ] || rowPos ;
		rowPos = kLeft + kWidth
		// extract numeric keyCodes from various formats
		var kCodes = [ ] ;
		if ( typeof kCode == 'number' ) {
		    kCodes.push( kCode ) ;
		}
		else { // assume array of strings or numbers
		    kCode.forEach( function( k ) {
			kCodes.push( ( typeof k == 'number' ) ? k : k.charCodeAt( 0 ) ) ;
		    } ) ;
		}
	    } ) ;
	} ) ;
    } ,
    append: function ( other ) {
	this.rows    =    this.rows.concat( other.rows ) ;
	this.offsets = this.offsets.concat( other.offsets ) ;
	this.lefts   =   this.lefts.concat( other.lefts ) ;
	this.widthKeys = Math.max( this.widthKeys , other.widthKeys ) ;
}
    virtualKeyboardTypes = {
	 alphaOnly : {
		 rows: [ "QWERTYUIOP" , "ASDFGHJKL" , "ZXCVBNM" ] ,   // keys on each row
		 offsets : [ 0 , 0.4 , 0.8 ]  ,                       // row offsets in key-widths
		 widthKeys : 10                                       // total width needed in key-widths 
		                    // (which was computable as maximum (number of keys + offset) across rows, but
		                    // now more complicated as we have variable width keys.)
	 }
 } ;
 
// Simple shorthand for creating an element with a particular parent and class(es)
// Saves importing full dom module
// NOTE: this may duplicate the definition in other modules, so beware of possible conflicts
// Initially, it was lifted verbatum from xwdInterfaceHtml.js
function elem( tag , pa , clss ) {
    var el = document.createElement( tag ) ;
    if ( pa ) {
	pa.appendChild( el ) ;
    }
    if ( clss ) {
	if ( ! ( clss instanceof Array ) ) clss = [ clss ] ;
	clss.forEach( function ( cls ) {
	    el.classList.add( cls ) ;
	} ) ;
    }
    return el ;
}

function vkCombine( vk1 , vk2 ) {
    // combine two virtual keyboard types
    return {
	rows :        vk1.rows.concat( vk2.rows ) ,
	offsets :  vk1.offsets.concat( vk2.offsets ) ,
	widthKeys : Math.max( vk1.widthKeys , vk2.widthKeys )
    } ;
}
 
 function fireKey( k , src , target ) {
// 	alert( k , src , target ) ;
	// Fire a keyboard event with keyCode k (prompted by pressing element src) on target (or document)
	if ( src ) {
	    src.style.background = "red" ;
// 	    src.classList.add( "vkPressed" ) ;
// 	    alert (src.classList) ;
	    setTimeout( function() {
		src.style.background = "" ;
// 		src.classList.remove( "vkPressed" ) ;
	    } , 250 ) ;
	}
	var ev = document.createEvent( 'HTMLEvents' );
	ev.initEvent( 'keydown' , false , true );
	ev.which = k ;
	( target || document ).dispatchEvent( ev );
 }
 
 var keyHeight = 36 ; // hard-wire for now
 var keyGap = 4 ;
 
 function virtualKeyboard( pa , typ ) {
	 // Constructor for a virtual keyboard with pa as parent element and typ an object
	 // describing the keyboard. 
	 
	 // default values
	 pa  = pa  || document.body ;
	 typ = typ || virtualKeyboardTypes[ 'alphaOnly' ] ;
	 
	 this.typ  = typ ;
	 this.el   = elem( 'div' , pa , 'virtualKeyboard' ) ;
	 this.rows = typ[ 'rows' ] ;
	 this.el.style.height = this.rows.length * ( keyHeight + keyGap ) ;
	 // Get the full width so we can calculate individual key-widths
	 var fullWidth = parseInt( window.getComputedStyle( this.el ).width ) ;
	 var keyWidth  = fullWidth / typ.widthKeys ;
	 var kbd = this ;
	 this.keys = [ ] ;
	 this.rows.forEach( function( row , rowN ) {
		// row can be array of keys (each is string or array) or just 
		// a single string, in which case we assume one character per key
		if ( typeof row == "string" ) {
			row = row.split( "" ) ;
		}
		var rowPos = typ.offsets[ rowN ] * keyWidth ;
		var rowTop = rowN * ( keyHeight + keyGap ) + ( keyGap >> 1 )
		row.forEach( function( key , keyN ) {
		    // key is either string (label == key to simulate) or array
		    //  for more control [ label , width , [ actions ] ] where
		    //  each 'action' is a key code to send (positive integer)
		    //  or some action ( NOTE:yet to implement )
		    if (  typeof key == "string" ) {
			var kLabel = key ;
			var kWidth = 1 ;
			var kCode  = key.split('') ;
		    }
		    else {
			var kLabel = key[ 0 ] ;
			var kWidth = key[ 1 ] || 1 ;
			var kCode  = key[ 2 ] || key[ 0 ].split('') ;
		    }
		    var kCodes = [ ] ;
		    if ( typeof kCode == 'number' ) {
			kCodes.push( kCode ) ;
		    }
		    else { // assume array of strings or numbers
			kCode.forEach( function( k ) {
			    kCodes.push( ( typeof k == 'number' ) ? k : k.charCodeAt( 0 ) ) ;
			} ) ;
		    }
		    var it = elem( 'div' , kbd.el , 'key' ) ;
		    var st = it.style ;
		    var wid = kWidth * keyWidth
		    it.textContent = kLabel ;
		    st.width = wid - keyGap * 2 ;
		    st.top = rowTop ;
		    st.left = rowPos ; // ( rowOffset + keyN ) * keyWidth ;
		    rowPos += wid ;
		    it.onclick = function( ev ) {
			kCodes.forEach( function( k ) {
			    fireKey( k , it ) ;
			} ) ;
			ev.preventDefault( ) ;
		    }
		    it.onmousedown = /*function( ev ) {
			    ev.preventDefault( ) ;
		    }
		  */  it.onmouseup = function( ev ) {
			    ev.preventDefault( ) ;
		    }
		 } ) ;
	 } ) ;
 }