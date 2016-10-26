/*
Chess set - builds on gameBoard amd gamePieces
*/

include("gamePieces")
// var imgSiz = 35;

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
	var reachSquares = new Array()
	if ( this.nam == 'P' ) {// pawn - special case
		// Check square one ahead
		var i = square.i
		var j = square.j + ( team ? -1 : 1 )
		if ( (0 <= j) && (j < board.n) ) {
			// still on board (should be anyway!)
			square2 = board.squares[i][j]
			if ( square2.occupants.length == 0 ) {
				// empty: list as reachable
				reachSquares.push( square2 )
				// and check if eligible for double move
				if ( j == ( team ? board.n - 3 : 2 ) ) {
					square2 = board.squares[i][j + ( team ? -1 : 1 )]
					if ( square2.occupants.length == 0 ) {
						// empty: list as reachable
						reachSquares.push( square2 )
				}	}	}
			// Check diagonal forward moves for captures
			for ( var k=-1 ; k<3; k+=3 ) { // i.e. k = -1, +2
				i += k
				if ( (0 <= i) && (i < board.m) ) {
					square2 = board.squares[i][j]
					if ( square2.occupants.length ) {
						var other = square2.occupants[ 0 ]
						// Still reachable (as capture) if
						//	occupied by foreign piece
						if ( other.team != team )
							reachSquares.push( square2 )
		}	}	}	}	}
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
				i += unitMove[0]
				j += unitMove[1]
				ok =	(0 <= i) && (i < board.m) &&
					(0 <= j) && (j < board.n)
				// Only continue if still on board
				if ( ok ) {
					// identify target square
					square2 = board.squares[i][j]
					if ( square2.occupants.length == 0 )
						// empty: list as reachable and continue
						reachSquares.push( square2 )
					else {	// occupied - last possible in this direction
						ok = false
						var other = square2.occupants[ 0 ]
						// Still reachable (as capture) if
						//	occupied by foreign piece
						if ( other.team != team )
							reachSquares.push( square2 )
						}
					// Finally,  Kings and kNights go no further
					if ( this.nam == 'N' || this.nam == 'K' )
						ok = false
		}	}	}	}
	// For now no checking on check...
	return reachSquares
	}

gamePiece.prototype.availableMoves = chessPieceAvailableMoves

defaultPosition = [	"rnbqkbnr",
			"pppppppp",
			"........",
			"........",
			"........",
			"........",
			"PPPPPPPP",
			"RNBQKBNR"	]

// var row = [],col = []
function chessSet( position ) {
	// position is 8 strings of 8 chars:
	// KQRBNP for white pieces,  kqrbnp for black, other for blank
	if ( !position ) position = defaultPosition
	var board = new chessBoard( position[0].length , position.length )
	var squares = board.squares
	this.board = board
	this.pieces = new Array
// 	aalert( position.length * position[0].length )
	for (var j=0; j<position.length; j++) {
	    var posRow = position[ j ]
	    for (var i=0; i<posRow.length; i++) {
		var c = posRow.charAt( i )
		if ( "PpBbNnRrKkQq".indexOf( c ) > -1 ) {
		    var nam = c.toUpperCase()
		    var team = ( nam == c ) ? 0 : 1
		    var file = "../images/chess/" + nam + ( team ? "b" : "w" ) + ".gif"
// 			aalert( file + str(i) + str(j) + "---" + imgSiz );
		    var piece = new gamePiece ( squares[i][board.n-1 - j] , nam , team , file , imgSiz )
		    piece.dropTargets = piece.availableMoves()
// 		    piece.dropTargets = piece.board.allSquares
		    piece.loose = false	// don't allow false moves
		    piece.set = this
		    this.pieces.push( piece )
		    }
		}
	    }
	}

chessSet.prototype={}

var iter=new Array()
addEventHandler( "PieceMoved" , function (e,t) {
// 	alert(t.nam + ' moved to ' + t.dropTargetHit.i + " , " + t.dropTargetHit.j)
	if ( t.availableMoves ) {
		t.square.occupants.remove( t )
		t.square = t.dropTargetHit
		t.square.occupants.push( t )
		while ( t.set.pieces.iter1( iter ) ) {
// 			alert( iter.i )
			iter.v.dropTargets = iter.v.availableMoves()
	}	}	} )

var P,Q,B,S
function chessSet_init( ) { 
	// debug
// 	P = it.pieces
// 	Q = P[27]
// 	B = it.board
// 	S = B.squares
	} 
