/*
The html front-end for a gameBoard object

Started July 2015 as split from old gameBoard.js

*/

var hr = 32;
var hw = hr;
var hh = hr;    // hr should always be minimum of hh, hw. Currently ==

function RectGameBoardHtml ( game , imgPath , imgExtn , imgName , sqrName ) {
    if ( arguments.length == 0 ) return ;
    this.board = ( board = game.board ) ;
    var m = board.m ;
    var n = board.n ;
    this.piecesHtml = { } ;	// dictionary from index to gamePieceHtml object(s)
    this.cellsHtml = { } ;	// dictionary from index to html DropTarget object(s)
    this.imgPath = imgPath || "../images/" ;
    this.imgExtn = imgExtn || ".gif" ;
    this.imgName = imgName || function() { return '--' } ;
    this.sqrName = sqrName || squareNameA1 ;
    MobileElement.call( this , [ 'div', 
	    [  { "class" : "gameboard" , id : "gameboard:" + name , parent : document.body } ] ],
					    [ 10 , 10 ] , "relative" ) ;
    this.squares = { } ;
    for ( index in board.cells ) {
	var cell = board.cells[ index ] ;
	var i = index[ 0 ] ;	// With RectGameBoard . index is [ i , j ] coroodinates
	var j = index[ 2 ] ;	// NOTE: We just discovered that index is string "2,4" etc NOT array
	var square ;
	var elArgs = [ "div" , [ { id : this.it.id + ".square:" + this.sqrName( i , j ) } ,
	    [ "img" , [ { src : this.imgPath + this.imgName( i , j ) + this.imgExtn ,
		    width: 2 * hw ,  height: 2 * hh
		    /*position: "relative", top: posAdjustString, left: posAdjustString */} ] ] 
		    ] ] ;
	this.addChild( square =	new DropTarget(
		[ elArgs , [ hw * ( 2 * ( i - 1 ) ) , hh * ( 2 * ( n - j ) ) ] ] ,
		hr , [ 0 , 0 ] /*[0,0,2*hw,2*hh],[hw,hh] */ ) ) ;
	this.cellsHtml[ index ] = square;
	while ( piece = cell.pieces.each() ) {
	    var pieceHtml = new GamePieceHtml( this , piece , 
		this.imgPath + piece.type + ( piece.team ? "b" : "w" ) + this.imgExtn , 2 * hr ) ;
	    this.piecesHtml[ index ] = pieceHtml ;
	}
    }
//     for ( piece in board.pieces ) {
// 	var pieceHtml = new GamePieceHtml( this , piece , 
// 		this.imgPath + piece.type + ( piece.team ? "b" : "w" ) + this.imgExtn , 2 * hr ) ;
// 	this.piecesHtml[ piece ] = pieceHtml ;
//     }
//     
}
	
RectGameBoardHtml.prototype = new htmlElement
mergeIn( RectGameBoardHtml.prototype , {
    updateTargets : function() {
	for ( piece in this.board.pieces ) {
	    pieceHtml = this.piecesHtml[ piece ] ;
	    pieceHtml.dropTargets = [ ] ;
	    for ( move in piece.availableMoves ) {
		pieceHtml.dropTargets.push( it.board.cellsHtml[ move ] );
	    }
	}
    }
} )

var letters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
var numbers="123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0"
function squareNameA1( i, j ) { return letters.charAt(this.i) + numbers.charAt(this.j) }

function chessImgName( i, j ) { return (1 & (i ^ j)) ? "Ow" : "Ob" } // chequering here!
var chessImgPath = "../images/chess/"


chessBoards = new Array()

function ChessBoardHtml( game , imgName , imgExtn ) {
	RectGameBoardHtml.call( this , game , chessImgPath , imgExtn , imgName || chessImgName ) ;
	theStyle = this.it.style ;
	theStyle[ "borderStyle" ] = "solid" ;
	theStyle[ "borderWidth" ] = "10px" ;
	theStyle[ "borderColor" ] = "white" ;
	theStyle[ "width" ]  = "" + ( hw*16 ) + "px" ;
	theStyle[ "height" ] = "" + ( hh*16 ) + "px" ;
}
ChessBoardHtml.prototype = new RectGameBoardHtml
mergeIn( ChessBoardHtml.prototype, {	} )

function gameboard_init() { 	// for debugging stuff
/*	sb=placePuzzles[0]
	f0=sb.frames[0]
	e0=f0.it
	t0=sb.targets[0]
	et0=t0.it*/
	}
// convenience
RectGameBoardHtml.prototype.s = function( i , j ) { return this.squares[ i ][ j ].occupants[ 0 ]; }