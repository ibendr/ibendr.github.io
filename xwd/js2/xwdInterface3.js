/* Crossword solving interface - without front end
 * 
 * NB: non-interface crossword stuff is in xwd.js
 * 
 * Main classes here -
 * 
 *  xwdInterface  - the whole shebang  ie crossword plus cursors etc.
 * 
 *  We'll set it up (effectively)  as a subclass of crossword
 * 
 * */


// var cursor = null;
var showSolution = false;

xwdCell.prototype.clear  = function( ) { this.content = ""       }
xwdCell.prototype.reveal = function( ) { this.content = this.sol }
xwdCell.prototype.check  = function( ) { if ( this.content != this.sol ) this.clear( ) }


function xwdInterface( gridRows , clues ) {
    Crossword.call( this , gridRows , clues )
    if ( !gridRows ) return;

    this.cursorCell     = null;	// cell under cursor...
    this.cursorSpot     = null;	// ... and the spot its in
    this.currentClues   = [];	//    and the clue(s) for it
    this.displayClues   = [];	//	(also in display form)
    this.cursorSpots    = null;	//    and all the other spots covered by the same clue(s)
    this.values         = { };    //    letters entered in cells, indexed
					// by x,y (which is cast to text)
    this.initCursor();
}
//   this.cheatEnabled   = true;
// Where 2048 code used bind, our event manager registers listeners with target and method to call
  // NAVIGATION	
//     eventMethods = [ 
// 	"move" ,       // move in a direction
// 	"goto" ,       // go to particular cell (and dir'n)
// 	"home" ,       // to top of spot
// 	"end" ,        // to end of spot
// 	"nextSpot" ,   // on to next spot (not implemented yet)
// 	"insert" ,     // put text in
// 	"restart" ,    // clear the puzzle
// 	"revealAll" ,  // give up and show solution
// 	"revealSpot" , // show current word
// 	"checkAll" ,   // check answers entered so far
// 	"clearCell" ,  // delete content of current cell
// 	"backUp"       // delete content of current cell and go back a cell
// 	]
    //   for ( var i = 0 ; i < eventMethods.length ; i++ ) {
    //       meth = eventMethods[ i ] ;
    //       this.eventManager.on( meth , this, this[ meth ] ) ;
    //   }

xwdInterface.prototype = new Crossword

mergeIn( xwdInterface.prototype, {
    restart:     function ( ) {    // Restart the game
// 	this.storageManager.clearGameState();
    },
    initCursor: function () {
	this.cursorCell = this.cells.length && this.cells[ 0 ];
	if ( this.cursorCell ) {
	    if ( this.cursorCell.spots && this.cursorCell.spots.length ) {
	    this.cursorSpot = this.cursorCell.spots[ 0 ][ 0 ];
	    this.updateCurrentClues();
	    }
	}
    },
    nullCursor: function () {
	this.cursorCell  = null ;
	this.cursorSpot  = null ;
	this.cursorSpots = null ;
	this.updateCurrentClues();
    },
    clearCell: function ( ) {
	this.cursorCell.clear() ;
    },
    clearAll: function ( ) {
	this.cells.forEach( function ( cell ) {
	    cell.clear() ;
	});
    },
    backUp: function ( ) {
	this.clearCell( ) ;
	this.advanceCursor( ( ( this.cursorSpot && this.cursorSpot.label[ 0 ] ) || 0 ) | 2 ) ;
    },
    checkSpot: function () {
	if ( this.cursorSpot && this.cursorSpot.cells ) {
	    this.cursorSpot.cells.forEach( function ( cell ) {
		cell.check( )
	    });
	}
    },
    checkAll: function () {     // check whole grid
	this.cells.forEach( function ( cell ) {
		cell.check( )
	});
    },
    revealSpot:  function ( ) {    // reveal current word
	if ( this.cursorSpot && this.cursorSpot.cells ) {
	    this.cursorSpot.cells.forEach( function ( cell ) {
		cell.reveal() ;
	    });
	}
    },
    revealAll: function ( ) {     // reveal whole grid
	this.cells.forEach( function ( cell ) {
	    cell.reveal() ;
	});
    },
    home: function () {  // Home: top of current clue / spot
	this.moveToExtremity();
    },
    end: function () {   // End: bottom of current clue / spot
    this.moveToExtremity( true );
    },
    moveToExtremity: function ( end ) {  // go to top or bottom of clue / spot
	if ( this.cursorCell && this.cursorSpot ) {
	    if ( this.currentClues.length == 1 ) {
	    // exactly one clue - we'll go to end cell of end spot
	    var spots = this.currentClues[ 0 ].spots;
	    this.cursorSpot = spots[ end ? spots.length - 1 : 0 ];
	    }
	    // Otherwise just go to end of current spot
	    var cells = this.cursorSpot.cells;
	    this.cursorCell = cells[ end ? cells.length - 1 : 0 ];
	    this.updateCurrentClues();
	}
    },
    nextSpot: function () {  // (tab) - go to first cell of next spot in current direction
	if ( this.cursorCell && this.cursorSpot ) {
	}
    },
    updateCurrentClues: function () {
	this.currentClues = [];
	if ( this.cursorSpot ) {
	    // fetch clues in display and structural form
	    this.displayClues = this.displayCluesBySpot( this.cursorSpot );
	    this.currentClues = this.cluesBySpot( this.cursorSpot );
	    var otherSpots = [];
	    // and update list of other spots related by shared clue(s)
	    this.currentClues.forEach( function ( clue ) {
		otherSpots = otherSpots.concat( clue.spots );
	    }) ;
	    var i = otherSpots.indexOf( this.cursorSpot ) ;
	    if ( i > -1 ) {
		// remove actual cursor spot from 'others'
		otherSpots.splice( i , 1 ) ;
	    }
	    this.cursorSpots = otherSpots;
	//     alert( otherSpots.length );
	}
    },
    goto: function( destX , destY , destD ) {
	// revised in v3 - sensible coords now [ x , y, d ]
	var cell = this.cells2[ destY ][ destX ];
	if ( cell ) {
	    this.moveCursorToCell( cell , destD ? ( destD - 1 ) : 
		( ( this.cursorSpot && this.cursorSpot.label[ 0 ] ) || 0 ) );
	}
	else {
	    this.nullCursorCell( ) ;
	}
    },
    moveCursorToCell: function ( cell , d ) {
	if ( cell ) {
	this.cursorCell = cell;
    // 	if ( ( !this.cursorSpot ) || ( this.cursorSpot.cells.indexOf( cell ) == -1 ) ) {
	    // no longer in same spot (or wasn't in a spot)
	    var spots = cell.spots;
	    // If new cell only in one spot, that's our spot
	    // (although ideally if it's in wrong direction we should look for next one)
	    if ( spots.length == 1 ) {
		this.cursorSpot = spots[ 0 ][ 0 ];
	    } // if it's in two spots then we prefer our current direction
	    else if ( spots.length == 2 ) {
		this.cursorSpot = spots[ ( spots[ 0 ][ 0 ].label[ 0 ] == d ) ? 0 : 1 ][ 0 ];
	    }
	    else {
		this.cursorSpot = null;
	    }
	    this.updateCurrentClues();	// whether or not we found a valid spot
    // 	}
	}
	else { // no next live cell !?
	    this.cursorCell = null;
	    this.cursorSpot = null;
	}
    },
    advanceCursor: function ( d ) {
	if ( !this.cursorCell ) return this.initCursor();
	if ( !this.cursorSpot ) {
	    if ( this.cursorCell.spots && this.cursorCell.spots.length ) {
	    this.cursorSpot = this.cursorCell.spots[ 0 ][ 0 ];
	    }
	}
	if ( d == undefined ) d = ( this.cursorSpot && this.cursorSpot.label[ 0 ] ) || 0;
	var cell = this.nextLiveCell( this.cursorCell.pos.x , this.cursorCell.pos.y , d );
	this.moveCursorToCell( cell , d & 1 );
    },
    nextLiveCell: function ( x , y , d ) {
	// return nearest / next live cell at or after x,y moving in direction d
	var x0 = (x = x || 0);
	var y0 = (y = y || 0);
	d = d || 0;
	var cell = null;
	while ( !cell ) {
	    // move first, with wrap-arounds
	    if ( d==0 ) {
	    if ( ++x >= this.size[ 0 ] ) {
		x=0;
		if ( ++y >= this.size[ 1 ] ) y=0;
	    }
	    }
	    else if ( d==1 ) {
	    if ( ++y >= this.size[ 1 ] ) {
		y=0;
		if ( ++x >= this.size[ 0 ] ) x=0;
	    }
	    }
	    else if ( d==2 ) {
	    if ( --x < 0 ) {
		x=this.size[ 0 ] - 1;
		if ( --y < 0 ) y = this.size[ 1 ] - 1;
	    }
	    }
	    else if ( d==3 ) {
	    if ( --y < 0 ) {
		y= this.size[ 1 ] - 1;
		if ( --x < 0 ) x = this.size[ 0 ] - 1;
	    }
	    }
	    // then fetch (possible) cell
	    if ( !this.cells2[ y ] ) alert( y , x );
	    cell = this.cells2[ y ][ x ];
	    // check for searched whole grid (only needed if we get puzzles with no cells)
	    if ( ( !cell ) && ( x==x0 ) && ( y==y0 ) ) return null;
	}
	return cell;
    },
    serialize: function () {// Represent the current game as an object
	return {
	    grid:        this.grid.serialize(),
	};
    },
    insert: function ( keyCode ) { // Enter text into grid
	if ( this.cursorCell ) {
	    this.cursorCell.content = String.fromCharCode( keyCode );
	    this.advanceCursor();
	}
    },
    move: function ( direction ) {// Move cursor
	// 0: up, 1: right, 2: down, 3: left
	this.advanceCursor( direction & 3 );
    }
}) ; // end of prototype mergeIn command