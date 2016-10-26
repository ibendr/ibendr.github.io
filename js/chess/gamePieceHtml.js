/*
Game pieces are draggable objects whose drop-targets are the squares
of a game board.
*/

include("htmlDrag6")

// square is spot on board, nam is type of piece,
//  team is who it belongs to (~colour)
function GamePieceHtml( boardHtml , piece , image , siz ) { /*aalert( image ) ;*/
	var imgArgs = { src : image }; /*siz=siz||88;*/
	if ( siz ) { /*aalert(siz);*/
	  if ( typeof siz == "number" ) siz = [ siz , siz ];
	  imgArgs.width  = siz[ 0 ] + "px" ;
	  imgArgs.height = siz[ 1 ] + "px" ;
	}
	if ( arguments.length == 0 ) return ;
	var square = boardHtml.cellsHtml[ piece.cell.index ] ; // 'square' should be called cellHtml
	DragElement.call( this, [  'div' ,
		[ { "class" : "gamePiece" /*, id: "gamePiece:" + nam*/, parent : boardHtml.it },
		[ "img" , [ imgArgs ] ] , ]
		 ], square.xy ) ; 
// 	alert( this.nam )
	}
GamePieceHtml.prototype = new DragElement ;
