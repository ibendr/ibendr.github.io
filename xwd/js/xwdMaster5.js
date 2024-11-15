/*
 * javascript crossword code for including with a html file that is otherwise very close to
 * a plain text crossword file.
 * 
 * This master.js file mostly "includes" the rest of the necessary files ( *.js , *.css , favicon.ico )
 *   and sets up window.onload() to run xwdInitAll()
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
var links = 	'<link href="../style/xwdMain5.css" rel="stylesheet" type="text/css">\n' +
		'<link href="xwdLocal.css" rel="stylesheet" type="text/css">\n' +
		'<link href="../style/virtualKeyboard3.css" rel="stylesheet" type="text/css">\n' +
		'<link rel="shortcut icon" type="image/x-icon" href="../favicon.ico">\n' +
		'<script type="text/javascript" src="xwdLocal.js"></script>\n';
document.write( links ) ;
include(  "animframe_polyfill" , "watcher" , "object2" , "xwd5" , "xwdInterface4" , "virtualKeyboard3" , "xwdInterfaceHtml5" ) ;

// Wait till the browser is ready to render the game (avoids glitches)

var xwds,it;		// make it public for easy debugging
window.onload = function() {// alert( 'onload' ) ;
    window.requestAnimationFrame(function () {
	// Allow for different frameworks in terms of where the puzzle data comes from
// 	if ( !xwds ) if ( xwdReader ) xwds = xwdReader();
	xwds = xwdInitAll( ) ;
	it = xwds[ 0 ] ;
// 	c0 = it.cells[ 0 ] ;  // for debugging
	// old version...
	//new xwdInterface( xwd , EventManager , HTMLActuator , LocalStorageManager );
    });
}
