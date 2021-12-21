/*
A game board (in this case) is a 2D array of squares,
which are dropTargets for pieces
*/

// Generating answers and scores

var gameBoards = new Array()
/* Parameters to gameBoard constructor:
	name - also used to look up image files
	m,n    - dimensions of board
	imgPath   -  where to find images
	imgExtn   -  extension
	imgName   - function from i,j into image name (minus path, extension as above)
	sqrName   - function from i,j to a string representation of the square
	key       - answer key,  an array of values - 'meaning' depends on choice of ans2key
			answer may be passed instead (will be converted using ans2key).
	markScale - scale for scoring answer (= maximum mark,  1 is minimum)
*/

var halfSquareSize = 44;	// original square size - and size of images
var halfSquareSizeCrop = 10;	// reduction (every side) required for smaller board
var posAdjustString = halfSquareSizeCrop ? "-" + halfSquareSizeCrop + "px" : "0px";

// half-height & half-wodth - temp fix
var hr = halfSquareSize - halfSquareSizeCrop;
var hw = hr;
var hh = hr;    // hr should always be minimum of hh, hw. Currently ==
function gameBoard(name,m,n,imgPath,imgExtn,imgName,sqrName) {
	if (arguments.length==0) return
	this.name = name || "gameboard"
	this.m = (m = m || 8)
	this.n = (n = n || 8)
	this.pieces = [];
	this.imgPath = imgPath || "../images/"
	this.imgExtn = imgExtn || ".gif"
	this.imgName = imgName || function() { return '--' }
	this.sqrName = sqrName || squareNameA1
/*	this.frames = new Array()
	this.targets = new Array()
	var margin=5
	this.modelFrame = document.getElementById(name+"_frame")
	this.modelTarget = document.getElementById(name+"_target")*/
	MobileElement.call(this,
		[ 'div',[{"class":"gameboard",id:"gameboard:"+name,parent:document.body} ] ],
		[10,10],"relative" )
	this.squares = new Array()
	this.allSquares = new Array()
	for (var i=0; i<m; i++) {
	    this.squares.push( new Array( n ) )
	    for (var j=0; j<n; j++) {
		var elArgs = ["div",[{id:this.it.id+".square:"+this.sqrName(i,j)},
			["img",[{src:this.imgPath + this.imgName(i,j) + this.imgExtn,
			width: 2*hw ,  height: 2*hh
			  /*position: "relative", top: posAdjustString, left: posAdjustString */}]]
			]]
		var square;
		this.addChild( square =	new DropTarget(
			[elArgs,[hw*(2*i),hh*(2*(n-1-j))]],hr,[0,0]/*[0,0,2*hw,2*hh],[hw,hh] */))
		square.board = this
		square.i = i
		square.j = j
		square.occupants = new Array()
		this.squares[i][j] = square
		this.allSquares.push( square )
	    }   }
	gameBoards.push(this)
	}
gameBoard.prototype = new htmlElement
mergeIn(gameBoard.prototype, {	} )

var letters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
var numbers="123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0"
function squareNameA1( i, j ) { return letters.charAt(this.i) + numbers.charAt(this.j) }

function chessImgName( i, j ) { return (1 & (i ^ j)) ? "Ow" : "Ob" }
var chessImgPath = "../images/chess/"

// addEventHandler("DragElementGrab",updatePlacePuzzleScores,0,0)
// addEventHandler("DragElementDrop",updatePlacePuzzleScores,0,0)

chessBoards = new Array()

function chessBoard(m, n, imgName, imgExtn) {
	gameBoard.call( this, "chess", m, n, chessImgPath, imgExtn, imgName || chessImgName )
	theStyle = this.it.style
	theStyle[ "borderStyle" ] = "solid"
	theStyle[ "borderWidth" ] = "10px"
	theStyle[ "borderColor" ] = "white"
	theStyle[ "width" ]  = "" + ( hw*16 ) + "px"
	theStyle[ "height" ] = "" + ( hh*16 ) + "px"
// 	theStyle[ "border" ] = "solid white 10px"
	chessBoards.push( this ) }
chessBoard.prototype = new gameBoard
mergeIn(chessBoard.prototype, {	} )

function gameboard_init() { 	// for debugging stuff
/*	sb=placePuzzles[0]
	f0=sb.frames[0]
	e0=f0.it
	t0=sb.targets[0]
	et0=t0.it*/
	}
// convenience
gameBoard.prototype.s = function( i , j ) { return this.squares[ i ][ j ].occupants[ 0 ]; }