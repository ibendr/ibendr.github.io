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

function include( ) {
  // the arguments object is not an array and has no forEach method
  for ( i=0 ; i<arguments.length ; i++ ) {
    file = arguments[ i ];
    document.write( '<script type="text/javascript" src="' + file + '"></script>' );
  }
}

// For now we will add "?mobile" to URL in order to use mobile-friendly layout
var frontEnd = ( document.URL.split( '?' )[ 1 ] == "mobile" ) ? "js2/xwdInterfaceHtml.js" : "js2/xwdInterfaceHtmlMobile.js"

document.write( '<link href="style/xwdMain3.css" rel="stylesheet" type="text/css">\n' +
                '<link rel="shortcut icon" type="image/x-icon" href="favicon.ico">' );
include(   "js2/watcher.js" , "js2/object2.js" ,  "js2/xwd3.js" ,
    "js2/xwdInterface3.js" , frontEnd ) ;

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