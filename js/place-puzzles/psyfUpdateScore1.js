// Customised update score routine for psyfactors application

function updateNeuroScore() {
	// score is an array [correct,total] i.e. [3,10] means 3 out of 10
	var scale = this.markScale || 5
	var score = this.score()
	var responsenum = Math.floor((scale-0.99)*score[0]/score[1]) + 1
	if (parent) {
		// Call parent script to put answer id in form
	 	if (parent.PutNeuroRespId) parent.PutNeuroRespId(responsenum)
	 	// Report score on-screen when in testing mode
		var ss = (parent.document &&	parent.document.getElementById("scorespan")) ||
		  (document && document.getElementById("scorespan"))
		if (ss)	setNodeText(ss,' '+responsenum+' on a scale of 1 - '+scale+' ')
	  }
	}
function NeuroDone() {}

PlacePuzzle.prototype.updateScore = updateNeuroScore
