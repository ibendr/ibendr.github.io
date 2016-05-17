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

// var xwdPuzzleName; // we may introduce another mechanism for specifying the puzzle name
// if ( !xwdPuzzleName ) {
//     var url = document.URL;
//     // take the puzzle name to be the filename stripped of path and (last) extension
//     xwdPuzzleName = url.slice( url.lastIndexOf('/') + 1, url.lastIndexOf('.') ) || "untitled";
// }

document.write( '<link href="style/xwdMain3.css" rel="stylesheet" type="text/css">' );
include(   "js2/watcher.js" , "js2/object2.js" , /*"js2/dom3.js" , "js2/htmlElement5.js" ,*/
  "js2/xwd3.js" , /*"js/xwd_polyfills.js" , "js/xwdEventManager.js" ,
  "js/xwd_actuator.js" , "js/grid.js" , "js/xwdTile.js" ,*/
  /*"js/local_storage_manager.js" ,*/ "js2/xwdInterface3.js" , "js2/xwdInterfaceHtml.js"
  /*, "js/xwdGo.js" */);

// elXwdDiv = document.getElementById( 'xwdDiv' ) || document.body


// // elTable = htmlElement('table', [ { class: "layout" } ] )


xwdMasterInit = function() { //alert('xwdMasterInit')
    var xwdEls = document.getElementsByClassName( "xwd" ) ;
    xwds = [ ] ;
    if ( xwdEls ) {
	for ( var i = 0 ; i < xwdEls.length ; i++ ) {
	    xwds.push(  new xwdInterfaceHtml( xwdEls.item( i ) ) ) ;
	}
    }
}

// Was in application.js...

// Wait till the browser is ready to render the game (avoids glitches)

var xwds,it;		// make it public for easy debugging
window.onload = function() { //alert( 'onload' ) ;
    window.requestAnimationFrame(function () {
	// Allow for different frameworks in terms of where the puzzle data comes from
// 	if ( !xwds ) if ( xwdReader ) xwds = xwdReader();
	xwdMasterInit( )
	it = xwds[ 0 ] //new xwdInterface( xwd , EventManager , HTMLActuator , LocalStorageManager );
    });
 }