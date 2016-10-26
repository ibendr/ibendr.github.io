/*
 * 
 * Version 1 ( June 2015 ) -
 * 
 * We are now separating the html interface out from the core abstract entity
 * 
 *   (interface will be in gameBoardHtml or such)
 * 
 * Conversely, some more processing will occur here in terms
 *  of neighbour relations etc.
 * 
 * Classes defined here -
 * 
 * GameBoardCell	cell (spot) of a game board
 * 
 * GameBoard		the game board itself - needn't be a rectangular space,
 * 			but has cells which may be indexed by whatever structure.
 * 			The expectation is that the indices come from some sort
 * 			of directed (vector) space,  manifest by being able to
 * 			add some entities (vectors) to an index to get another one.
 * 			In other words, a sense of directed movement
 * 
 * RectGameBoard	subclass of GameBoard with indices of form [ i , j ]
 * 			where 0 <= i < width , 0 <= j < height. * 
 * 
 */

include( "array2" )

function GameBoardCell( board , index ) {
    // index must be from the indeces set of the board ( in rectangular boards, [ i , j ] coordinates of cell )
    // We use index instead of i,j to fit with more general model ( e.g. 3D , hex , ... )
    this.board      = board;      // the board that the cell is part of
    this.pieces     = [ ];        // "pieces" that are on the square / in the spot
    this.index      = index;      // should be of a data type that board.indexAdd can add to
    board.cells[ index ]  = this; // if index is array (e.g. coordinates), access will work NOTE: array converted to string
//     this.neighbours = { };     // neighbours by 'moves'
}

GameBoardCell.prototype = {
    relative: function ( move ) {
	// returns the cell positioned relative to this one
	return this.board.cells[ this.board.indexAdd( this.index , move ) ];
    },
    add:      function ( piece ) { 
	this.pieces.push( piece );
	if ( "cell" in piece ) piece.cell = this;
	this.board.pieces[ this.index ] = piece ;	
    },
    remove:   function ( piece ) { 
	this.pieces.remove( piece );
    },
    // occ() is shorthand for first (= only in most games) occupant of cell
    occ:      function () { return  this.occupants[ 0 ]; },
    isEmpty:  function () { return !this.occupants.length; }
};

function GameBoard( indices , indexAdd , cellName ) {
/* Parameters to gameBoard constructor:
 * 	indices    - set of objects / values to use as index in dictionary of cells
 * 	indexAdd   - function for adding ( some type of object / 'vector' ) to index
 * 	cellName   - function from index to string representation of the cell
*/
    if (arguments.length==0) return; // allows easier subclassing
//     this.indices  = indices; // shouldn't need as we can test if ( index in this.cells )
    this.indexAdd = indexAdd;
    this.cellName = ( cellName = cellName || toString); // once we get dictionaries working
			    // with array / object indices, we'll not really need naming
			    // Correction: need reference system independent of object pointers
			    //  so that we can run identical operations on separated instances
    this.pieces   = { }; // piece -> cell
    this.cells    = { }; // index -> cell
    var self = this;
    indices.forEach( function ( index ) {
	// we only need to call the constructor - not do anything with returned object.
	// It gets added to the cells dictionary by the constructor.
	new GameBoardCell( self , index );
    });
}

GameBoard.prototype = {
    // Convenient function to fetch occupant of spot
    at: function( index ) { return this.cells[ index ].pieces[ 0 ]; },
    remove: function ( piece ) { // take off the cell and board, but don't delete
	piece.cell.remove( piece );
// 	piece.cell = null;	// leave the cell reference to record where it was
			    // likewise we keep piece.board intact
 	this.pieces.remove( piece );	// Does this result in piece being garbage collected?
	    // Answer - only if appropriate - e.g.  if it might be needed back for an undo
	    //		then it will be referenced in the undo history, so safe from gc.
    }
};

function vectAdd2D( v1 , v2 ) { return [ v1[ 0 ] + v2[ 0 ] , v1[ 1 ] + v2[ 1 ] ]; }

// Rectangular game board as a subclass

function RectGameBoard ( m , n , cellName ) {
//     Game board with a array of rectangular indeces { [ 1,1 ] , [ 2,1 ] , [ 3,1 ] , ... , [ m,1 ] ,
//						        [ 1,2 ] ,   ...   , 
//								. . .		      ... , [ m,n ] }	
    this.m = ( m = m || 8 ) ;
    this.n = ( n = n || 8 ) ;
    var indices = [ ];
    for ( var j = 1 ; j <= n ; j++ ) {
	for ( var i = 1 ; i <= m ; i++ ) {
	    indices.push( [ i , j ] )
    }   }
//     var this.indeces = indeces; // unnecessary - we can use "...for ( index in this.cells )..."
    // Call super-constructor with the list of indeces , normal vector addition,
    //		and ( if no other specified ) chess-style cell cell naming ( a1 - h8 )
    GameBoard.call( this, indices , vectAdd2D , cellName || cellNameA1 );
}

RectGameBoard.prototype = new GameBoard ;
// {
// };

// cellNameA1 gives a (chess style) letter-number reference such as "e4"
// For bigger boards, 0-9 continues into A... ( as in hexadecimal ), using
//   capitals initially - so less clash with a... for first coordinate
var _letters="_abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
var _numbers="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"
function cellNameA1( ij ) { return _letters[ ij[ 0 ] ] + numbers_[ ij[ 1 ]] ; }
