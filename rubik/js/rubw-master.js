// Puzzle game - rotate rows or columns of the grid to unscramble the solution

// 2025 Sep 17  broken into multiple files... 

var codeBase = "js/" ;
function include( ) { for ( let i=0 ; i<arguments.length ; i++ ) { file = arguments[ i ];
    document.write( '<script type="text/javascript" src="' + codeBase + file + '.js"></script>' ); }
}
include( 
  'words5' , 		// 5-letter word list
  'rubikxwds5' ,	// set of filled grids (temp measure?)
  'rubw-dom' ,		// some general helpers
  'rubw-game' ,		// actual game (abstract)
  'rubw-ticker' ,	// task queuer for animations etc.
  'rubw-html'		// user interaction layer
       );

window.addEventListener("load",(()=>go())) ;
