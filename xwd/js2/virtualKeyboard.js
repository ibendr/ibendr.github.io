/* Framework for a simple soft keyboard.
 * I decided to write this to get around some of the issues I was having with the Android keyboard,
 *  especially retrieving keyboard events accurately. When predictive text or other things are
 *  invoked, the keycode 229 (keyboard buffer busy) is sent to the keyboard listener instead of the
 *  actual key pressed
 */
 
 virtualKeyboardTypes = {
	 alphaOnly : {
		 rows: [ "QWERTYUIOP" , "ASDFGHJKL" , "ZXCVBNM" ] ,   // keys on each row
		 offsets : [ 0 , 0.4 , 0.8 ]  ,                       // row offsets in key-widths
		 widthKeys : 10                                       // total width needed in key-widths 
		                    // (which should be computable as maximum (number of keys + offset) across rows)
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

 
 function fireKey( k , target ) {
	  // alert( k ) ;
	 // Fire a keyboard event with keyCode k on target (or document)
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
		 // row can be array of strings (one for each keys) or just 
		 // a single string, in which case we assume one character per key
		 if ( typeof row == "string" ) {
			 row = row.split( "" ) ;
		 }
		 var rowOffset = typ.offsets[ rowN ] ;
		 var rowTop = rowN * ( keyHeight + keyGap ) + ( keyGap >> 1 )
		 row.forEach( function( key , keyN ) {
			 var it = elem( 'div' , kbd.el , 'key' ) ;
			 var st = it.style ;
			 it.textContent = key ;
			 st.width = keyWidth - keyGap * 2 ;
			 st.top = rowTop ;
			 st.left = ( rowOffset + keyN ) * keyWidth ;
			 it.onclick = function( ev ) {
				 fireKey( key.charCodeAt( 0 ) ) ;
			 }
		 } ) ;
	 } ) ;
 }