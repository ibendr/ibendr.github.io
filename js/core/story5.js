/*  Most of the code for storyboard has been absorbed into
the slightly more general placePuzzle.
*/

var storyboards = new Array()

/* Parameters to Storyboard constructor:

	name - also used to look up image files
	n    - number of frames

	x0   - x-coord (left) of first frame/target
	xd   - x-coord increase from one frame to next
	y0   - y-coord (top) of frames
	y1   - y-coord (top) of targets

	tol  - snap-tolerance: how close to target frames need to be dropped

			The rest are the same as for PlacePuzzle:

	imgPath - path to image files (default '../images/')
	imgExtn - extension (default '.png') for image files
	key  - answer key,  as an array of n*(n-1)/2 boolean values,
					 (being whether A precedes B, A precedes C, ... , ...)
					OR the answer as a letter string e.g. "CEDABF"
	markScale - scale for scoring answer (= maximum mark,  1 is minimum)
*/
function Storyboard(name,n,x0,xd,y0,y1,tol,imgPath,imgExtn,key,markScale) {
	if (arguments.length==0) return
	if (x0==undefined) x0=8
	if (xd==undefined) xd=96
	if (y0==undefined) y0=8
	if (y1==undefined) x1=136
	PlacePuzzle.apply(this,[name,n,placeRow(x0,y0,xd,0),placeRow(x0,y1,xd,0),
  	storyboardAnswer2key,tol,true,imgPath,imgExtn,key,markScale])
	storyboards.push(this)
	}
Storyboard.prototype = new PlacePuzzle
mergeIn(Storyboard.prototype, {
	} )

function storyboard5_init() { 	// for debugging stuff
	sb=storyboards[0]
	f0=sb.frames[0]
	e0=f0.it
	t0=sb.targets[0]
	et0=t0.it
  }

