/*
Game pieces are draggable objects whose drop-targets are the squares
of a game board.
*/

include("gameBoard","htmlDrag5")

// square is spot on board, nam is type of piece,
//  team is who it belongs to (~colour)
function gamePiece( square , nam , team , image , siz ) {
	var imgArgs = {src:image}; /*siz=siz||88;*/
	if ( siz ) { /*aalert(siz);*/
	  if ( typeof siz == "number" ) siz = [ siz , siz ];
	  imgArgs.width  = siz[ 0 ] + "px";
	  imgArgs.height = siz[ 1 ] + "px";
	}
	// (if resizing not the desired approach, adjust position...)
// 	if ( halfSquareSizeCrop ) { /*aalert(halfSquareSizeCrop);*/
// 		var str = "-" + halfSquareSizeCrop + "px";
// 		imgArgs.position = "relative";
// 		imgArgs.top = ( imgArgs.left = str );
// 	}
	if (arguments.length==0) return;
	this.board = square.board;
	this.square = square;
	this.availableMoves = {};
	square.occupants.push( this );
	this.nam = nam;
	this.team = team;
	DragElement.call( this, [  'div' ,
		[{"class":"gamePiece",id:"gamePiece:"+nam,parent:this.board.it},
		["img",[ imgArgs ]], ]
		 ], square.xy )
// 	alert( this.nam )
	}
gamePiece.prototype = new DragElement
mergeIn( gamePiece.prototype, {
  remove : function() {
    // take it off the board
    this.board.pieces.remove( this );
    this.square.occupants.remove( this );
    this.square = null;
    this.hide();
  },
  moveTo : function( square ) {
    // move it to a particular square
    this.square.occupants.remove( this );
    this.square = square;
    square.occupants.push( this );
    // physically move
    square.putOn( this );    
  },
  become : function( nam ) {
    // change its type
    this.nam = nam;
    // and therefore image
    this.it.children[ 0 ].setAttribute( "src" , "../images/chess/" + 
	    nam + ( this.team ? "b" : "w" ) + ".gif" );
  }
});
