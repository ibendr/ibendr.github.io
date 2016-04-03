/*
 * Confusing setup about 'cells' is worth explaining... 
 * 
 *  A 'cell' passed as a data object is an object (dictionary) 
 * 	with numeric x and y fields, no other content:  e.g. { x: 3 , y: 6 }
 * 
 *  On the other hand, the grids cells field is actually a nested array
 *      giving the content of the cells,  hence the content of the
 * 	above cell is in <grid>.cells[3][6]	(content being null or tile)
 * 
 *  To add further confusion,  a function to be called back by the grid.eachCell
 * 	method should take the arguments ( x , y , content )
 */
function Grid( size , previousState ) {
  this.size = ( typeof size == "number" ) ? [ size , size ] : size ;
  this.cells = previousState ? this.fromState( previousState ) : this.empty();
}

// Build a grid of the specified size
Grid.prototype.empty = function () {
  var cells = [];

  for (var y = 0; y < this.size[ 1 ]; y++) {
    var row = cells[ y ] = [];

    for (var x = 0; x < this.size[ 0 ]; x++) {
      row.push(null);
    }
  }

  return cells;
};

Grid.prototype.fromState = function ( state ) {
  var cells = [];

  for (var y = 0; y < this.size[ 1 ]; y++) {
    var row = cells[ y ] = [];

    for (var x = 0; x < this.size[ 0 ]; x++) {
      var tile = state[ y ][ x ];
      row.push(tile ? new Tile( tile.position , tile.value , tile.label ) : null);
    }
  }

  return cells;
};

// Find the first available random position
Grid.prototype.randomAvailableCell = function () {
  var cells = this.availableCells();

  if (cells.length) {
    return cells[Math.floor(Math.random() * cells.length)];
  }
};

Grid.prototype.availableCells = function () {
  var cells = [];

  this.eachCell( function ( x , y , tile ) {
    if ( !tile ) {
      cells.push( { x: x, y: y } );
    }
  });

  return cells;
};

// Call callback for every cell
Grid.prototype.eachCell = function (callback) {
  for (var y = 0; y < this.size[ 1 ]; y++ ) {
    for (var x = 0; x < this.size[ 0 ]; x++ ) {
      callback(x, y, this.cells[ y ][ x ]);
    }
  }
};

// Check if there are any cells available
Grid.prototype.cellsAvailable = function () {
  return !!this.availableCells().length;
};

// Check if the specified cell is taken
Grid.prototype.cellAvailable = function (cell) {
  return !this.cellOccupied(cell);
};

Grid.prototype.cellOccupied = function (cell) {
  return !!this.cellContent(cell);
};

Grid.prototype.cellContent = function (cell) {
  if (this.withinBounds(cell)) {
    return this.cells[ cell.y ][ cell.x ];
  } else {
    return null;
  }
};

// Inserts a tile at its position
Grid.prototype.insertTile = function ( tile ) {
//   alert( this.cells[0] /*tile.y + ',' + tile.x*/ );
  this.cells[ tile.y ][ tile.x ] = tile;
};

Grid.prototype.removeTile = function ( tile ) {
  this.cells[ tile.y ][ tile.x ] = null;
};

Grid.prototype.withinBounds = function (position) {
  return position.x >= 0 && position.x < this.size[ 0 ] &&
         position.y >= 0 && position.y < this.size[ 1 ];
};

Grid.prototype.serialize = function () {
  var cellState = [];

  for (var y = 0; y < this.size[ 1 ]; y++) {
    var row = cellState[ y ] = [];

    for (var x = 0; x < this.size[ 0 ]; x++) {
      row.push(this.cells[ y ][ x ] ? this.cells[ y ][ x ].serialize() : null);
    }
  }

  return {
    size: [ this.size[ 0 ], this.size[ 1 ] ],
    cells: cellState
  };
};
