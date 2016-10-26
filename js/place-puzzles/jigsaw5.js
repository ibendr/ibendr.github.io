var jigsaws = new Array()

/* Parameters to Jigsaw constructor:
	name  - also used to look up image files

	nx,ny - width & height of grid as number of frames
	x0,y0   - x,y coords (left,top) of first frame
	x0d,y0d - x,y coord increase from one frame to next
	x1,y1   - x,y coords (left,top) of first target
	x1d,y1d - x,y coord increase from one target to next
	tol     - snap-tolerance: how close to target frames need to be dropped
	imgPath - path to image files (default '../images/')
	imgExtn - extension (default '.png') for image files
	key  - answer key,  as an array of letters giving the letter to the
	        right and below each letter.  '_' is used for an edge.
	        Alternatively,  a string answer may be passed.
	markScale - scale for scoring answer (= maximum mark,  1 is minimum)
*/
function Jigsaw(name,nx,ny,x0,y0,x0d,y0d,x1,y1,x1d,y1d,
		tol,imgPath,imgExtn,key,markScale) {
	this.nx = nx
	this.ny = ny
	var n = nx*ny
	PlacePuzzle.apply(this,
		[name,n,placeGrid(x0,y0,x0d,y0d,nx),placeGrid(x1,y1,x1d,y1d,nx),
  	jigsawAns2key(3,nx,ny),tol,true,imgPath,imgExtn,key,markScale])
	jigsaws.push(this)
	}
Jigsaw.prototype = new PlacePuzzle
// mergeIn(Jigsaw.prototype, {	} )

