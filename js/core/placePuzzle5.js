/*
Program to operate a drag-and-drop frame-placement type question.

A generalisation from the earlier Storyboard program.

Relies on numerous other scripts,  included thusly:

  <script type="text/javascript" src="include.js"></script>
  <script type="text/javascript">
    include( "object1", "array1", "dom1", "event1",
			"htmlElement3", "htmlMobile3", "htmlDrag4", "dropTarget4",
			"placement1", "placePuzzle5",  "psyfUpdateScore1"   )
    </script>

A puzzle is generated and placed in a document by including a script
- AFTER the </body> tag - calling the PlacePuzzle constructor.
An example follows:

  <script type="text/javascript">
<!--
  	void(new PlacePuzzle(
				"warby-map",6,                   // name, number of frames
				placeArc(334,512,504,5,-40,40),  // arrangement of source frames
				placeGrid(234,128,100,100,3),    // arrangement of target spots
				jigsawAns2key(1,3,2),            // scoring system
				null,null,                       // placement tolerance,  snap
				null,null,                       // image path and extension
				"BEDFAC",                        // answer or answer key
				100															 // mark scale (default=5)
				))
//-->
	</script>

If the document includes elements with class "model" and id's "<name>_frame","<name>_target",
then these will be used as cloning models for the frames and targets.
Within these model elements,  both text and attribute values will be checked for the presence of
the two variables -
$A   - to be replaced by A,B,C,... for the 1st,2nd,3rd,... frame or target generated.
$1   - to be replaced by 1,2,3,... for the 1st,2nd,3rd,... frame or target generated.

Don't jump to the conclusion that we are enabling unix-shell-style parameter expansion.  We're not.
*/

var imageExtension=".png"
var letters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
function replaceA1(s) {
	out=s.replace("$A",letters.charAt(this.i)).replace("$1",""+(this.i+1))
	return out
	}

// Generating answers and scores

function placePuzzleAnswer(blank) {
	// Generate answer which would be returned to sever for scoring
	// Format is a letter or '-' for each target,  e.g. "BA-E-C"
	if (blank==undefined) blank="-"
	var out=''
	for (var i=0; i<this.n; i++) {
		var drops = this.targets[i].drops
		out += ( (drops.length>0) && drops.last().letter ) || blank
		}
	return out
  }
// Transpose answer : generate array of position numbers for A,B,... in answer
// doubles as simple (default)  .ans2key  function
function letterPosns(str,n) {
	n = n || str.length
	var out=new Array()
	for (var i=0; i<n; i++) out.push(str.indexOf(letters.charAt(i)))
	return out
	}

// Other ans2key functions

function storyboardAnswer2key(str) {
  // Convert an answer (e.g. "BADC") to a key,  which is an array
  // of boolean values (see comment in Storyboard constructor)
	var key = new Array()
	var posns = letterPosns(str)
	for (var i1=0; i1<this.n-1; i1++)
		for (var i2=i1+1; i2<this.n; i2++) {
			key.push(  ( (posns[i1]>-1) && (posns[i2]>-1) ) ?
			  ( posns[i1] < posns[i2] ) : -1 )
			}
	return key
	}
function jigsawAns2key(typ,nx,ny) {
/*  make an ans2key function for a particular size jigsaw grid,
	 and choice of score system (typ):
	   0 - count frames in correct absolute positions
	   1 - count frame-pairs in (exact) correct relative positions
	   2 - count correct right- and below- neighbours
		 3 - count correct neigbours in all 4 directions		*/
	return func("(str) { return jigsawAnswer2key"+typ+"(str,"+nx+","+ny+") }")
	}

jigsawAnswer2key0 = letterPosns

function jigsawAnswer2key1(str,nx,ny) {
  // Convert an answer (e.g. "BADCFE") to a key which is an array
  // of integer values representing the relative placement of the pairs of letters
	var key = new Array()
	var n=nx*ny
	var posns = letterPosns(str)
	for (var i1=0; i1<n-1; i1++)
		for (var i2=i1+1; i2<n; i2++) {
			if ( (posns[i1]>-1) && (posns[i2]>-1) )
				// formula to uniquely represent relative 2D position,
				// equivalent to  (x2 - x1) + 2 * nx * (y2 - y1)
				key.push(  2 * ( posns[i2] -  posns[i1] ) 
					- ((posns[i2]%nx)-(posns[i1]%nx)) )
			else	key.push( 0 )
			}
	return key
	}
function jigsawAnswer2key2(str,nx,ny) {
  // Convert an answer (e.g. "BADCFE") to edge-inclusive ("BAD_CFE_____") 
  // and then to a key,  which is an array of characters specifying
  // each letter's neighbouring letters (or edge) to the right and below.
  // Using this key,  score will be awarded for correctly placing a 
  // piece on the right or bottom edge (but not top or left)
	for (var i=0,str2=''; i<ny; i++) str2 += str.substr(i*nx,nx)+'_'
	for (i=0; i<nx; i++) str2 += '_'
	var key = new Array()
	for (var i=0; i<nx*ny; i++) {
		var letter=letters.charAt(i)
		var posn = str2.indexOf(letter)
		if (posn>-1) key.push(str2.charAt(posn+1),str2.charAt(posn+nx+1))
		else key.push('-','-')
	  }
	return key
	}
function jigsawAnswer2key3(str,nx,ny) {
  // As above,  but using neighbours in all 4 directions,
	// and including all 4 edges.  (e.g. "^^^^^[BAD][CFE]_____")
  // Thus letter-to-letter boundaries will score double,
	// and letter-to-edge score single
	for (var i=0,str2=''; i<=nx+1; i++) str2 += '^'
	for (i=0; i<ny; i++) str2 += '['+str.substr(i*nx,nx)+']'
	for (i=0; i<=nx; i++) str2 += '_'
	var key = new Array()
	for (var i=0; i<nx*ny; i++) {
		var letter=letters.charAt(i)
		var posn = str2.indexOf(letter)
		if (posn>-1) key.push(str2.charAt(posn+1),str2.charAt(posn-1),
				str2.charAt(posn+nx+2),str2.charAt(posn-nx-2))
		else key.push('-','-','-','-')
	  }
	return key
	}

function tallyMatches(l1,l2) {
	// Count number of indeces for which two arrays hold equal values
	var l=Math.min(l1.length,l2.length)
	for (var i=0,n=0; i<l; i++) if (l1[i]==l2[i]) n++
	return [n,l]
	}

function placePuzzleScore() {
	if (!this.key) return
	return tallyMatches(this.key,this.ans2key(this.answer()))
	}

var placePuzzles = new Array()
/* Parameters to PlacePuzzle constructor:
	name - also used to look up image files
	n    - number of frames
	sourcePl  -  how to place source frames  \  both are functions
	targetPl  -  how to place target frames  /   of integer returning [x,y]
	ans2key   -  function to convert answer ("BDAC") to key
	tolerance -  how close to target to be considered a hit
	snap      -  whether or not to snap to target when hit
	imgPath   -  where to find images
	imgExtn   -  extension
	key       - answer key,  an array of values - 'meaning' depends on choice of ans2key
			answer may be passed instead (will be converted using ans2key).
	markScale - scale for scoring answer (= maximum mark,  1 is minimum)
*/
function PlacePuzzle(name,n,sourcePl,targetPl,ans2key,tolerance,snap,imgPath,imgExtn,key,markScale) {
	if (arguments.length==0) return
	this.name = name
	this.n = n
	this.sourcePl = sourcePl || placeRow(8,  8,96,0)
	this.targetPl = targetPl || placeRow(8,136,96,0)
	this.ans2key  = ans2key  || letterPosns
	this.ww = tolerance || 25
	this.snap = (snap!=false) // default to true
	this.imgPath = imgPath || "../images/"
	this.imgExtn = imgExtn || ".png"
	if (key!=undefined)
		this.key = ((typeof key)=="string") ? this.ans2key(key) : key
	this.markScale = markScale || 5
	this.frames = new Array()
	this.targets = new Array()
	var margin=5
	this.modelFrame = document.getElementById(name+"_frame")
	this.modelTarget = document.getElementById(name+"_target")
	MobileElement.call(this,
		[ 'div',[{"class":"placepuzzle",id:"placepuzzle:"+name,parent:document.body} ] ],
		[10,10],"relative" )
	for (var i=0; i<n; i++) {
		this.i = i  // for replaceA1 to use

		var elArgs = (this.modelTarget) ?
			[this.modelTarget,[],[replaceA1,this,"block"]] :
			["div",[{id:this.it.id+".target:"+i},
				["img",[{src:this.imgPath + name + '--' + this.imgExtn}]]
				]]
		this.addChild( this.targets[i] =
			new DropTarget([elArgs,this.targetPl(i)],this.ww,[0,0]) )

		var elArgs = (this.modelFrame) ?
			[this.modelFrame,[],[replaceA1,this,"block"]] :
			["div",[{id:this.it.id+".frame:"+i},
				["img",[{src:this.imgPath + name + '-' + letters.charAt(i) + this.imgExtn}]]
				]]
		this.addChild( this.frames[i] =
			new DragElement(elArgs,this.sourcePl(i)) )
		this.frames[i].letter = letters.charAt(i)
		this.frames[i].dropTargets = this.targets
		}
	placePuzzles.push(this)
	}
PlacePuzzle.prototype = new htmlElement
mergeIn(PlacePuzzle.prototype, {
	answer:placePuzzleAnswer,
	score:placePuzzleScore
	} )

function updatePlacePuzzleScores(e,t) {
	var pzl = t && t.pa
	if (pzl && pzl.updateScore) pzl.updateScore()
	return true
	}

addEventHandler("DragElementGrab",updatePlacePuzzleScores,0,0)
addEventHandler("DragElementDrop",updatePlacePuzzleScores,0,0)

function placePuzzle5_init() { 	// for debugging stuff
	sb=placePuzzles[0]
	f0=sb.frames[0]
	e0=f0.it
	t0=sb.targets[0]
	et0=t0.it
	}

