/*  A "fill" puzzle consists of a target area (the board) and a
set of shapes with which to attempt to fill (cover) it.  Usually,
the pieces are not permitted to overlap (although this would
usually preclude filling the area,  since they are generally just
exactly adequate in area.
*/

var fillpuzzles = new Array()

/* Parameters to fillpuzzle constructor:

	name - also used to look up image files
	
	board - a shape (see definition later)
	pieces - an array of shapes	

	overlap - bool - permit overlapping pieces?

			The rest are the same as for PlacePuzzle:

	imgPath - path to image files (default '../images/')
	imgExtn - extension (default '.png') for image files
	markScale - scale for scoring answer (= maximum mark,  1 is minimum)

		not needed - 

	key  - answer key,  as an array of n*(n-1)/2 boolean values,

	(we will score by how many pieces - actually what area - is
	successfully placed on the board,  deducting for overlaps
	(if they are permitted)).

*/
function FillPuzzle(name,n,board,pieces,imgPath,imgExtn,markScale) {
	if (arguments.length==0) return
/*	if (x0==undefined) x0=8
	if (xd==undefined) xd=96
	if (y0==undefined) y0=8
	if (y1==undefined) x1=136*/
	PlacePuzzle.apply(this,[name,n,placeRow(x0,y0,xd,0),placeRow(x0,y1,xd,0),
//   	storyboardAnswer2key,tol,true,imgPath,imgExtn,key,markScale])
	fillPuzzles.push(this)
	}
FillPuzzle.prototype = new PlacePuzzle
mergeIn(FillPuzzle.prototype, {
	} )

function fill1_init() { 	// for debugging stuff
	fp=fillPuzzles[0]
/*	f0=sb.frames[0]
	e0=f0.it
	t0=sb.targets[0]
	et0=t0.it*/
  }

