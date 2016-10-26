/*
The most general stuff for turn based strategy games.

Will probably end up being little more than declaration of
required methods to create a game.

Note that games with random factors (e.g. dice, shuffled cards)
add a degree of complexity,  as random events are part of the
game history.  (Speculating on other branches of play is
also more  - well - speculative.)  We may end up treating the
dice as a third player in some respects.
*/


function gameAbstract() {
	// Consrtuctor for a two player turn-based strategy game
	// Player number 0 moves first
	this.toMove = 0
	// moves is a dictionary with moves (format depends on the 
	// specific game in question) as keys,  resultant positions
	// as values
	this.moves = {}
	}


function gameCheckAvailableMoves( position ) {
	return []
	}

function registerMove( game , move ) {
	// Add the move to game history and update current position
	game.moves.push( move )
	var prev = game.position
	game.position = gameEnactMove( game.position , move )
	game.position.prev = prev
	game.updateDisplay( )
	game.updateAvailableMoves( )
	if ( game.over ) {
		// Alert player(s), record results?
		}
	else {
		// Alert player that it's their turn
		}
	}

function gameEnactMove( position , move ) {
	}





//
// gameScore should attempt to evaluate a score reflecting probability
//	of victory or loss (actually from -1.0 for certain loss to +1.0
//	for certain victory,  but scale inbetween can be flexible -
//	comparison of values is all that really counts).  It 
//	generally works by calling gameScorePosition,  which is the best
//	one to override.  It should only provide a calculation based on
//	the position in terms of material and other general rules-of-thumb,
//	and NOT construct a move-tree,  since it will in
//	fact be called by gameAnalyse which will be doing just that.
//
function gameScorePosition( position , player ) { return 0.0 }
function gameScore( position , player ) {
	if ( position.finished ) {
		if ( position.winner )
			return  ( position.winner == player ) ? 1.0 : -1.0
		else	return 0.0
		}
	else return gameScorePosition( position , player )
	}


game.prototype = { 
// 	finished : false	// this should be in a position object not game object
	}