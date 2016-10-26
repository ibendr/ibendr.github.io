/*

Analysis engine to fit in with the framework of gameAbstract module

*/


	// General purpose analysis machine
	//
	// Keeps updating tree of possibilities until moveNow flag set
	// and then picks best scoring position available.
	//
	// Unless winning move / sequence spotted
	//

	// Game analysis is an object which will usually contain sub-analyses

function gameAnalysis( position , player ) {
	this.rawScore = gameScore( position , player )
	if ( position.finished ) {
		this.score = this.rawScore
		return
		}
	var maybes = new object()	// possible next positions and analyses
	

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
