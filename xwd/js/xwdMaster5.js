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

var codeBase = "../js/"
var defaultAuthor = "" ;
var useCtrlKeys = false ;

function include( ) {
    for ( let file of Array.from( arguments ) ) {
      document.write( '<script type="text/javascript" src="' + codeBase + file + '.js"></script>' );
    }
}
var links = `
<link href="../style/xwdMain5.css" rel="stylesheet" type="text/css">
<link href="../style/virtualKeyboard3.css" rel="stylesheet" type="text/css">
<link href="xwdLocal.css" rel="stylesheet" type="text/css">
<link rel="shortcut icon" type="image/x-icon" href="../favicon.ico">
<script type="text/javascript" src="xwdLocal.js"></script>
` ;
document.write( links ) ;
include(  "animframe_polyfill" , "watcher" , "object2" , "xwd5" , "xwdInterface4" , "virtualKeyboard3" , "xwdInterfaceHtml5" , "bendr-to-xml" ) ;

var xwds,it;		// make it public for easy debugging
window.onload = function() {// alert( 'onload' ) ;
    window.requestAnimationFrame(function () {
	// Allow for different frameworks in terms of where the puzzle data comes from
// 	if ( !xwds ) if ( xwdReader ) xwds = xwdReader();
	xwds = xwdInitAll( ) ;
	it = xwds[ 0 ] ;
    });
}
