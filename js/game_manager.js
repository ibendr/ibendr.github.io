function GameManager(size, target, InputManager, Actuator, StorageManager) {
  this.size           = size; // Size of the grid
  this.target = target || 12
  this.inputManager   = new InputManager;
  this.storageManager = new StorageManager( target );
  this.actuator       = new Actuator;

  this.startTiles     = 2;
  this.cheatEnabled = false
  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  this.setup();
};

// Keep playing after winning (allows going over target)
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
};

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {
  if (this.over || (this.won && !this.keepPlaying)) {
    return true;
  } else {
    return false;
  }
};

// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();

  // Reload the game from a previous game if present
  if (previousState) {
    this.grid        = new Grid(previousState.grid.size,
                                previousState.grid.cells); // Reload grid
    this.score       = previousState.score;
    this.over        = previousState.over;
    this.won         = previousState.won;
    this.keepPlaying = previousState.keepPlaying;
  } else {
    this.grid        = new Grid(this.size);
    this.score       = 0;
    this.over        = false;
    this.won         = false;
    this.keepPlaying = false;

    // Add the initial tiles
    this.addStartTiles();
  }

  // Update the actuator
  this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.83 ? 1 : ( Math.random() < 0.83 ? 2 : 3 );
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
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
    terminated: this.isGameTerminated()
  });

};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
    keepPlaying: this.keepPlaying
  };
};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.mergedAs = tile.value;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2: down, 3: left
  var self = this;
  var supermove = (direction & 4) && self.cheatEnabled;
  direction &= 3;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
	var positions = self.findFarthestPosition(cell, vector);
	var next      = self.grid.cellContent(positions.next);
	if (supermove && (positions.farthest === cell)) {
	  // supermove - deletes tiles in farthest row of cells.
	  // all others will then be able to move,  so not being
	  // able to move serves as test condition.
	  self.grid.removeTile(tile);
	}
	else {
	  // positions is { next , farthest } being next occupied cell
	  //	and farthest empty cell (one before next usually)

	  // As of 96: We now merge as many consecutive same values as occur
	  if (next && next.mergedAs === tile.value) {
	    var merged = new Tile(positions.next, tile.value + next.value);
	    merged.mergedFrom = next.mergedFrom || [ next ]
	    merged.mergedFrom.push(tile);
	    merged.mergedAs = tile.value;   // mergedAs is the original value of all the tiles being merged

	    // Update the score... formula is (new tile value) * (number of cells freed)
	    //   so need to correct from      (old tile value) * (prev number of cells freed)
	    self.score += ( next.value / tile.value ) * merged.value - 
			  ( next.value / tile.value - 1 ) * next.value;

	    self.grid.insertTile(merged);
	    self.grid.removeTile(tile);

	    // Converge the two tiles' positions
	    tile.updatePosition(positions.next);
/*
	    // Update the score
	    self.score += merged.value;*/

	    // The target tile
	    if (merged.value === self.target) {
	      self.score += 10 * self.target;	// a bonus to make it relevant to score-maximizers
	      self.won = true;
	    }
	  } else {
	    self.moveTile(tile, positions.farthest);
	  }

	  if (!self.positionsEqual(cell, tile)) {
	    moved = true; // The tile moved from its original cell!
	  }
	}
      }
    });
  });

  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
    }

    this.actuate();
  }
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // Up
    1: { x: 1,  y: 0 },  // Right
    2: { x: 0,  y: 1 },  // Down
    3: { x: -1, y: 0 }   // Left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var travx = [];
  var travy = [];

  for (var pos = 0; pos < this.size; pos++) {
    travx.push(pos);
    travy.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) travx = travx.reverse();
  if (vector.y === 1) travy = travy.reverse();

  // Make sure 'y' traversal (inner loop) is in direction of vector - didn't work
  return /*vector.y*/ true ? { x: travx , y : travy } : { x: travy , y : travx }
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
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

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
