/*
 * javascript crossword code for including with a html file that is otherwise very close to
 * a plain text crossword file.
 * 
 * add-on for html stuff
 * 
 */

// look for query

function include( ) {
  // the arguments object is not an array and has no forEach method
  for ( i=0 ; i<arguments.length ; i++ ) {
    file = arguments[ i ];
    document.write( '<script type="text/javascript" src="' + file + '"></script>' );
  }
}

var xwdPuzzleName; // we may introduce another mechanism for specifying the puzzle name
if ( !xwdPuzzleName ) {
    var url = document.URL;
    // take the puzzle name to be the filename stripped of path and (last) extension
    xwdPuzzleName = url.slice( url.lastIndexOf('/') + 1, url.lastIndexOf('.') ) || "untitled";
}

document.write( '\
  <head>\
    <title>' + xwdPuzzleName + '</title>\
  </head><body>\
  <link href="style/xwdMain.css" rel="stylesheet" type="text/css">\
  ');

include(
  "js/xwd.js" , "js/xwd_polyfills.js" , "js/xwdEventManager.js" ,
  "js/xwd_actuator.js" , "js/grid.js" , "js/tile.js" ,
  "js/local_storage_manager.js" , "js/xwdInterface2.js" , "js/xwdGo.js" );

stdHtml = '\
  <table class="layout">\
    <tr>\
      <td class="game-container">\
	<div class="tile-container">\
	</div>\
	<div class="grid-container">\
        </div>\
	<div class="game-message">\
	  <p></p>\
	  <div class="lower">\
	    <a class="keep-playing-button">Keep going</a>\
	    <a class="retry-button">Try again</a>\
	  </div>\
	</div>\
      </td>\
      <td class="side-bar">\
	<div class="heading">\
	  <h1 id="title">' + xwdPuzzleName + '</h1>\
	</div>\
	<p class="game-intro"></p>\
	<a class="restart-button">Clear grid</a>\
	<a class="solution-button">Show solution</a>\
	<a class="cheat-button">Cheat (show word)</a>\
	<a class="check-button">Check progress</a>\
	<p class="game-explanation"> \
	</p>\
	<p id="clue-container" class="clue-container">\
	</p>\
      </td>\
    </tr>\
  </table>\
</body>\
'
document.write( stdHtml )

var xwdClues, xwdGrid, xwd;

xwdReader = function() {
  var gridEls  = document.getElementsByClassName( "xwdSolution" );
  var gridEl   = gridEls && gridEls.length && gridEls[ 0 ];
  
  var cluesEls = document.getElementsByClassName( "xwdClues" );
  var cluesEl  = cluesEls && gridEls.length && cluesEls[ 0 ];
  
  xwdGrid  =  gridEl ?  gridEl.textContent.split("\n") : [];
  xwdClues = cluesEl ? cluesEl.textContent.split("\n") : [];
  
//   alert( xwdGrid );
  
  if ( cluesEl && cluesEl.style ) cluesEl.style.display = "none";
  
  return ( xwd = new Crossword( xwdGrid , xwdClues ) );
}


