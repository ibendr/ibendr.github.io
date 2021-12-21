/*
ver 1 - no longer built around html draggable object - now just the abstract level
*/

include("gameBoard1")

//  cell is cell on board where it'll be, type is type of piece,
//  team is who it belongs to ( player / colour )
function GamePiece( cell , type , team ) {
    if (arguments.length==0) return;
    this.board   = cell.board;
//     this.board.pieces[ this ] = cell;
    this.team    = team;
    this.type    = type;
    this.moveTo( cell );
    // not relevant to all games...
    this.availableMoves = { };
}

GamePiece.prototype = {
    cell : null ,
    remove : function() { // could be coupled with deleting piece
	// take it off the board
	delete this.board.pieces[ this.index ];
	this.cell.remove( this );
	this.cell = null;
    },
    moveTo : function( cell ) {
// 	alert( (this) +"--"+ cell.index);
	// move it to a particular cell
	if ( this.cell ) this.cell.remove( this );
	cell.add( this );
	this.cell = cell;
	this.board.pieces[ cell.index ] = this;
    },
    become : function( type ) {
	// change cell type
	this.type = type;
    },
    // shorthand for move to cell by index, with validity check
    goTo: function( index ) {
	if ( index in this.board.cells )
	    this.moveTo( this.board.cells[ index ] );
    },
};
