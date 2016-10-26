/*
Lineup is a game in which the player must try to place points onto
a line segment in such a way that -
	. the first two   points are in different halves  of the segment
	. the first three points are in different thirds  of the segment
	. the first four points are in different quarters of the segment
	.  etc.
For the record, 17 is the highest possible score.

Outline of interface -

On first playing,  
-----------------     only the first (unbroken) full line segment is shown,
with the marker to click and drag onto it.  The segment will be brightish green.

When this marker is placed,  the unbroken segment is marked (dull) blue.
It will also be joined by a pair of half-length segments.  The half-segment
corresponding to the first marker's placement will also be dull blue,  while
the other half will be the receptive bright green colour.  Only it will act as
a drop target for the next marker.

When each marker is placed,  the next division of the segment appears.  As of
the 3-segment case (after the second marker is placed in the available half)
it becomes possible for the newly appearing division to have a segment with two
markers already present.  (e.g. if the first two markers are placed just either
side of halfway then they will both be in the middle third.) In such a case
the 'double-booked' segment is RED and the game is over.  In any other case there
will be exactly one available segment.

On subsequent attempts,
-----------------------    all divisions up to and including the one which
failed are shown from the outset.  At any given time there will be a 'live'
division corresponding to which marker is currently being placed (e.g. if
the third marker is being placed,  the third division - into thirds -
is the live one.)  Only the live division will have a bright green (live) segment.
The 'free' segments for 'future' divisions will be dull green,  and any clash
segments therein will be dull red.  Such clashes do not end the game - although
they let the player know they're not going to be getting further than that division.
  
*/


function lineupLine( dropTargetArgs ) {
	if ( arguments.length == 0 ) return
	DropTarget.apply( this , dropTargetArgs )
	}

lineupLine.prototype = new DropTarget
mergeIn( lineupLine.prototype, {
	} )


// var gameBoards = new Array()
/* Parameters to gameBoard constructor:
	name - also used to look up image files
	m,n    - dimensions of board
	imgPath   -  where to find images
	imgExtn   -  extension
	imgName   - function from i,j into image name (minus path, extension as above)
	sqrName   - function from i,j to a string representation of the segment
	key       - answer key,  an array of values - 'meaning' depends on choice of ans2key
			answer may be passed instead (will be converted using ans2key).
	markScale - scale for scoring answer (= maximum mark,  1 is minimum)
*/

// half-height & half-width - temp fix
var lineupWidth = 1224
var lineupHeight = 54

var lineupMaxSegments = 18
var lineupVisibleSegments = 1

function lineupLine( name ) {
	if (arguments.length==0) return
	this.name = name || "lineupline"
	MobileElement.call(this,
		[ 'div',[{"class":"lineupline",id:"lineupline:"+name,parent:document.body} ] ],
		[10,10],"relative" )
	this.segments = new Array()
	this.allSegments = new Array()
	for (var i=1; i<=lineupMaxSegments; i++) {
	    var segHWidth , segHHeight
	    segHWidth = lineupWidth / ( i * 2 )
	    segHHeight = lineupHeight / 2
	    this.segments.push( new Array( n ) )
	    for (var j=1; j<=i; j++) {
		var elArgs = ["div",[{id:this.it.id+".segment:"+this.segName(i,j)},
			[  ]
			]]
		var segment
		this.addChild( segment = new DropTarget(
			[ elArgs , [ segHWidth * ( 2 * j ) , segHHeight * ( 2 * i ) ] ,
			[ segHWidth ,segHHeight ] ) )
		segment.lineup = this
		segment.i = i
		segment.j = j
		segment.occupant = null
		this.segments[i][j] = segment
		this.allSegments.push( segment )
	    }   }
	lineups.push(this)
	}
lineup.prototype = new htmlElement
mergeIn(lineup.prototype, {	} )

function segName( i, j ) { return i + "." + j ) }

// addEventHandler("DragElementGrab",updatePlacePuzzleScores,0,0)
// addEventHandler("DragElementDrop",updatePlacePuzzleScores,0,0)


function lineup_init() { 	// for debugging stuff
/*	sb=placePuzzles[0]
	f0=sb.frames[0]
	e0=f0.it
	t0=sb.targets[0]
	et0=t0.it*/
	}
