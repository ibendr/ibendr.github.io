/* Crossword solving interface - without front end as such
 * 
 * NB: non-interface crossword stuff is in xwd.js
 * 
 * Main classes here -
 * 
 *  xwdInterface  - the whole shebang  ie crossword plus cursors etc.
 * 
 *  We'll set it up (effectively)  as a subclass of crossword
 * 
 * 
 * ver 4: changing "moveCursorTo..." to "select..."
 *              and creating selectClue here - 
 *              it was effectively being done in html layer.
 *
 * 
 * */


// var cursor = null;
var xwdNoCursor = false;
var showSolution = false;

xwdCell.prototype.clear  = function( ) { this.content = ""       }
xwdCell.prototype.reveal = function( ) { this.content = this.sol }
xwdCell.prototype.check  = function( ) { if ( this.content != this.sol ) this.clear( ) }


function xwdInterface( gridRows , clues ) {
    Crossword.call( this , gridRows , clues )
    if ( !gridRows ) return;
    this.nullCursor( );
//    if ( this.cursorStart ) {
//       this.goto.apply( this , parseInts( this.cursorStart ) ) ;
//    }
//     this.cursorCell     = null;	// cell under cursor...
//     this.cursorSpot     = null;	// ... and the spot its in
//     this.cursorSpots    = null;	//    and all the other spots covered by the same clue(s)
//     this.cursorClue     = [];   // Chosen clue or unique clue for spot
//     this.cursorClues    = [];	//  other relevant clues
    this.displayClues   = [];	//	(also in display form)
    this.values         = { };    //    letters entered in cells, indexed
					// by x,y (which is cast to text)
//     this.initCursor();
}

xwdInterface.prototype = new Crossword

mergeIn( xwdInterface.prototype, {
//     restart:     function ( ) {    // Restart the game
// // 	this.storageManager.clearGameState();
//     }, // replaced by .clearAll()
    initCursor: function () {
    	if ( this.cursorStart ) {
	    if ( this.cursorStart != "none" )
	    	this.goto.apply( this , parseInts( this.cursorStart ) ) ;
	}
	else {
	    this.cursorCell = this.cells.length && this.cells[ 0 ];
	    if ( this.cursorCell ) {
	        if ( this.cursorCell.spots && this.cursorCell.spots.length ) {
	            this.cursorSpot = this.cursorCell.spots[ 0 ][ 0 ];
	            this.selectCluesBySpot();
		}
	    }
	}
    },
    nullCursor: function () {// alert('taking cursor away')
	this.cursorCell  = null ;
	this.cursorSpot  = null ;
	this.cursorSpots = [ ]  ;
        this.cursorClue  = null ;
        this.cursorClues = [ ]  ;
    },
    clearCell: function ( ) {
        if ( this.cursorCell ) this.cursorCell.clear() ;
    },
    clearSpot: function ( spot ) {
        if ( spot = spot || this.cursorSpot ) {
           spot.cells.forEach( function ( cell ) {
                cell.clear() ;
           });
        }
    },
    clearSpots: function ( ) {
	if ( this.cursorSpots ) {
	    this.cursorSpots.forEach( this.clearSpot ) ;
	}
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
    checkSpot: function ( spot ) {
        if ( spot = spot || this.cursorSpot ) {
          if ( spot.cells ) {
	    spot.cells.forEach( function ( cell ) {
		cell.check( )
	    });
          }
	}
    },
    checkSpots: function () {
        if ( this.cursorSpots ) {
            this.cursorSpots.forEach( this.checkSpot ) ;
        }
    },
    checkAll: function () {     // check whole grid
	this.cells.forEach( function ( cell ) {
		cell.check( )
	});
    },
    revealSpot:  function ( spot ) {    // reveal main cursor spot only
	if ( spot = spot || this.cursorSpot ) {
	    spot.cells.forEach( function ( cell ) {
		cell.reveal() ;
                });
        }
    },
    revealSpots:  function ( ) {    // reveal all cursor spots
        if ( this.cursorSpots ) {
            this.cursorSpots.forEach( this.revealSpot ) ;
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
	    if ( this.cursorClues.length == 1 ) {
	    // exactly one clue - we'll go to end cell of end spot
	    var spots = this.cursorClues[ 0 ].spots;
	    this.cursorSpot = spots[ end ? spots.length - 1 : 0 ];
	    }
	    // Otherwise just go to end of current spot
	    var cells = this.cursorSpot.cells;
	    this.cursorCell = cells[ end ? cells.length - 1 : 0 ];
	    this.selectCluesBySpot();
	}
    },
    nextSpot: function ( back /*= false*/ ) {  // (tab) - go to first cell of next spot in current direction
	if ( this.cursorCell && this.cursorSpot ) { // TODO
		var spot  = it.cursorSpot ;
		var spots = it.spots[ spot.dir ] ;
        var newSpotIndex = ( spots.indexOf(spot) + ( back ? -1 : 1 ) + spots.length ) % spots.length ;
		this.selectSpot( spots [ newSpotIndex ] ) ;
	}
    },
    selectCluesBySpot: function () {
// 	this.cursorClues = [];
	if ( this.cursorSpot ) {
	    // fetch clues in display and structural form
	    this.displayClues = this.displayCluesBySpot( this.cursorSpot );
	    this.cursorClues = this.cluesBySpot( this.cursorSpot );
	    this.cursorClue = ( this.cursorClues.length == 1 ) ?
                this.cursorClues[ 0 ] : null ;
	    var otherSpots = [];
	    // and update list of other spots related by shared clue(s)
	    this.cursorClues.forEach( function ( clue ) {
		otherSpots = otherSpots.concat( clue.spots );
	    }) ;
	    this.cursorSpots = otherSpots;
	}
    },
    goto: function( destX , destY , destD ) {
	// revised in v3 - sensible coords now [ x , y, d ]
	var cell = this.cells2[ destY ][ destX ];
	if ( cell ) {
	    this.selectCell( cell , destD ? ( destD - 1 ) : 
		( ( this.cursorSpot && this.cursorSpot.label[ 0 ] ) || 0 ) );
	}
	else {
	    this.nullCursor( ) ; // ??
	}
    },
    selectSpot: function ( spot ) {
	if ( spot && spot.cells )
	    this.selectCell( spot.cells[ 0 ], spot.label[ 0 ] )
	else this.nullCursor( ) ;
    },	
    selectCell: function ( cell , d ) {
      if ( cell ) {
	this.cursorCell = cell;
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
      }
      else { // no next live cell !?
        this.cursorCell = null;
        this.cursorSpot = null;
      }
      this.selectCluesBySpot();	// whether or not we found a valid spot
    },
    selectClue: function ( clue ) {
        this.cursorClue   =   clue   ;
        this.cursorClues  = [ clue ] ;
        this.displayClues = [ clue.display ] ;
        this.selectSpotsByClue( clue ) ;        
    },
    selectSpotsByClue: function ( clue ) {
        clue = clue || this.cursorClue ;
        this.cursorSpots = clue.spots ;
//      this.cursorSpot  = ( clue.spots.length == 1 ) ? clue.spots[ 0 ] : null ;
        this.cursorSpot  = ( clue.spots.length ) ? clue.spots[ 0 ] : null ;
        this.cursorCell  = this.cursorSpot && this.cursorSpot.cells[ 0 ] ;
    },
    advanceCursor: function ( d ) {
	var cell = this.cursorCell , spot = this.cursorSpot
	// If there is no cursor create one...
	if ( !( cell && spot ) ) return this.initCursor() ;
	if ( d == undefined ) { // means advance within spot
	    // look out for end of spot - next spot / stay
	    if ( cell == spot.cells[ spot.cells.length - 1 ] ) {
		if ( this.cursorSpots.length > 1 ) {
		    // go to next spot in multi-spot clue ?
		    var i = this.cursorSpots.indexOf( this.cursorSpot )
		    if ( ( i > -1 ) && ( i < this.cursorSpots.length - 1) ) {
			this.selectSpot( this.cursorSpots[ i + 1 ] ) ;
		    }
		}
		// If no next spot in clue to go to, stay here
		return ;
	    }
	    d = ( this.cursorSpot && this.cursorSpot.label[ 0 ] ) || 0;
	}
	var cell = this.nextLiveCell( this.cursorCell.pos[ 0 ] , this.cursorCell.pos[ 1 ] , d );
	this.selectCell( cell , d & 1 );
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
	    if ( !this.cells2[ y ] ) alert( 'bad coords' + y + ',' + x ) ;
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
    insert: function ( keyCode ) { // Enter text into grid and move to next cell
	if ( this.cursorCell ) {
	    this.cursorCell.content = String.fromCharCode( keyCode );
	    this.advanceCursor();
	}
// 	else { return -1 ; }
    },
    move: function ( direction ) {// Move cursor
	// 0: up, 1: right, 2: down, 3: left
	this.advanceCursor( direction & 3 );
    }
}) ; // end of prototype mergeIn command
