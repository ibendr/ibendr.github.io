/* Framework for a simple soft keyboard.
 * I decided to write this to get around some of the issues I was having with the Android keyboard,
 *  especially retrieving keyboard events accurately. When predictive text or other things are
 *  invoked, the keycode 229 (keyboard buffer busy) is sent to the keyboard listener instead of the
 *  actual key pressed
 */
 
 
function vkCombine( vk1 , vk2 ) {
    // combine two virtual keyboard types
    return {
	rows :        vk1.rows.concat( vk2.rows ) ,
	offsets :     vk1.offsets.concat( vk2.offsets ) ,
	widthKeys :   Math.max( vk1.widthKeys , vk2.widthKeys )
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
 
 var keyHeightMin = 36 ; // hard-wire for now
 var keyGap = 4 ;
 
 function vKeyFire( ev ) {
    this.kCodes.forEach( function( k ) {
	if ( typeof k == 'number' )
	    fireKey( k , it ) ;
	else {/*
	    alert ( k.length + " ... " + k ) ;*/
	    if ( k.length == 1 ) {
		    k[ 0 ]( ) ;
	    }
	    else if ( k.length == 2 ) {
		    k[ 0 ]( k[ 1 ] , it ) ;
	    }
	    else {
		    k[ 0 ].apply( k[ 1 ] , k[ 2 ] ) ;
	    }
	}
    } ) ;
    ev.stopPropagation( ) ;
    //ev.preventDefault( ) ;
}
function convKeyCodeArgs( args ) {
    if      ( typeof args == 'number' )   return args ;
    else if ( typeof args == 'string' )   return keyCodeFromStr( args ) ;
    // function is stored as [ fun , args ]
    else if ( typeof args == 'function' ) return [ args , [ ] ] ;
    else if ( 'length' in args && args.length == 2  && 
	    ( typeof args[ 0 ] == 'function' ) && 
	    ( typeof args[ 1 ] == 'object' ) )  return args ;
}
function keyCodeFromStr ( s ) {
    // TODO - handle trickier cases!
    return s.charCodeAt( 0 ) ;
}
function VirtualKey( pa , arg ) {
    // Constructor for one key of a virtual keyboard
    // arg can be:
    //		string: simple key, fires key code for character displayed
    //		array: [ label , width (relative to "regular" key) , action/s ]
    //			where action is number for keyCode or function to call
    if (  typeof arg == "string" ) {
	var kLabel = arg ;
	var kWidth = 1 ;
	var kCode  = arg.split('') ;
    }
    else {
	var kLabel = arg[ 0 ] ;
	var kWidth = arg[ 1 ] || 1 ;
	var kCode  = arg[ 2 ] || arg[ 0 ].split('') ;
    }
    // Now build array of actions
    var kCodes = [ ] ;
    var kC = convKeyCodeArgs( kCode ) ;
    if ( kC ) {
	kCodes = [ kC ] ;
    }
    else if ( ( typeof kCode == 'object' ) && ('length' in kCode ) ) {
	for ( kC of kCode ) kCodes.push( convKeyCodeArgs( kC ) ) ;
    }
//     if ( typeof kCode == 'number' ) {
// 	kCodes.push( kCode ) ;
//     }
//     else if ( typeof kCode == 'function' ) {
// 	kCodes.push( [ kCode , [ ] ] )
//     }
//     else if ( typeof kCode == 'string' ) {
// 	kCodes.push( keyCodeFromStr[ kCode ] )
//     }
//     else if ( 'length' in kCode && kCode.length == 2 && 
// 	( typeof kCode[ 0 ] == 'function' ) && ( typeof kCode[ 1 ] == 'object' ) ) {
// 	kCodes.push( kCode ) ;
//     }
//     else { // assume array of strings or numbers or things
// 	kCode.forEach( function( k ) {
// 	    kCodes.push( ( typeof k != 'string' ) ? k : k.charCodeAt( 0 ) ) ;
// 	} ) ;
//     }
}
    
function VirtualKeyboard( pa , typ , w ) {
	 // Constructor for a virtual keyboard with pa as parent element and typ an object
	 // describing the keyboard. optionally w is width in pixels
	 
	 // default values
	 pa  = pa  || document.body ;
	 typ = typ || virtualKeyboardTypes[ 'alphaOnlyUpper' ] ;
	 
	 this.typ  = typ ;
	 this.el   = elem( 'div' , pa , 'virtualKeyboard' ) ;
	 this.rows = typ[ 'rows' ] ;
	 var kbd = this ;
	 this.keys = [ ] ;
	 this.rows.forEach( function( row , rowN ) {
		// row can be array of keys (each is string or array) or just 
		// a single string, in which case we assume one character per key
		if ( typeof row == "string" ) {
			row = row.split( "" ) ;
		}
		var rowPos = typ.offsets[ rowN ] * keyWidth ;
		var rowTop = rowN * ( keyHeight + keyGap ) + keyGap
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
		    else if ( 0 in kCode && 1 in kCode && ( typeof kCode[ 0 ] == 'function' ) ) {
			kCodes.push( kCode ) ;
		    }
		    else { // assume array of strings or numbers or things
			kCode.forEach( function( k ) {
			    kCodes.push( ( typeof k != 'string' ) ? k : k.charCodeAt( 0 ) ) ;
			} ) ;
		    }
		    var it = elem( 'div' , kbd.el , 'key' ) ;
		    var st = it.style ;
		    var wid = kWidth * keyWidth
		    it.textContent = kLabel ;
		    st.width  = stSiz(    wid    - keyGap * 2 ) ;
		    st.height = stSiz( keyHeight - keyGap ) ;
		    st.top  = stSiz( rowTop ) ;
		    st.left = stSiz( rowPos ) ; // ( rowOffset + keyN ) * keyWidth ;
		    st.fontSize   = stSiz( keyHeight * 1.0 / ( 1 + kLabel.length ) ) ;
		    st.lineHeight = stSiz( keyHeight * 0.75 ) ;
		    rowPos += wid ;
		    it.onclick = function( ev ) {
			kCodes.forEach( function( k ) {
			    if ( typeof k == 'number' )
				fireKey( k , it ) ;
			    else {/*
				alert ( k.length + " ... " + k ) ;*/
				if ( k.length == 1 ) {
					k[ 0 ]( ) ;
				}
				else if ( k.length == 2 ) {
					k[ 0 ]( k[ 1 ] , it ) ;
				}
				else {
					k[ 0 ].apply( k[ 1 ] , k[ 2 ] ) ;
				}
			    }
			} ) ;
			ev.stopPropagation( ) ;
// 			ev.preventDefault( ) ;
		    }
		    it.onmousedown = function( ev ) {
			ev.stopPropagation( ) ;
// 			ev.preventDefault( ) ;
		    }
		    it.onmouseup = function( ev ) {
			ev.stopPropagation( ) ;
// 			ev.preventDefault( ) ;
		    }
		 } ) ;
	 } ) ;
 }
mergeIn( VirtualKeyboard.prototype, {
    resize: function ( w , h ) {
	 // Get the full width so we can calculate individual key-widths
	 var fullWidth = w || parseInt( window.getComputedStyle( this.el ).width ) ;
	 var keyWidth  = fullWidth / typ.widthKeys ;
	 var keyHeight = Math.max( keyHeightMin , keyWidth ) ;
	 var keyGap = keyHeight >> 4 ;
	 this.el.style.height = stSiz( this.rows.length * ( keyHeight + keyGap ) ) ;
	
    }
} ) ;
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
