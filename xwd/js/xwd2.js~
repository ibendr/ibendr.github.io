/*
 * crossword - specific javascript code
 * 
 * add-on for html stuff
 * 
 * version 2 - instead of including an .xwd.js file with js defining xwdClues, xwdGrid,
 * 		we include a plain text file in an iframe
 * 
 */

// Wait till the browser is ready to render the game (avoids glitches)

var xwd, xwdClues, xwdGrid;

var GM;		// make it public for easy debugging

window.requestAnimationFrame(function () {
  var xwdText = document.getElementsByTagName("pre")[ 0 ].textContent.split("\nSolution:\n");

  xwdClues = xwdText[ 0 ].split("\n");
  xwdGrid  = xwdText[ 1 ].split("\n");
  
  xwd = new Crossword( xwdGrid , xwdClues );
  
  GM  = new xwdInterface( xwd, EventManager, /*HTMLActuator*/null, localStorageManager() );
  
});