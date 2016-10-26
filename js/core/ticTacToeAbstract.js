/*
Tic-tac-toe without the front end if we can manage the separation
*/


ticTacToeSymbols = [ 'X' , 'O' ]

// The position is dictionary of occupied squares - key is i,j value is character 'X' , 'O'

// .moves field of a position is dictionary of moves - key is move (whatever format)
//	and value is position after move,  or empty object if not yet evaluated.

ticTacToeUpdateAvailableMoves( ) {
	var pos = this.position
	pos.moves = new Object ()
	for ( var i=0 ; i<3 ; i++ )
		for (var j=0 ; j<3 ; j++ ) {
			square = [ i , j ]
			if ( ! ( square in pos ) )
				pos.moves[ square ] = new Object ()
			}
	}

ticTacToeInit( ) {
	this.position = new Object( )
	this.position.toMove = 0
	this.position.prev = null
	this.over = false
	}

ticTacToeEnactMove( position , move ) {
	out = merge( position )	// makes a copy
	out[ move ] = ticTacToeSymbols[ position.toMove ]
	out.toMove = 1 - position.toMove
	return out
	}

ticTacToeCheckVictory( ) {
	pos = this.position
	O = ticTacToeSymbols[ 1 ]
	for ( var i=0 ; i<3 ; i++ ) {
		var Ts = { row: 0 , col: 0, diag: 0 }
		for (var j=0 ; j<3 ; j++ ) {
			var square = [ i, j ]
			if ( square in pos )
				Ts.row += ( pos[ square ] == O ) ? 1 : -1
			var square = [ j, i ]
			if ( square in pos )
				Ts.col += ( pos[ square ] == O ) ? 1 : -1
			if ( i != 1 ) {
				var square = [ j, i + j * (1 - i) ]
				if ( square in pos )
					Ts.diag += ( pos[ square ] == O ) ? 1 : -1
			}	}
		for ( var k in Ts ) {
			if ( abs( Ts[ k ] ) == 3 )
			this.over = true
			this.winner = ( Ts[ k ] > 0 ) ? 1 : -1
			return
	}	}	}


			