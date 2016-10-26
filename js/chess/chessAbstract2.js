/*
Chess without the front end if we can manage the separation

Split from chessAbstract by moving away from having classes for piece, board, etc.

Now a position is just a dictionary from coords ( e.g. 1,3) to
pieces - which are just characters with case giving colour e.g.  p  N  k  R

	Note that js doesn't _actually_ uses objects as keys.  What happens when we code -
	
		pos[ [ 1 , 2 ] ] = 'K'
	
	is that [ 1 , 2 ] gets cast to the string '1,2' which becomes the key.
	
	If we do the boolean test
	
		if ( [ 1 , 2 ] in pos ) { ... }
	
	the same thing happens - the array is converted to a string.
*/

defaultPosition = [	"rnbqkbnr",
			"pppppppp",
			"........",
			"........",
			"........",
			"........",
			"PPPPPPPP",
			"RNBQKBNR",
			""
			"white to move"	]

// A chess position is a dictionary giving piece by square reference
function chessPosition( posText ) {
	// A position in a chess game - used in conjunction with a move history
	// and therefore not requiring flags for castling,  en-passant,  50 move
	// position is 8 strings of 8 chars:
	// KQRBNP for white pieces,  kqrbnp for black, other for blank
	// If argument is a chess position (not text) it is cloned
	out = new Object
	if ( !posText ) posText = defaultPosition
	out.toMove = 0
	for (var j=0; j<8; j++) {
	    var posRow = posText[ j ]
	    for (var i=0; i<posRow.length; i++) {
		var c = posRow.charAt( i )
		if ( "PpBbNnRrKkQq".indexOf( c ) > -1 ) {
		    out[ [ i , j ] ] = c
	    }	}   }
	// See if there's any info beyond board rows...
	if ( posText.length > 8 ) {
		// Look for indicator of whose move it is
		//  Actually - if last line mentions black and not white,
		//	make it black's turn,  otherwise leave it as white's.
		if (	( posText[ -1 ].toLowerCase().indexOf( 'black' ) >  -1 ) &&
			( posText[ -1 ].toLowerCase().indexOf( 'white' ) == -1 ) )
				out.toMove = 1
		}
	return out
	}

function chessPositionToText( pos ) {
	// Output position in text format as used by constructor
	// Would work for any board game with one letter piece names
	out = new Array
	for (var j=0; j<8; j++) {
	    outLine = ""
	    for (var i=0; i<8; i++)
		outLine += ( [ i , j ] in pos ) ? pos[ [ i , j ] ] : '.'
	    out.push( outLine )
	    }
        out.push( '' , this.toMove ? 'black to move' : 'white to move' )
	return out
	}

function chessPositionClone( pos ) {
	out = new Object
	for ( var k in pos )
		out[ k ] = pos[ k ]
	return out		    // same as using merge( pos ) from object1.js
	}

function chessPositionEnactMove( move ) {
	// returns a new position with the move done
	}

// Nitty gritty actual chess stuff

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

checkCheck = true	// make false for variants where moving into check OK

function chessPieceReachSquares( pos , i , j , c , checkChecking ) {
	// Only set the checkChecking flag to true when using this to
	//  check for a check.
	if ( !c ) {
		c = pos[ [ i , j ] ]
		if ( !c ) return []
		}
	var nam = c.toUpperCase()
	var team = ( c != nam )
	// Start with squares which can physically be reached,  before
	//	doing advanced legality checking (i.e. is it into check?)
	// Also - no en-passant or castling implemented yet.
	var reachSquares = new Array()
	if ( this.nam == 'P' ) {// pawn - special case
		// Check square one ahead
		var j1 = j + ( team ? -1 : 1 )
		var square = [ i , j1 ]
		if ( ( 0 <= j1 ) && ( j1 < 8 ) ) {
			// still on board (should be anyway!)
			if ( ! ( square in pos ) ) {
				// empty: list as reachable
				reachSquares.push( square )
				// and check if eligible for double move
				if ( j1 == ( team ? 8 - 3 : 2 ) ) {
					square = [ i , j1 + ( team ? -1 : 1 ) ]
					if ( ! ( square in pos ) ) {
						// empty: list as reachable
						reachSquares.push( square )
				}	}	}
			// Check diagonal forward moves for captures
			for ( var k = -1 ; k<2; k+=2 ) { // i.e.   k =  -1, +1
				i1 = i + k		// hence i1 = ( i-1,i+1 )
				if ( [ i1 , j1 ] in pos ) {
					var other = pos[ [ i1 , j1 ] ]
					// Still reachable (as capture) if
					//	occupied by foreign piece
					if ( ( other.nam != other.nam.toUpperCase() ) != team ) {
						if ( checkChecking )
							if ( other.nam.toUpperCase() == 'K' )
								return true
						reachSquares.push( square )
		}	}	}	}	}
	else { // For most pieces, multiples of unit moves until blocked...
		var unitMoves = chessUnitMoves[ this.nam ] || []
		for ( var mov=0 ; mov<unitMoves.length ; mov++ ) {
			var unitMove = unitMoves[ mov ]
			// Start from current square
			var i1 = i
			var j1 = j
			var ok = true
			while ( ok ) {
				// add the unit move
				i1 += unitMove[0]
				j1 += unitMove[1]
				ok =	(0 <= i1) && (i < 8) &&
					(0 <= j1) && (j < 8)
				// Only continue if still on board
				if ( ok ) {
					// identify target square
					var square = [ i1 , j1 ]
					if ( ! ( square in pos ) )
						// empty: list as reachable and continue
						reachSquares.push( square )
					else {	// occupied - last possible in this direction
						ok = false
						var other = pos[ square ]
						// Still reachable (as capture) if
						//	occupied by foreign piece
						if ( ( other.nam != other.nam.toUpperCase() ) != team )
							reachSquares.push( square )
						}
					// Finally,  Kings and kNights go no further
					if ( this.nam == 'N' || this.nam == 'K' )
						ok = false
		}	}	}	}
	return checkChecking ? false : reachSquares
	}