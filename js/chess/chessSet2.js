/*
Chess set - builds on gameBoard amd gamePieces

June 2015 - fork of version 2

changing piece.availableMoves from a array of destination squares to a
dictionary of { destination square : further actions }

Unfortunately, we can't use objects as keys, so square will be "3,5" etc.

further actions is an array of action objects, which are -
- piece being captured
- strings representing special moves -
    "O-O" , "O-O-O" - castling being performed - rook must be moved and flags adjusted
    "promote" - pawn reaching end rank - player to be given option to choose promotion piece
    "double" - pawn moving two squares - should be flagged for e-p possibility
*/

include("gamePieces")
imgSiz = 2 * (halfSquareSize - halfSquareSizeCrop);

// function chessPiece( square , nam , team ) {
// 	gamePiece.call( this , square , nam , team , 
// 		"../images/chess/" + nam + ( team ? "w" : "b" ) + ".png" )
// 	}
// chessPiece.prototype = gamePiece.prototype


chessUnitMoves = {
	'B' : [ [ 1 , 1 ] ] ,
	'R' : [ [ 1 , 0 ] ] ,
	'Q' : [ [ 1 , 1 ] , [ 1 , 0 ] ] ,
	'N' : [ [ 1 , 2 ] ] }

// flesh out unit moves
function addMoveIfAbsent( moves , move ) {
	for ( var i=0 ; i<moves.length ; i++ )
		if ( ( moves[i][0] == move[0] ) &&
		     ( moves[i][1] == move[1] ) )  return false
	moves.push( move )
	}
function reflectMoves( moves ) {
	for ( nam in moves ) {
		var copy = moves[ nam ].slice()
// 		alert( copy )
		var add = function( x,y ) { addMoveIfAbsent( moves[nam] , [x,y] ) }
		for ( var mov=0; mov<copy.length; mov++ ) {
			var move = copy[ mov ]
			add (   move[ 0 ] , - move[ 1 ] )
			add ( - move[ 0 ] ,   move[ 1 ] )
			add ( - move[ 0 ] , - move[ 1 ] )
			add (   move[ 1 ] ,   move[ 0 ] )
			add (   move[ 1 ] , - move[ 0 ] )
			add ( - move[ 1 ] ,   move[ 0 ] )
			add ( - move[ 1 ] , - move[ 0 ] )
			}
		}
	}
reflectMoves( chessUnitMoves )

chessUnitMoves[ 'K' ] = chessUnitMoves[ 'Q' ]

// ad(chessUnitMoves)

function chessPieceAvailableMoves() {
  var square = this.square
  var team = this.team
  var board = square.board
  // Start with squares which can physically be reached,  before
  //	doing advanced legality checking (i.e. is it into check?)
  // Also - no en-passant or castling implemented yet.
  this.availableMoves = {};
  if ( this.nam == 'P' ) {// pawn - special case
    // Check square one ahead
    var i = square.i;
    var j = square.j + ( team ? -1 : 1 );
    var promote = ( j == ( team ? 0 : board.n - 1 ) );
    if ( (0 <= j) && (j < board.n) ) {
      // still on board (should be anyway!)
      square2 = board.squares[ i ][ j ]
      if ( square2.occupants.length == 0 ) {
	// empty: list as reachable
	this.availableMoves[ i+","+j ] = promote ? [ "promote" ] : [ ];
	// and check if eligible for double move
	if ( j == ( team ? board.n - 3 : 2 ) ) {
	  square2 = board.squares[ i ][ j + ( team ? -1 : 1 )]
	  if ( square2.occupants.length == 0 ) {
	    // empty: list as reachable
	    this.availableMoves[ i+","+( j + ( team ? -1 : 1 ) ) ] = [ "double" ];
      }  }  }
      // Check en-passant
      var epp;
      if ( epp = this.set.pawnDoubleMoved ) {
	if ( epp.square.j == square.j && Math.abs( epp.square.i - i ) == 1 ) {
	  this.availableMoves[ epp.square.i+","+j ] = [ epp ];
      } }
      // Check diagonal forward moves for captures
      for ( var k=-1 ; k<3; k+=3 ) { // i.e. k = -1, +2
	i += k
	if ( (0 <= i) && (i < board.m) ) {
	  square2 = board.squares[ i ][ j ]
	  if ( square2.occupants.length ) {
	    var other = square2.occupants[ 0 ]
	    // Still reachable (as capture) if
	    //	occupied by foreign piece
	    if ( other.team != team )
	      this.availableMoves[ i+","+j ] = promote ? [ other , "promote" ] : [ other ];
    }  }  }  }
  }
  else { // For most pieces, multiples of unit moves until blocked...
    var unitMoves = chessUnitMoves[ this.nam ] || []
    for ( var mov=0 ; mov<unitMoves.length ; mov++ ) {
      var unitMove = unitMoves[ mov ]
      // Start from current square
      var i = square.i
      var j = square.j
      var ok = true
      while ( ok ) {
	// add the unit move
	i += unitMove[ 0 ];
	j += unitMove[ 1 ];
	ok =	(0 <= i) && (i < board.m) &&
		(0 <= j) && (j < board.n)
	// Only continue if still on board
	if ( ok ) {
	  // identify target square
	  square2 = board.squares[ i ][ j ];
	  if ( square2.occupants.length == 0 )
	    // empty: list as reachable ( no capture ) and continue
	    this.availableMoves[ i+","+j ] = [];
	  else {	// occupied - last possible in this direction
	    ok = false;
	    var other = square2.occupants[ 0 ];
	    // Still reachable (as capture) if
	    //	occupied by foreign piece
	    if ( other.team != team )
	      this.availableMoves[ i+","+j ] = [ other ];
	    }
	  // Finally,  Kings and kNights go no further
	  if ( this.nam == 'N' || this.nam == 'K' )
		  ok = false;
	}
      }
    }
    if ( this.nam == 'K' ) {
      // King - check for castling possibilities
      if ( ( j = square.j ) == ( team ? board.n - 1 : 0 ) && ( square.i == 4 ) ) {
	// King is in correct spot - now look for rights and rooks
	var oks = this.set.castlingRights[ team ];
	for ( var i1 = 0 ; i1<2 ; i1++ ) {
	  if ( ok = oks[ 1-i1 ] ) {
	    var rook = board.squares[ i1 ? board.m - 1 : 0 ][ j ].occupants[ 0 ];
	    if ( rook && rook.nam == "R" ) {
	      // There is a rook in correct spot flagged as eligible to castle
	      // check that the spots in-between are vacant - NOTE still no check for check
	      for ( var i2 = i1 ? board.m - 2 : 1 ; i2 != square.i  ; i2 += ( i1 ? -1 : 1 )) {
// 		alert( team+"+"+i1+"+"+i2 );
		if ( board.squares[ i2 ][ j ].occupants.length ) {
		  ok = false;/* alert( team+"+"+i1+"+"+i2 );*/
		  break;
	      } }
	      if ( ok ) {
		// Approve the castling
// 		  ad( this.availableMoves )
		this.availableMoves[ ( i1 ? "6," : "2," ) + j ] = [ i1 ? "O-O-O" : "O-O" ];
	      }
	    }
	  }
	}
      }	
    }
  }
  // For now no checking on check...
  return this.availableMoves;
}

gamePiece.prototype.updateAvailableMoves = chessPieceAvailableMoves

defaultPosition = [	"r...kbnr",
			"pppppppp",
			"........",
			"........",
			"........",
			"........",
			"PPPPPPPP",
			"RNBQK..R",
			"01111"
		  ]
function newChessPiece( set , i , j , nam , team ) {
    var file = "../images/chess/" + nam + ( team ? "b" : "w" ) + ".gif";
    var piece = new gamePiece ( set.board.squares[ i ][ j ] , nam , team , file , imgSiz );
    piece.set = set;
    piece.loose = false;
    set.board.pieces.push( piece );
    return piece;
}
    
 
// var row = [],col = []
function chessSet( position ) {
	// position is 8 strings of 8 chars for board,
	// and a string for extra info
	//	- whose turn ( 0 / 1 )
	//	- castling rights ( four more 0 / 1 , respectively for 
	//		W O-O , B O-O , W O-O-O , B O-O-O ). 1 only
	//		indicates that a castling right has not yet
	//		been forfeited by movig king or rook - the
	//		usual checks still needed for whether or
	//		not it is currently possible / legal
	//	- which pawn (if any) has just made a double-move
	//		so that en-passant can be processed
	// KQRBNP for white pieces,  kqrbnp for black, other for blank
	if ( !position ) position = defaultPosition;
	var board = new chessBoard( position[ 0 ].length , position.length -
				    ( ( position.last().length == position[ 0 ].length ) ? 0 : 1 ) );
	var squares = board.squares;
	this.board = board;
// 	this.pieces = new Array
	this.toPlay = 0;
// 	aalert( position.length * position[0].length )
	var posRow;
	for (var j=0; j<board.n; j++) {
	    posRow = position[ j ];
	    for (var i=0; i<board.m; i++) {
		var c = posRow.charAt( i );
		if ( c && "PpBbNnRrKkQq".indexOf( c ) > -1 ) {
		    var nam = c.toUpperCase();
		    var team = ( nam == c ) ? 0 : 1;
		    var piece = newChessPiece( this , i , board.n-1 - j , nam , team );
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
    playTeam = it.toPlay
    while ( it.board.pieces.iter( "piece" ) ) {
// 		aalert( ["B","W"][ piece.team ] + piece.nam + piece.square.i + piece.square.j )
      piece.dropTargets = [];
      if ( piece.team == playTeam ) {
	piece.updateAvailableMoves();
	for ( var ij in piece.availableMoves ) {
	  var i = parseInt( ij[ 0 ] );
	  var j = parseInt( ij[ 2 ] );
	  piece.dropTargets.push( it.board.squares[ i ][ j ] );
	}
      }
      else {
	piece.availableMoves = {};
      }
    }
}

chessSet.prototype={}
/*
function chessSetKillPieces( square , set ) {
    while ( square.occupants.length ) {
	piece = square.occupants.pop();
	piece.hide();
	set.pieces.remove( piece )
    }   }*/

var iter=new Array()
addEventHandler( "PieceMoved" , function (e,t) {
// 	alert(t.nam + ' moved to ' + t.dropTargetHit.i + " , " + t.dropTargetHit.j)
    var hit = t && t.dropTargetHit;
    if ( hit ) {
      var i0 = t.square.i;
      var j0 = t.square.j;
      var i = hit.i;
      var j = hit.j;
      var ij = i+","+j;
      // check if the target really was listed as an available move-to square
      if ( ij in t.availableMoves ) {
	var board = t.square.board;
	t.set.pawnDoubleMoved = null;
	t.moveTo( board.squares[ i ][ j ] );
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
	      var corner = board.squares[ i1 ? 0 : board.m - 1 ][ j ];
	      var rook = corner.occupants[ 0 ];
	      if ( rook && rook.nam == "R" ) {
		rook.moveTo( board.squares[ i + ( i1 ? 1 : -1 ) ][ j ] );
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
function chessSet2_init( ) {/* alert( 'cs-init' );*/
	// debug
// 	P = it.pieces
// 	Q = P[27]
// 	B = it.board
// 	S = B.squares
	s = function( i,j ) { return it.board.s(i,j); }; /*alert( s );*/
	} 

pos1=["..b.rn..","..rPp...","..Ppk.p.","....p.P.","..nPP.R.",".......K","..q....P","....b..."];
// document.onload = chessSet_init;
