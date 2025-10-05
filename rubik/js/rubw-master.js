// Puzzle game - rotate rows or columns of the grid to unscramble the solution

// 2025 Sep 17  broken into multiple files... 

var codeBase = "js/" ;
var it ;
function include( ) { for ( let i=0 ; i<arguments.length ; i++ ) { file = arguments[ i ];
    document.write( '<script type="text/javascript" src="' + codeBase + file + '.js"></script>' ); }
}
include( 
  'words5' , 		// 5-letter word list
  'rubikxwds5' ,	// set of filled grids (temp measure?)
  'object3',		// some general helpers
  'watcher2',		// system for adding variable watchers
  'rubw-dom' ,		// DOM / html stuff
  'rubw-game' ,		// actual game (abstract)
  'rubw-ticker' ,	// task queuer for animations etc.
  'tilegrid'		// general grid of tiles device
  'rubw-html'		// rest of user interaction layer
       );

function go() {     it = new rubwGameHtml( )	;  }

window.addEventListener("load",(()=>go())) ;
