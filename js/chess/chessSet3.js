/*
Chess set 

June 2015 - version 3

(Ambit claim) we'll attempt to change architecture completely so that
the chess set exists (like a pure platonic form?) independently of
any representation of it.

Then a chessSetInterface would be a presentation layer added to that

May involve a reworking of the event architecture, so that more of the
connections are made that way.

e.g. the interface will listen for changes in the model, as well as
requesting actions of the model in response to user actions.

This will also benefit adding in scoring systems - e.g. a simple material
summing score formula would be able to listen for capture and promote events
in order to adjust their scores, without having to have an update method
called at other times.

Temptation to replace the name 'addEventHandler' by the more concise 'on'.
(This is a 2048 influence. Therein 'handleEvent' is also replaced by 'emit'
although I'm not so sure I like that one. Perhaps 'do'? Taken - maybe 'fire'.)
But then what to call 'removeEventHandler' ? 'notOn' ? 

June 2015 - version 2

changing piece.availableMoves from a array of destination cells to a
dictionary of { destination cell : further actions }

Unfortunately, we can't use objects as keys, so cell will be "3,5" etc.

further actions is an array of action objects, which are -
- piece being captured
- strings representing special moves -
    "O-O" , "O-O-O" - castling being performed - rook must be moved and flags adjusted
    "promote" - pawn reaching end rank - player to be given option to choose promotion piece
    "double" - pawn moving two cells - should be flagged for e-p possibility
    
Starting to want a representation of moves which is as close as possible to
listing the physical changes to the apparatus, as a single array of effects

e.g.  [  [ piece , "cell" , new , old ] , [ piece , "type" , new , old ] ]

regular move -

	[ [ <pawn> , "cell" , <e2> , <e4> ] ]

promoting capture -

	[ [ <pawn> , "cell" , <e7> , <f8> ] , [ <rook> , "cell" , <f8> , null ] , [ <pawn> , "type", "P" , "Q" ] ]

July 2015 observation - using object pointers in action descriptions has the drawback
of being tied to an instance of the game object ... we want to be able to clone it and 
run possible moves on the clone. So better to refer to piece by location after all...

e.g.	[ [ move , e2 , e4 ] ] ,					# e2 e4
	[ [ take , e4 ,  P ] , [ move , d5 , e4 ] ] ,			# d5xe4
	[ [ move , c7 , c8 ] , [ take , c8 ,  P ] , [ make , Q , c8 ] ]	# c8 (Q)

undos:	[ [ take , c8 ,  Q ] , [ make , P , c8 ] , [ move , c8 , c7 ] ] ,
	[ [ move , e4 , d5 ] , [ make , P , e4 ] ]  ,			# undo all actons in reverse order
	[ [ move , e4, e2 ] ]

*/

include("gamePieces1") ;

var chessUsingFlagPieces = true ;

var chessPieceChars = chessUsingFlagPieces ? "PpBbNnRrKkQqMmCcEe" : "PpBbNnRrKkQq" ;

var chessUnitMoves = {
	'B' : [ [ 1 , 1 ] ] ,
	'R' : [ [ 1 , 0 ] ] ,
	'Q' : [ [ 1 , 1 ] , [ 1 , 0 ] ] ,
	'N' : [ [ 1 , 2 ] ] } ;

// flesh out unit moves
function addMoveIfAbsent( moves , move ) {
    // Good place not to use forEach
    for ( var i=0 ; i<moves.length ; i++ )
	if ( ( moves[ i ][ 0 ] == move[ 0 ] ) &&
	     ( moves[ i ][ 1 ] == move[ 1 ] ) )  return false ;
    moves.push( move ) ;
    return true ;
}
function reflectMoves( pieceMoves ) {
    for ( nam in pieceMoves ) {
	var moves = pieceMoves[ nam ] ;
	var copy = moves.slice() ;
	var add = function( x,y ) { addMoveIfAbsent( moves , [x,y] ) } ;
	copy.forEach ( function( move ) {
	    add (   move[ 0 ] , - move[ 1 ] ) ;
	    add ( - move[ 0 ] ,   move[ 1 ] ) ;
	    add ( - move[ 0 ] , - move[ 1 ] ) ;
	    add (   move[ 1 ] ,   move[ 0 ] ) ;
	    add (   move[ 1 ] , - move[ 0 ] ) ;
	    add ( - move[ 1 ] ,   move[ 0 ] ) ;
	    add ( - move[ 1 ] , - move[ 0 ] ) ;
	}) ;
    }
}
reflectMoves( chessUnitMoves );

chessUnitMoves[ 'M' ] = ( chessUnitMoves[ 'K' ] = chessUnitMoves[ 'Q' ] );
chessUnitMoves[ 'C' ] =   chessUnitMoves[ 'R' ];

function ChessPiece ( cell , team , type ) {
    if ( arguments.length == 0 ) return ;
    if ( chessPieceChars.indexOf( type ) == -1 || ( team != 0 && team != 1 ) ) return ;
    GamePiece.call ( this , cell , team , type ) ;
}

ChessPiece.prototype = new GamePiece ;

mergeIn( ChessPiece.prototype , {

    updateAvailableMoves: function ( captureTargetsOnly ) {
	// set captureTargetsOnly = true for quick version to report pieces attacked
	//	( primarily intended for checking for check - which could be made more express )
	var self  = this;	// to make it visible inside forEach functions
	var cell  = this.cell;
	var team  = this.team;
	var board = cell.board;
	// Start with cells which can physically be reached,  before
	//	doing advanced legality checking (i.e. is it into check?)
	var out   = {};  // will become this.availableMoves normally
	var otherCell;
	var other;
	if ( this.nam == 'P' ) {// pawn - special case
	    // Check whether up for promotion, or possible double-move, or
	    //	( perish the thought ) anomolous stuck-at-far-edge position
	    var ahead   = team ? -1 : 1;
	    var rank    = cell.index[ 1 ];
	    if ( team ) rank = board.n + 1 - rank;
	    var blocked = ( rank == board.n );
	    var promote = ( rank == board.n - 1 );
	    var canGo2  = ( rank == 2 );
// 	    var other   = null;
	    // Check cell one ahead
	    if ( !blocked ) {
		if ( !captureTargetsOnly ) {
		    otherCell = cell.relative( [ ahead , 0 ] );
		    if ( otherCell.isEmpty() ) {
			// empty: list as reachable
			out[ otherCell ] = promote ? [ "promote" ] : [ ];
			// and then (if eligible) check double move
			if ( canGo2 ) {
			    var otherCell = cell.relative( [ ( team ? -2 : 2 ) , 0 ] );
			    if ( otherCell.isEmpty() ) {
				out[ otherCell ] = [ "double" ];
	        }   }   }   }
		// Check en-passant
    // 	    var enPassant = this.set.enPassant
		if ( ( other = this.set.enPassant ) && ( otherCell = other.cell ) &&
			( ( otherCell == cell.relative( [ -1 , 0 ] ) )  || 
			( otherCell == cell.relative( [  1 , 0 ] ) )     ) )
		    if ( captureTargetsOnly ) out[ other ] = true;
		    else out[ otherCell.relative( -ahead ) ] = [ other ];
		// Check diagonal forward moves for captures
		for ( var k=-1 ; k<2 ; k+=2 ) { // i.e. k = -1, +1
		    otherCell = cell.relative( [ ahead , k ] );
		    if ( otherCell && ( other = otherCell.occ() ) && ( other.team != this.team ) ) {
			if ( captureTargetsOnly ) out[ other ] = true;
			else out[ otherCell ] = promote ? [ other , "promote" ] : [ other ];
	}   }   }   }
	else {
	    // For 'normal' pieces (not pawns), multiples of unit moves until blocked...
	    //	(excepting that king and knight only go unit move once)
	    var unitMoves = chessUnitMoves[ this.nam ] || [];
	    unitMoves.forEach( function( unitMove ) {
		var ok   = true;
		for ( var otherCell = cell ; ok && ( otherCell = otherCell.relative( unitMove ) ) ; ) {
		    if ( otherCell.isEmpty() ) {
			if ( !captureTargetsOnly ) out[ otherCell ] = [];
			// Kings and kNights go no further
			ok = !( this.nam == 'N' || this.nam == 'K' || this.nam == 'M' )
		    }
		    else {
			ok = false;   // can't continue any further
			var other = otherCell.occ();
			// if opposition piece, can capture
			if ( other.team != team ) {
			    if ( captureTargetsOnly ) out[ other ] = true;
			    else out[ otherCell ] = [ other ];
			}
		    }
		}
	    } )
	}
	// Now only to check for castling 
	//  To make more efficient we should do checking-for-check on current moves FIRST
	//  Then only look at castling if the king move in the same direction is still on
	//  the list of available moves, and then if castling physically possible, see
	//  if it has moved into check.
	
	// CHECK CURRENT MOVES FOR LEGALITY RE CHECK
	
	if ( ( !captureTargetsOnly ) && ( this.nam == 'M' || this.nam == 'K' ) ) {
	    // King - check for castling possibilities - first if king really on right spot
	    // NOTE needs adapting for alternative board sizes or starting setups
	    var j = cell.index[ 1 ];
	    if ( cell.index[ 0 ] == 5 && j == ( team ? board.n - 1 : 0 ) ) {
		// Correct spot - now look for rights and rooks
		var oks = this.set.castlingRights[ team ];
		for ( var i1 = 0 ; i1 < 2 ; i1++ ) {
		    var unitMove = [ ( i1 ? -1 : 1 ) , 0 ];
		    if ( ( ok = oks[ 1 - i1 ] ) && 
				( ( otherCell = cell.relative( unitMove ) ) in out ) ) {
			var corner = board.cells[  [ i1 ? board.m : 1 , j ] ];
			var rook   = corner.occ();
			if ( rook && rook.nam == ( chessUsingFlagPieces ? "C" : "R" ) ) {
			    // There is a rook in correct spot flagged as eligible to castle
			    // check that the spots in-between are vacant
			    for ( ; ok && ( ( otherCell = otherCell.relative( unitMove ) ) != corner ) ; ) {
				ok = otherCell.isEmpty();
			    }
			    if ( ok ) {
				// Approve the castling
				out[ cell.relative( unitMove ).relative( unitMove ) ] = [ i1 ? "O-O-O" : "O-O" ];
			    }
			}
		    }
		}
	    }
	}
	// For now no checking on check...
	if ( !captureTargetsOnly ) this.availableMoves = out;
	return out;
    },
    checkForCheck: function ( move ) {
	this.doMove( move );
	var out = this.kingAttacked();
	this.undoMove( );
    },
    undoMove: function () {
	var self = this;
	var undo = this.undoHistory.pop();
	undo[ 0 ].moveTo( undo[ 1 ] );	// easy part - move the piece back
	undo[ 3 ].forEach( function ( effect ) {
	    if ( effect instanceof ChessPiece ) {
		// captured piece - restore it.  It's cell field should be intact,
		//  which saves us handling en-passant anomoly
		effect.cell.add( effect );
	    }
	    else {
		if ( effect == "promote" ) {
		    undo[ 0 ].become( "P" );
		}
		var i1 = 0;
		if ( effect == "O-O" || ( effect == "O-O-O" && ( i1 = 1 ) ) ) {
		    // undo castling - need to move rook back
		    var rook = undo[ 1 ].relative( [ ( i1 ? -1 : 1 ) , 0 ] );
		    var corner = this.board.cells[ [ ( i1 ? 1 : this.board.m ) , undo[ 0 ].team ? board.n : 1 ] ];
		    rook.moveTo( corner );
		    if ( chessUsingFlagPieces ) { rook.become( "C" ) }
		}
		if ( effect instanceof Array ) { // transforms
		}
	    }
	} ) ;
    },
    doMove: function ( move ) {
	// move is a quad : [ piece , oldCell , newCell , effects ]
	// inclusion of oldCell means we can use same object for undo history
	// where effects is array containing any piece captured
	// and possibly a string "promote" , "double" , "O-O" or "O-O-O"
	var piece     = move[ 0 ];
	var cell      = move[ 1 ];
	var otherCell = move[ 2 ];
	var effects   = move[ 3 ];
	if ( cell in piece.availableMoves ) {
	    var board = piece.cell.board;
	    t.set.pawnDoubleMoved = null;
	t.moveTo( board.cells[ i ][ j ] );
	// Have other effects -
	t.availableMoves[ ij ].forEach( function ( effect ) {
	  if ( typeof effect == "string" ) {
	    // Special move effects
	    if ( effect == "promote" ) {
	      // ask player to choose promotion piece
	      var choice = window.prompt( "Promote to? (q/r/b/n)","q" );
	      choice = ( choice in { r: 1, b: 1, n: 1 } ) ? choice.toUpperCase() : "Q";
	      // t.nam = choice; didn't do it - needs the image reloaded.
	      // so instead we make a new piece
	      t1 = newChessPiece( t.set , i , j , choice , t.team );
	      t.remove();
	      t = t1;
	    }
	    else if ( effect == "O-O" || effect == "O-O-O" ) {
	      var i1 = ( 5 - effect.length ) / 2;
	      var corner = board.cells[ i1 ? 0 : board.m - 1 ][ j ];
	      var rook = corner.occupants[ 0 ];
	      if ( rook && rook.nam == "R" ) {
		rook.moveTo( board.cells[ i + ( i1 ? 1 : -1 ) ][ j ] );
	      }
	    }
	    else if ( effect == "double" ) {
	      t.set.pawnDoubleMoved = t;
	    }
	  }
	  else {
	    // piece to capture
	    effect.remove();
	  }
	});
	// Check for rook or king moves to update castling rights
	if ( t.nam == "R" ) {
	  if ( j0 == ( t.team ? board.n - 1 : 0 ) && ( i0 == 0 ) || ( i0 == board.m - 1 ) )
	    t.set.castlingRights[ t.team ][ ( i0 == 0 ) ? 1 : 0 ] = 0;
	}
	if ( t.nam == "K" ) {
	  t.set.castlingRights[ t.team ] = [ 0 , 0 ];
	}
	// and set for other player's move
	t.set.toPlay = 1 - t.set.toPlay;
	t.set.board.it.style[ 'borderColor' ] = [ 'white','black' ][ t.set.toPlay ];
	chessSetSetTargets( t.set );
	}
    }

});

defaultPosition = chessUsingFlagPieces ? 
		[	"c...mbnc",
			"p.pppppp",
			"........",
			"........",
			".pE.....",
			"........",
			"PP.PPPPP",
			"CNBQK..R"
		  ] :
		[	"r...kbnr",
			"pp.ppppp",
			"........",
			"........",
			"..pP....",
			"........",
			"PPP.PPPP",
			"RNBQK..R",
			"0111133"
		  ]
// function newChessPiece( set , i , j , nam , team ) {
//     var file = "../images/chess/" + nam + ( team ? "b" : "w" ) + ".gif";
//     var piece = new gamePiece ( set.board.cells[ i ][ j ] , nam , team , file , imgSiz );
//     piece.set = set;
//     piece.loose = false;
//     set.board.pieces.push( piece );
//     return piece;
// }
//     
 
// var row = [],col = []
function ChessSet( position ) {
	// position is 8 strings of 8 chars for board,
	// and an optional string for extra info...
	//	- whose turn ( 0 / 1 )
	//	- castling rights ( four more 0 / 1 , respectively for 
	//		W O-O , B O-O , W O-O-O , B O-O-O ). 1 only
	//		indicates that a castling right has not yet
	//		been forfeited by movig king or rook - the
	//		usual checks still needed for whether or
	//		not it is currently possible / legal
	//	- which pawn (if any) has just made a double-move
	//		so that en-passant can be processed
	//	- padding spaces as desired - also if necessary to ensure unequal
	//		row length, or else extr string read as an extra row of board
	// KQRBNP for white pieces,  kqrbnp for black, other for blank
	if ( !position ) position = defaultPosition;
	// Size of board infered from game data.
	// If the last row unequal in length it is extra info, not part of board
	var board = new RectGameBoard( position[ 0 ].length , position.length -
			  ( ( position.last().length == position[ 0 ].length ) ? 0 : 1 ) );
	var cells = board.cells;
	this.board = board;
// 	this.pieces = new Array
	this.toPlay = 0;
	this.undoHistory = [];
// 	aalert( position.length * position[0].length )
	var posRow;
	for ( var j = 1 ; j <= board.n ; j++ ) {
	    posRow = position[ j - 1 ];
	    for ( var i = 1 ; i <= board.m ; i++) {
		var c = posRow.charAt( i - 1 );
		if ( c && chessPieceChars.indexOf( c ) > -1 ) {
		    var nam = c.toUpperCase();
		    var team = ( nam == c ) ? 0 : 1;
		    var piece = new GamePiece( cells[ [ i , j ] ], nam , team );
// 		    piece.loose = false;	// don't allow false moves
// 		    board.pieces.push( piece );
		    }
		}
	    }
	// If the 9th row of data is present, use it
	if ( posRow = position[ board.n ] ) {
	  this.toPlay = parseInt( posRow[ 0 ] );
	  this.castlingRights = [ [ parseInt( posRow[ 1 ] ) , parseInt( posRow[ 3 ] ) ] ,
				  [ parseInt( posRow[ 2 ] ) , parseInt( posRow[ 4 ] ) ] ];
	  this.pawnDoubleMoved = ( posRow.length <= 5 ) ? null :
				  [ parseInt( posRow[ 5 ] ) , parseInt( posRow[ 6 ] ) ];
	}
	else {
	  // Unspecified info - assume white to move, castlings OK, no en-passant available
	  // Guess positive castling rights if pieces in correct spots
	  // Current CHEAT - all true
	  this.castlingRights = [ [ 1 , 1 ] , [ 1 , 1 ] ];
	  this.pawnDoubleMoved = null;
	}
	chessSetSetTargets( this );
	}

function chessSetSetTargets( it ) {
    playTeam = it.toPlay ;
    for ( piece in it.board.pieces ) {
	piece.availableMoves = { } ;
	if ( piece.team == playTeam ) {
	    piece.updateAvailableMoves();
	}
    }
}

ChessSet.prototype={}
/*
function chessSetKillPieces( cell , set ) {
    while ( cell.occupants.length ) {
	piece = cell.occupants.pop();
	piece.hide();
	set.pieces.remove( piece )
    }   }*/

var iter=new Array()
addEventHandler( "PieceMoved" , function (e,t) {
// 	alert(t.nam + ' moved to ' + t.dropTargetHit.i + " , " + t.dropTargetHit.j)
    var hit = t && t.dropTargetHit;
    if ( hit ) {
      var i0 = t.cell.i;
      var j0 = t.cell.j;
      var i = hit.i;
      var j = hit.j;
      var ij = i+","+j;
      // check if the target really was listed as an available move-to cell
      if ( ij in t.availableMoves ) {
	var board = t.cell.board;
	t.set.pawnDoubleMoved = null;
	t.moveTo( board.cells[ i ][ j ] );
	// Have other effects -
	t.availableMoves[ ij ].forEach( function ( effect ) {
	  if ( typeof effect == "string" ) {
	    // Special move effects
	    if ( effect == "promote" ) {
	      // ask player to choose promotion piece
	      var choice = window.prompt( "Promote to? (q/r/b/n)","q" );
	      choice = ( choice in { r: 1, b: 1, n: 1 } ) ? choice.toUpperCase() : "Q";
	      // t.nam = choice; didn't do it - needs the image reloaded.
	      // so instead we make a new piece
	      t1 = newChessPiece( t.set , i , j , choice , t.team );
	      t.remove();
	      t = t1;
	    }
	    else if ( effect == "O-O" || effect == "O-O-O" ) {
	      var i1 = ( 5 - effect.length ) / 2;
	      var corner = board.cells[ i1 ? 0 : board.m - 1 ][ j ];
	      var rook = corner.occupants[ 0 ];
	      if ( rook && rook.nam == "R" ) {
		rook.moveTo( board.cells[ i + ( i1 ? 1 : -1 ) ][ j ] );
	      }
	    }
	    else if ( effect == "double" ) {
	      t.set.pawnDoubleMoved = t;
	    }
	  }
	  else {
	    // piece to capture
	    effect.remove();
	  }
	});
	// Check for rook or king moves to update castling rights
	if ( t.nam == "R" ) {
	  if ( j0 == ( t.team ? board.n - 1 : 0 ) && ( i0 == 0 ) || ( i0 == board.m - 1 ) )
	    t.set.castlingRights[ t.team ][ ( i0 == 0 ) ? 1 : 0 ] = 0;
	}
	if ( t.nam == "K" ) {
	  t.set.castlingRights[ t.team ] = [ 0 , 0 ];
	}
	// and set for other player's move
	t.set.toPlay = 1 - t.set.toPlay;
	t.set.board.it.style[ 'borderColor' ] = [ 'white','black' ][ t.set.toPlay ];
	chessSetSetTargets( t.set );
	}
      }
});

var P,Q,B,S,s;
function chessSet2_init( pos1 ) {/* alert( 'cs-init' );*/
	// debug
// 	P = it.pieces
// 	Q = P[27]
// 	B = it.board
// 	S = B.cells
	s = function( i,j ) { return it.board.s(i,j); }; /*alert( s );*/
	} 

pos1=["..b.rn..","..rPp...","..Ppk.p.","....p.P.","..nPP.R.",".......K","..q....P","....b..."];
// document.onload = chessSet_init;
