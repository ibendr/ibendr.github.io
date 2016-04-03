function xwdInterface( xwd, EventManager, Actuator, StorageManager ) {
  this.xwd            = xwd;
  this.size           = this.xwd.size; // Size of the grid [ width , height ]
  this.eventManager   = new EventManager;
  this.storageManager = new StorageManager( "Xwd-" + xwdPuzzleName );
  this.actuator       = new Actuator;
  
  this.cursorCell     = null;	// cell under cursor...
  this.cursorSpot     = null;	// ... and the spot its in
  this.currentClues   = [];	//    and the clue(s) for it
  this.displayClues   = [];	//	(also in display form)
  this.cursorSpots    = null;	//    and all the other spots covered by the same clue(s)

  this.startTiles     = 2;
  this.cheatEnabled   = true;
//   This section makes bound versions of the xwdInterface object's methods ( move , end , solve ... )
//   	i.e. functions which call them with this xwdInterface object as 'this' even when they aren't
//   	called by local code (i.e. other methods of xwdInterface, which would have 'this' already set)
//   This is done so that they can be called by the eventManager's emit() function
//   NOTE: There should be plenty of other ways around this.  e.g. register object, method pairs 
//	with the input manager.  Raises question about overall organisation - why does the input
//   	manager belong to a particular object? etc. Perhaps my own event handler (one per browser,
//   	routing events to different objects) is better structured
  // NAVIGATION	
  this.eventManager.on( "move",        this, this.move );	// move in a direction
  this.eventManager.on( "goto",        this, this.goto );	// go to particular cell (and dir'n)
  this.eventManager.on( "home",        this, this.home );	// to top of spot
  this.eventManager.on( "end",         this, this.end  );	// to end of spot
  this.eventManager.on( "nextSpot",    this, this.nextSpot );	// on to next spot (not implemented yet)
  // ACTIONS
  this.eventManager.on( "insert",      this, this.insert );	// put text in
  this.eventManager.on( "restart",     this, this.restart );	// clear the puzzle
  this.eventManager.on( "solve",       this, this.revealAll );	// give up and show solution
  this.eventManager.on( "cheat",       this, this.revealSpot );	// show current word
  this.eventManager.on( "check",       this, this.checkAll );	// check answers entered so far
//   this.eventManager.on( "keepPlaying", this, this.keepPlaying );	// ? (2048 legacy)

  this.setup();
}

// Restart the game
xwdInterface.prototype.restart = function () {
    this.storageManager.clearGameState();
    this.actuator.continueGame(); // Clear the game won/lost message
    showSolution = false;
    this.setup();
};
xwdInterface.prototype.revealSpot = function () { 
    // reveal current word
    if ( this.cursorSpot && this.cursorSpot.cells ) {
	var self = this;
	this.cursorSpot.cells.forEach( function ( cell ) {
	    // reveal cell
	    var cellPos = cell.pos;
	    var cellTile = self.grid.cells[ cellPos.y ][ cellPos.x ];
	    if ( cellTile ) {
		cellTile.value = cell.sol;
	    }
	});
	this.actuate();
    }
};
xwdInterface.prototype.revealAll = function () { 
    // reveal whole grid
    var self = this;
    this.xwd.cells.forEach( function ( cell ) {
	var cellPos = cell.pos;
	var cellTile = self.grid.cells[ cellPos.y ][ cellPos.x ];
	if ( cellTile ) {
	    cellTile.value = cell.sol;
	}
    });
    this.actuate();
};
xwdInterface.prototype.checkSpot = function () {
    if ( this.cursorSpot && this.cursorSpot.cells ) {
	var self = this;
	this.cursorSpot.cells.forEach( function ( cell ) {
	    // reveal cell
	    var cellPos = cell.pos;
	    var cellTile = self.grid.cells[ cellPos.y ][ cellPos.x ];
	    if ( cellTile ) {
		if ( cellTile.value != cell.sol ) cellTile.value = " ";
	    }
	});
	this.actuate();
    }
    
};
xwdInterface.prototype.checkAll = function () { 
    // check whole grid
    var self = this;
    this.xwd.cells.forEach( function ( cell ) {
	var cellPos = cell.pos;
	var cellTile = self.grid.cells[ cellPos.y ][ cellPos.x ];
	if ( cellTile ) {
	    if ( cellTile.value != cell.sol ) cellTile.value = " ";
	}
    });
    this.actuate();
};
/*
// Solve the puzzle (show the solution)
xwdInterface.prototype.solve = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  showSolution = true;
  this.setup();
};*/
// Home: top of current clue / spot
xwdInterface.prototype.home = function () {
  this.moveToExtremity();
};
// End: bottom of current clue / spot
xwdInterface.prototype.end = function () {
  this.moveToExtremity( true );
};
xwdInterface.prototype.moveToExtremity = function ( end ) {
  // go to top or bottom of clue / spot
  if ( this.cursorCell && this.cursorSpot ) {
    this.prepareTiles();
    if ( this.currentClues.length == 1 ) {
      // exactly one clue - we'll go to end cell of end spot
      var spots = this.currentClues[ 0 ].spots;
      this.cursorSpot = spots[ end ? spots.length - 1 : 0 ];
    }
    // Otherwise just go to end of current spot
    var cells = this.cursorSpot.cells;
    this.cursorCell = cells[ end ? cells.length - 1 : 0 ];
    this.updateCurrentClues();
    this.actuate();
  }
};
// nextSpot (tab) - go to first cell of next spot in current direction
xwdInterface.prototype.nextSpot = function () {
  if ( this.cursorCell && this.cursorSpot ) {
  }
};


// Keep playing after winning (allows going over target)
xwdInterface.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
};

// Return true if the game is lost, or has won and the user hasn't kept playing
xwdInterface.prototype.isGameTerminated = function () {
  if (this.over || (this.won && !this.keepPlaying)) {
    return true;
  } else {
    return false;
  }
};

// Set up the game
xwdInterface.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();

  // Reload the game from a previous game if present
  if ( previousState ) {
    this.grid        = new Grid( previousState.grid.size,
                                 previousState.grid.cells ); // Reload grid
    this.score       = previousState.score;
    this.over        = previousState.over;
    this.won         = previousState.won;
    this.keepPlaying = previousState.keepPlaying;
  } else {
    this.grid        = new Grid( this.size );
//     alert( this.grid.cells[0] );
    this.score       = 0;
    this.over        = false;
    this.won         = false;
    this.keepPlaying = false;
    this.newestTile  = null;

    // Add the initial tiles
    this.addStartTiles();
  }
  this.initCursor();

  // Update the actuator
  this.actuate();
};

// var cursor = null;
var showSolution = false;

// Set up the initial tiles to start the game with
xwdInterface.prototype.addStartTiles = function () {
    for ( var y=0 ; y<this.size[ 1 ] ; y++ ) {
	for ( var x=0 ; x<this.size[ 0 ] ; x++ ) {
	    var cell = this.xwd.cells2[ y ][ x ];
	    if ( cell ) {
	    var tile = this.addTileAt( { x: x , y: y } , 
		    showSolution ? this.xwd.cellContent[ cell.name ] : " " , cell.label );
	    }
	    else {
	    this.addTileAt( { x: x , y: y } , '*' );
	    }
	}
    }
};
xwdInterface.prototype.initCursor = function () {
  this.cursorCell = this.xwd.cells.length && this.xwd.cells[ 0 ];
  if ( this.cursorCell ) {
    if ( this.cursorCell.spots && this.cursorCell.spots.length ) {
      this.cursorSpot = this.cursorCell.spots[ 0 ][ 0 ];
      this.updateCurrentClues();
    }
  }
}
xwdInterface.prototype.updateCurrentClues = function () {
  this.currentClues = [];
  if ( this.cursorSpot ) {
    // fetch clues in display and structural form
    this.displayClues = this.xwd.displayCluesBySpot( this.cursorSpot );
    this.currentClues = this.xwd.cluesBySpot( this.cursorSpot );
    var otherSpots = [];
    // and update list of other spots related by shared clue(s)
    this.currentClues.forEach( function ( clue ) {
      otherSpots = otherSpots.concat( clue.spots );
    }) ;
    this.cursorSpots = otherSpots;
//     alert( otherSpots.length );
  }
}
xwdInterface.prototype.goto = function( destination ) {
//     destination will be format "xx-yy-d" where xx,yy are coordinates numbered from 01
//				and d is direction 0: unspecified, 1: across, 2: down
//     alert("Going to "+destination);
    var destX = parseInt( destination.slice(0,2) );
    var destY = parseInt( destination.slice(3,5) );
    var destD = parseInt( destination.slice(6,7) );
    if ( destX * destY ) {
	var cell = this.xwd.cells2[ destY - 1 ][ destX - 1 ];
	this.moveCursorToCell( cell , destD ? ( destD - 1 ) : 
		( ( this.cursorSpot && this.cursorSpot.label[ 0 ] ) || 0 ) );
    }
    else {
	this.cursorCell = null;
	this.cursorSpot = null;
    }
    this.actuate();
	
};
xwdInterface.prototype.moveCursorToCell = function ( cell , d ) {
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
};
xwdInterface.prototype.advanceCursor = function ( d ) {
    if ( !this.cursorCell ) return this.initCursor();
    if ( !this.cursorSpot ) {
	if ( this.cursorCell.spots && this.cursorCell.spots.length ) {
	this.cursorSpot = this.cursorCell.spots[ 0 ][ 0 ];
	}
    }
    if ( d == undefined ) d = ( this.cursorSpot && this.cursorSpot.label[ 0 ] ) || 0;
    var cell = this.nextLiveCell( this.cursorCell.pos.x , this.cursorCell.pos.y , d );
    this.moveCursorToCell( cell , d );
}

xwdInterface.prototype.nextLiveCell = function ( x , y , d ) {
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
    if ( !this.xwd.cells2[ y ] ) alert( y , x );
    cell = this.xwd.cells2[ y ][ x ];
    // check for searched whole grid (only needed if we get puzzles with no cells)
    if ( ( !cell ) && ( x==x0 ) && ( y==y0 ) ) return null;
  }
  return cell;
}
  

// Adds a tile in a random position 
// inner part of this funtion now removed to the new addTileAt
xwdInterface.prototype.addRandomTile = function () {
    if (this.grid.cellsAvailable()) {
	return this.addTileAt( this.grid.randomAvailableCell() );
    }
};

// Adds a tile in a specified position
xwdInterface.prototype.addTileAt = function ( cell , v , l ) {
    /*alert*/( cell.x + '-' + cell.y );
    var value = v || ( Math.random() < 0.83 ? 1 : ( Math.random() < 0.83 ? 2 : 3 ) )
    var label = l || "";
    var tile = new Tile( cell , value , label );
    this.grid.insertTile( tile );
    this.newestTile = tile;
    return tile
};

// Sends the updated grid to the actuator
xwdInterface.prototype.actuate = function () {
    if (this.storageManager.getBestScore() < this.score) {
	this.storageManager.setBestScore(this.score);
    }

    // Clear the state when the game is over (game over only, not win)
    if (this.over) {
	this.storageManager.clearGameState();
    } else {
	this.storageManager.setGameState(this.serialize());
    }

    this.actuator.actuate(this.grid, {
	score:      this.score,
	over:       this.over,
	won:        this.won,
	bestScore:  this.storageManager.getBestScore(),
	terminated: this.isGameTerminated(),
	currentClue:this.displayClues.join("\n"),
    } , this.cursorCell , this.cursorSpot , this.cursorSpots , this.xwd.cells2 );

};

// Represent the current game as an object
xwdInterface.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
    keepPlaying: this.keepPlaying
  };
};

// Save all tile positions and remove merger info
xwdInterface.prototype.prepareTiles = function () {
    this.grid.eachCell( function ( x , y , tile ) {
	if ( tile ) {
	tile.mergedFrom = null;
	tile.mergedAs = tile.value;
	tile.savePosition();
	}
    });
};

// Move a tile and its representation
xwdInterface.prototype.moveTile = function ( tile , cell ) {
    this.grid.cells[ tile.y ][ tile.x ] = null;
    this.grid.cells[ cell.y ][ cell.x ] = tile;
    tile.updatePosition( cell );
};

// Enter text into grid
xwdInterface.prototype.insert = function ( keyCode ) { 
    if ( this.cursorCell ) {
	var cursorPos = this.cursorCell.pos;
	var cursorTile = this.grid.cells[ cursorPos.y ][ cursorPos.x ]
	if ( cursorTile ) {
	cursorTile.value = String.fromCharCode( keyCode );
	this.prepareTiles(); // makes previous position = current position so last move isn't reanimated
	this.advanceCursor();
	this.actuate();
	}
    }
}


// Move cursor
xwdInterface.prototype.move = function ( direction ) {
    // 0: up, 1: right, 2: down, 3: left
    this.prepareTiles(); // makes previous position = current position so last move isn't reanimated
    this.advanceCursor( direction & 3 );
    this.actuate();
};

// Get the vector representing the chosen direction
xwdInterface.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 1,  y: 0 },  // Right
    1: { x: 0,  y: 1 },  // Down
    2: { x: -1, y: 0 },  // Left
    3: { x: 0,  y: -1 }  // Up
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
xwdInterface.prototype.buildTraversals = function (vector) {
  var travx = [];
  var travy = [];

  for (var pos = 0; pos < this.size[ 0 ]; pos++) {
    travx.push(pos);
  }
  for (var pos = 0; pos < this.size[ 1 ]; pos++) {
    travy.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) travx = travx.reverse();
  if (vector.y === 1) travy = travy.reverse();

  // Make sure 'y' traversal (inner loop) is in direction of vector - didn't work
  return /*vector.y*/ true ? { x: travx , y : travy } : { x: travy , y : travx }
};

xwdInterface.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

xwdInterface.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
xwdInterface.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent( cell );

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

xwdInterface.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
