/*
 * javascript crossword code for including with a html file that is otherwise very close to
 * a plain text crossword file.
 * 
 * add-on for html stuff
 * 
 * Changes into version 3 ( in js2 ) May 2016 : 
 * 
 *   less use of document.write(), more use of document.createElement()
 * 
 *   script is included after body of html
 * 
 */

codeBase = "../js/"

function include( ) {
  // the arguments object is not an array and has no forEach method
  for ( i=0 ; i<arguments.length ; i++ ) {
    file = arguments[ i ];
    document.write( '<script type="text/javascript" src="' + codeBase + file + '.js"></script>' );
  }
}

// For now we will add "?mobile" to URL in order to use mobile-friendly layout
var mobileVersion =  ( document.URL.split( '?' )[ 1 ] == "mobile" ) ;
var mobileStr = mobileVersion ? "Mobile" : "" ;
var jsInterface = "xwdInterfaceHtml4" + mobileStr ;
var cssMain  = "../style/xwdMain3" + mobileStr + ".css" ;
var cssLocal = "xwdLocal" + mobileStr + ".css" ;
if ( mobileVersion ) {
    var met = document.createElement( 'meta' );
    met.setAttribute( "viewport" , "width=device-width, initial-scale=1.0" ) ; 
    document.head.appendChild( met ) ;
}
var links = 	'<link href="' + cssMain + '" rel="stylesheet" type="text/css">\n' +
		'<link href="' + cssLocal + '" rel="stylesheet" type="text/css">\n' +
		( mobileVersion ? '<link href="style/virtualKeyboard.css" rel="stylesheet" type="text/css">\n' : '' ) +
		'<link rel="shortcut icon" type="image/x-icon" href="../favicon.ico">\n' +
		'<script type="text/javascript" src="xwdLocal.js"></script>\n';
document.write( links ) ;
include(  "animframe_polyfill" , "watcher" , "object2" , "xwd4" , "xwdInterface4" , jsInterface ) ;

// Wait till the browser is ready to render the game (avoids glitches)

var xwds,it;		// make it public for easy debugging
window.onload = function() {// alert( 'onload' ) ;
    window.requestAnimationFrame(function () {
	// Allow for different frameworks in terms of where the puzzle data comes from
// 	if ( !xwds ) if ( xwdReader ) xwds = xwdReader();
	xwds = xwdInitAll( ) ;
	it = xwds[ 0 ] ;
	c0 = it.cells[ 0 ] ;  // for debugging
	// old version...
	//new xwdInterface( xwd , EventManager , HTMLActuator , LocalStorageManager );
    });
}
