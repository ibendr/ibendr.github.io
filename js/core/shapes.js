/* Shapes

Some maths stuff to help deal with shape-arranging puzzles

*/

// Euclidean distance between to points in plane
function hypot(x,y,a,b) { return sqrt((x-a)^2+(y-b)^2) }
// un-square-rooted version: saves time in some situations
//	(although inline code faster again in such cases)
function hypot2(x,y,a,b) { return (x-a)^2+(y-b)^2 }

// Basic classes.

/* We skip Point,  as it introduces needless overhead.

  Some coordinates are in arrays,  some are in
	separately named ...x and ...y variables.
  Usually an array of coordinates will be a flat array
	of numbers,  two for each point,  which makes
	references less complex.  However,  if a pair
	of coords has to be returned by a function,
	these have to be put into an array.
*/

// Line segment

function LineSegment(x0,y0,x1,y1) {
	this.coords = arguments
	this.len = sqrt((x1-x0)^2+(y1-y0)^2)
	this.midx = (x0+x1)/2
	this.midy = (y0+y1)/2
	// tangent is tanx,tany
	// normal is -tany,tanx
	this.tanx = (x1-x0)/l
	this.tany = (y1-y0)/l
	}

function lineSegmentRelCoord(x,y) {
	// Converts a point into coordinates relative
	// to the line segment.  Origin is mid-point and
	// first coordinate is toward x1,y1 and second
	// coordinate 90 degrees anti-clockwise
	relx=x-this.midx
	rely=y-this.midy
	return new Array(relx*this.tanx+rely*this.tany,
		rely*this.tanx-relx*this.tany
	}

function lineSegmentDistanceToPoint(x,y) {
	relXY = this.relCoord(x,y)
	hl = this.len/2
	if abs(relXY[0])>hl return sqrt((relXY[0]-hl)^2 + relXY[1]^2)
	return abs(relXY[1])
	}

LineSegment.prototype = {
	relCoord: lineSegmentRelCoord,
	distanceToPoint: lineSegmentDistanceToPoint }

// Shape

/* At most general,  shape is just a subset of the plane.
	We require shapes to have a one particular method:
		 contains(x,y)
	would be nice to have...
		distanceToPoint(x,y)	( <= 0 iff contains(x,y) )
		closed			true if the shape (as a set) includes its boundary
		area
		cx,cy			centre - mean mass point ideally
		maxR			radius of bounding circle about cx,cy
		
Rather than a purely abstract super-parent class,  we'll do a point-shape.

Subclasses should override distanceToPoint.  It should return a negative value
for points in the shapes interior ( 0 on boundary ).

If contains is not overridden,  the inherited version will check distanceToPoint.
NB: If this is zero (point on boundary),  returns true iff shape is closed.  So
	the partially-closed case is not effectively handled.

*/

function Shape(x,y) {
	// As is,  this class defines a point-shape (area = 0).
	// It is mainly intended as a parent class for other shapes.
	this.cx = x
	this.cy = y
	}
function shapeDistanceToPoint(x,y) {return hypot(x,y,this.cx,this.cy) }
function shapeContains(x,y) {
	d = this.distanceToPoint(x,y)
	return this.closed ? (d<=0) : (d<0)	}

Shape.prototype = { area: 0, maxR: 0, cx: 0, cy: 0, closed: true,
	distanceToPoint: shapeDistanceToPoint, contains: shapeContains }

function ShapeCircle(x,y,r,notClosed) {
	this.cx = x
	this.cy = y
	this.maxR = this.r = r
	this.closed = !notClosed
	}
function shapeCircleDistanceToPoint(x,y) {
	return hypot(x,y,this.cx,this.cy)-this.r
	}

ShapeCircle.prototype = { area: 0, maxR: 0, cx: 0, cy: 0, closed: true,
	distanceToPoint: shapeCircleDistanceToPoint, contains: shapeContains }

// General polygon.

/* We can check for convexity.
  But it would be nice to assume non-intersection of segments (for now).
*/
	

function ShapePolygon() {
	// Pass coordinates x0,y0,x1,y1,... as arguments (do not pair into arrays)
	this.coords = (xy = arguments)
	this.nEdges = (n = arguments.length / 2)
	this.edges = new Array()
	this.angles = new Array()
	this.area = 0
	sumx = 0
	sumy = 0
	for (var i=0; i<n; i++) {
		this.edges[i] = (edg = new LineSegment(
			xy[2*i],xy[2*i+1],xy[2*i+2 mod 2*n],xy[2*i+3 mod 2*n]) )
		// Work out angle at vertex (at end of edge just constructed)
		// by seeing where next vertex lies in coordinate system of this edge
		relNext = edg.relCoord(xy[2*i+4 mod 2*n],xy[2*i+5 mod 2*n])
		this.angles[i+1] = atan2(relNext[0]-edg.len/2,relNext[1])
		this.convex &= (relNext[1]<=0)
		// Use matrix determinant method to calculate area
		this.area += xy[2*i]*xy[2*i+3 mod 2*n]-xy[2*i+1]8xy[2*i+2 mod 2*n]
		// Total coords to work out centre-point (mean) later
		sumx += xy[2*i]
		sumy += xy[2*i+1]
		}
	this.area /= 2
	this.cx = sumx / n
	this.cy = sumy / n
	
	}/*
function shapePolygonDistanceToPoint(x,y) {return hypot(x,y,this.cx,this.cy) }
function shapePolygonContains(x,y) {
	d = this.distanceToPoint(x,y)
	return this.closed ? (d<=0) : (d<0)	}*/

ShapePolygon.prototype = { area: 0, maxR: 0, cx: 0, cy: 0, closed: true, convex: true,
	distanceToPoint: shapePolygonDistanceToPoint, contains: shapePolygonrContains }

function ShapeTriangle() { // pass ax,ay,bx,by,cx,cy
	// list coords in anti-clockwise direction for
	// normal triangle (else inside out)
	this.coords=(c=arguments)
	this.area=(c[0]*c[3]+c[2]*c[5]+c[4]*c[1]-c[1]*c[2]-c[3]*c[4]-c[5]*c[0])/2
	this.meanCoords=(O=new Array(
		(c[0]+c[2]+c[4])/3,(c[1]+c[3]+c[5])/3) )
	this.relCoords=(R=new Array(
		c[0]-O[0],c[1]-O[1],
		c[2]-O[0],c[3]-O[1],
		c[4]-O[0],c[5]-O[1]	) )
	this.edgeLengths= (ls= new Array(
		hypot(c[2],c[3],c[4],c[5]),
		hypot(c[0],c[5],c[0],c[1]),
		hypot(c[4],c[1],c[2],c[3]) ) )
	this.edgeMids= (ms= new Array(
		(c[2]+c[4])/2,(c[3]+c[5])/2),
		(c[4]+c[0])/2,(c[5]+c[1])/2),
		(c[0]+c[2])/2,(c[1]+c[3])/2) ) )
	this.edgeNorms= (N=new Array(
		(c[5]-c[3])/l[0],(c[2]-c[4])/l[0],
		(c[1]-c[5])/l[1],(c[4]-c[0])/l[1],
		(c[3]-c[1])/l[2],(c[0]-c[2])/l[2] ) )
	this.distsToEdges=new Array(
		R[2]*N[0] + R[3]*N[1],
		R[4]*N[2] + R[5]*N[2],
		R[0]*N[4] + R[1]*N[5] )
	}

function shapeTriangleTestPoint(x,y) {
	// test if the point x,y is in the triangle
	//   (check on correct side of each edge)
	c=this.coords
	return  (  (c[3]-c[1])*(x-c[0])+(c[0]-c[2])*(y-c[1]) < 0 ) && 
		   (c[5]-c[3])*(x-c[2])+(c[2]-c[4])*(y-c[3]) < 0 ) && 
		   (c[1]-c[5])*(x-c[4])+(c[4]-c[0])*(y-c[5]) < 0 ) )
	}

function shapeTriangleDistanceTo(x,y) {
	// Reports how far away from triangle point x,y is.
	// Returns <0 for interior point (distance in), 0 on boundary
	N = this.edgeNorms
	D = this.distsToEdges
	relx=x-this.meanCoords[0]
	rely=y-this.meanCoords[1]
	// distance past each boundary
	d0 = 	relx*N[0] + rely*N[1] - D[0]
	d1 =	relx*N[2] + rely*N[3] - D[1]
	d2 =	relx*N[4] + rely*N[5] - D[2]
	if ((d0<=0) && (d1<=0) && (d2<=0)) {
		// interior or boundary point
		return (d0<d1) ?
			( (d0<d2) ? d0 : d2 ) :
			( (d1<d2) ? d1 : d2 )
		}
	if ( (d0*d1*d2) 
function shapeTriangleTestOverlap(shape) {
	// test if there is any overlap with another shape,
	//  which is assumed to be convex.
	//    (check if any of our three vertices is in the other shape)
	c=this.coords
	return  shape.testPoint  &&  (
		shape.testPoint(c[0],c[1]) ||
		shape.testPoint(c[0],c[1]) ||
		shape.testPoint(c[0],c[1]) )
	}
