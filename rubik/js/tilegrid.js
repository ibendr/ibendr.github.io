// grid of tiles device - general enough to use for various games hopefully

// 2025

// uses array1.js

const basicTileCSS = { height: "128px" , width: "128px" , fontSize: "96px" , borderRadius: "8px" , position: "absolute" }

class Tile extends elem {
	lbl ; pos ; drag ; /*flips = 0 ;*/
    constructor( pa , lbl , pos , styl , proxies ) {
		// pa		parent (grid) - which should provide scaling information (?)
		// lbl		label (text to displayon tile)
		// pos		position in parent object's system - [ x , y ] for a grid
		// styl		style info object	
		// proxies	how many extra clone elements to make
	styl = styl ?? basicTileCSS ;
	// make main and ghost element for wraparound
	super( 'div' , pa , "tile" , styl , proxies ) ;
	this.lbl = lbl ;
	for ( let el of this.els ) el.innerText = ( lbl ) ;
	this.pos = pos /*?? [ 0 , 0 ] */;  // x , y OR in whatever framework host has
	this.update( ) ;
    }
    update( ) {
	// use parent objects posToPx method to get pixel position
	if ( this.pa && this.pa.posToPx ) {
	    this.setPosSize( this.pa.posToPx( this.pos ) ) ;
	}
    }
}
class DragTile extends Tile {
    constructor( ...args ) {
	super( ...args ) ;
	this.drag = [ 0 , 0 ] ; //null ; // [ dx , dy ] when element being dragged from position implied by pos
// 	this.dragOK = 3 ; // 0 = can't drag (default)
// 			  // 1 = drag X
// 			  // 2 = drag Y				// 3 = drag X or Y ( but not diagonal )
// 			  // 4 = 45 degree diagonals 		// 7 = 8-directions
// 			  // 8 = knight move angles ( ?! ) , 16, 32 ???
// 			  // 64 = catchall final category 		// 127 =  MOVE ANYWHERE
	this.dragLims = [ [ 0 , 0 ] , [ 0 , 0 ] ] ; 	// max distance tile can move in px
    }	
    update( ) {
	// use parent objects posToPx method to get pixel position, then add drag
	if ( this.pa && this.pa.posToPx ) {
	    let posPx = this.pa.posToPx( this.pos ).map( ( p,i ) => p + ( this?.drag?.[ i ] ?? 0 ) ) ;
	    this.setPosSize( posPx ) ;
	    // now fo ghost/s for wraparound
	    if ( this.pa.wrapSize ) {
		let pos  = posPx.slice( ) ;
		let xtr = false ;
		for ( let d of i2 ) {
		    let wrap = this.pa.wrapSize[ d ] ;
		    let edge = wrap - this.pa.scalXY[ d ] ;
		    let buf  = this.pa.scal.buf ;
		    if      ( posPx[ d ] < buf )        { pos[ d ] = posPx[ d ] + wrap ; xtr = true ; }
		    else if ( posPx[ d ] > buf + edge ) { pos[ d ] = posPx[ d ] - wrap ; xtr = true ; }
		}
		if ( xtr ) this.setPosSize( pos , null , [ 1 ] ) ; // reposition wraparound clone
	    }
	}
    }
}

// grid to host tiles
class TileGrid extends elem {
	kids ;			// just an array, but otherwise the same as tiles ?
	tiles ; 		// objects for the tile, in ArrayN of two dimensions
	scal ;			// scaling info { x: y: buf: lin: } ... grid scale ( x , y ) buffer between tiles ( buf ) and line/border thickness ( lin )
// 	moving ;		// { tiles: list of moving tiles , dir: axis , which: row/col }
    constructor ( pa , siz , scal , styl , lbls , prox ) {
	// pa is parent element to attach to
	// siz is size [ width , height ] in TILES	[ ? ... can be omitted if lbls is an ArrayN ( or array of arrays? ) ]
	// scal is scaling info [ scale-X , scale-Y , bufferPx , linePx ] px per tile placement , gap between tiles , line width ( optional )
	// styl is object with styles to set
	// lbls is function( x , y ) to yield label for tile at (x,y)  [ ? or ArrayN ]
	// prox is number of proxies of each tile to make (varies according to desired visual effects)
	if ( styl && ! scal ) {	// if scale not set, we'll work back from style if it is
	    scal = { } ;
	    scal.x   = styl.width       ? parseInt( stly.width  ) / ( siz[ 0 ] + 1 / 16 ) : undefined  ;
	    scal.y   = styl.height      ? parseInt( styl.height ) / ( siz[ 1 ] + 1 / 16 ) : scal.x ;
	    scal.x ||= scal.y ;
	    scal.buf = styl.padding     ? parseInt( styl.padding          )               : scal.x >> 5 ;
	    scal.lin = styl.borderWidth ? parseInt( scal.styl.borderWidth )               : ( scal.x >> 7 ) || 1 ;
	}
	// check if number or array ... convert to object
	if      ( typeof scal == "number" ) scal = { x: scal , y: scal , buf: scal >> 5 , lin: ( scal >> 7 ) || 1 } ;
	else if ( scal instanceof Array )   scal = { x: scal[ 0 ] , y: scal[ 1 ], buf: scal[ 2 ] ?? ( scal[ 0 ] >> 5 ) , lin: scal[ 3 ] ?? ( ( scal[ 0 ] >> 7 ) || 1 ) } ;
	styl ||=  {	width:  ( siz[ 0 ] * scal.x + 2 * scal.buf ) + '.px' ,
			height: ( siz[ 1 ] * scal.y + 2 * scal.buf ) + '.px'  } ;
	// make the host element
	super( 'div' , pa , 'tile-grid' , styl ) ;
	this.size = siz ;
	this.posKeys = rangeND( siz )
	this.kids = [ ] ;
	this.scal = scal ;
	this.scalXY = [ scal.x , scal.y ] ;
	this.wrapSize = [ scal.x * siz[ 0 ] , scal.y * siz[ 1 ] ]
	this.makeTiles ( lbls , prox ) ;
	initPointerListeners( this.el ) ;
// 	this.update() ;
    }
    makeTiles( lbls , prox , tileType ) {
	// make tiles
// 		console.log( arguments );
	let tiles = new ArrayN( this.size ) ;
	let scal = this.scal ;
	const tileStyle = { width: ( scal.x - scal.buf ) + 'px' , height: ( scal.y - scal.buf ) + 'px' , borderWidth: scal.lin + 'px' } ;
	if ( lbls ) {
	    for ( let pos of this.posKeys ) {
		tiles[ pos ] = new ( tileType ?? Tile )( this , lbls( ...pos ) , pos , tileStyle , prox ) ;
	    }
	}
	this.tiles = tiles ;
    }
    posToPx( pos ) { return [   pos[ 0 ]  * this.scal.x + this.scal.buf  ,   pos[ 1 ]  * this.scal.y + this.scal.buf  ] ; }
    pxToPos( px  ) { return [ (  px[ 0 ] - this.scal.buf ) / this.scal.x , (  px[ 1 ] - this.scal.buf ) / this.scal.y ] ; }
    update( ) {
	for ( let pos of this.posKeys ) {
	    this.tiles[ pos ].update( ) ;
	}
    }
}
class DragTileGrid extends TileGrid {
//         moving ;		// { tiles: list of moving tiles , dir: axis , which: row/col # }
    makeTiles( lbls ) {
	super.makeTiles( lbls , 1 , DragTile ) ;
	this.moving = { tiles: [ ] , dir: null , limits: null } ;
    }
    moveTiles( tiles , ...args ) {
	// mainly here to be overridden by subclasses to respond to tile being dragged
	// if there are more than one tiles moving, this should have been overridden
	this.moveTile( tiles[ 0 ] , ...args )
    }
    moveTile( tile , dest , dir , n ) {
	// The endDrag event only calls moveTiles, which (in default version) calls this
	//  so generally it would be moveTiles that we override and this can be ignored
	// As a default behaviour, we can swap location of two tiles
	// 	dest is new position [ x , y ], 
	//	dir=direction n=distance as convenience for 'rook' moves
	let temp = this.tiles[ dest ] ;
	this.tiles[ temp.pos = tile.pos ] = temp ;
	this.tiles[ tile.pos =   dest   ] = tile ;
	this.update( );
    }
    tileMoves( tile ) {
	// return moves available as [ [ x distances ] , [ y distances ] , [ positions ] ] or null if none
	// default to move anywhere
// 	return [ , , this.posKeys ] ;
	// any distance horizontal or vertical
	return tile.pos.map( ( p , d ) => range( - p , this.size[ d ] - p ) ) ;
    }
    tileMoveLims( tile ) {
	let sc = this.scalXY
	// how far a tile can move (by default to edges of grid) in px  [ [ dxmin , dxmax ] , [dymin , dymax ] ]
	return tile.pos.map( ( p , d ) => [ ( - p ) * sc[ d ] , ( this.size[ d ] - 1 - p ) * sc[ d ] ] ) ;
    }
    cancelMovers( ) {
	// take all tiles off moving.tiles list, resetting drag
	for (let tile of this.moving.tiles.splice( 0 ) ) {
	    tile.drag = [ 0 , 0 ] ;
	    tile.el.classList.remove( 'moving' ) ;
	    tile.els[ 1 ].classList.remove( 'moving' ) ;
	    tile.update( );
	}
    }
    startDrag( tile ) {
	// start a drag event with tile being the one grabbed
	this.moving.tiles  = [ tile ] ;
	this.moving.limits = this.tileMoveLims( tile ) ;
	let [ xmovs , ymovs , pmovs ] = ( this.moving.movesOK = this.tileMoves( tile ) ) ;
	let dir = 3 ;	// default - 3 = all directions
	if ( ! pmovs ) dir = ( ( xmovs && xmovs.length ) ? 1 : 0 ) + ( ( ymovs && ymovs.length ) ? 2 : 0 ) -1 ; // 2 = x or y
	if ( dir < 0 ) return false ; 	//	{ console.warn( 'drag move failed - no moves available' ) ; return ; }
	tile.addClass( 'moving' ) ;
	if ( ( this.moving.dir = dir ) < 2 ) this.startDragDirection( ) ;
	return true ;
    }
    startDragDirection( ) {
	// intercept this one in subclass to e.g. make other tiles move as well
    }
    moveDrag( dxy ) {
	// apply limits to movement
	this.limitDxy( dxy ) ;
	let tiles = this.moving.tiles ;
	let dir   = this.moving.dir ;
	if ( dir == 3 ) {
	    // move anywhere - in limits
	    tiles.map( tile => { tile.drag = dxy ; tile.update( ) ; } ) ;
	}
	if ( dir == 2 ) {
	    // have to move x or y but haven't picked which yet...
	    let absDx = Math.abs( dxy[ 0 ] ) ;
	    let absDy = Math.abs( dxy[ 1 ] ) ;
	    if ( absDx < this.scal.buf && absDy < this.scal.buf ) {
		// haven't moved far enough yet ... draw movement in both directions
		tiles.map( tile => { tile.drag = dxy ;  tile.update( ); } ) ;
	    }
	    else {
		// set the direction, then ensuing code activated
		dir = ( this.moving.dir = absDx > absDy ? 0 : 1 ) ;
		this.startDragDirection( ) ;
	    }
	}
	// only allowed move on one axis - keep other axis = 0
	if ( dir < 2 ) {
	    dxy[ 1 - dir ] = 0 ;
	    tiles.map( tile => { tile.drag = dxy ; tile.update( ); } ) ;
	}
    }
    endDrag( dxy , pos ) {
	let moving  = this.moving ;
	let movesOK = moving.movesOK ;
	// helper function - closest distance between a and b in mod c
	const dRing = ( (a,b,c) => Math.min ( ( a - b + 2 * c ) % c , ( b - a + 2 * c ) % c ) ) ;
	let closeM  = null ;
	if ( moving.dir == 3 ) {
	    let targets = movesOK[ 2 ] ;
	    let dest    = dxy.map( ( dd , d ) => ( pos[ d ] + ( dd / this.scalXY[ d ] ) + 2 * this.size[ d ] ) % this.size[ d ] ) ;
	    let closest = sum( dxy.map( Math.abs ) ) ; // so we don't move at all if that's the closest
	    for ( let targ of targets ) {
		let disd = dRing( targ[ 0 ] , dest[ 0 ] , this.size[ 0 ] ) + 
			   dRing( targ[ 1 ] , dest[ 1 ] , this.size[ 1 ] ) ;
		if ( disd < closest ) {
		    closest = disd ;
		    closeM  = targ ;
		}
	    }		    
	    if ( closeM ) {
		console.warn( moving.dir , moving.tiles.length , closeM ) ;
		this.moveTiles( moving.tiles , closeM );
	    }
	}
	else if ( moving.tiles.length && ( moving.dir < 2 ) ) {
	    let dir = moving.dir;
	    // tiles have been moved - record how far
	    let dis = dxy[ dir ] ;
	    // scale to grid squares
	    dis = ( dis / this.scalXY[ dir ] ) ;
	    let closest = Math.abs( dis ) ; // so we don't move at all if that's the closest
	    for ( let movD of ( moving.movesOK[ dir ] ?? range( this.size[ dir ] ) ) ) {
		let disd = dRing( dis , movD , this.size[ dir ] ) ;
		if ( disd < closest ) {
		    closest = disd ;
		    closeM  = movD ;
		}
	    }
	    if ( closeM ) {
		let dest = moving.tiles[ 0 ].pos.slice( ) ;
		dest[ dir ] = ( dest[ dir ] + closeM + 2 * this.size[ dir ] ) % this.size[ dir ] ;
		console.warn( moving.tiles.map(t=>t.pos) , moving.dir , dest , closeM ) ;
		this.moveTiles( moving.tiles , dest , moving.dir , closeM );
	    }
	}
	this.cancelMovers( ) ;
    }
    startPoint( ev , id , x , y ) {
	event.preventDefault();
	let target = ev.target ;
//  	console.log ( 'start' , x , y , pos , target , target.obj ) ;
	if ( this.points.length ) return ;
	let tile = target && target?.obj;
	if ( tile && ( tile instanceof DragTile ) ) {
	    if ( this.startDrag( tile ) ) this.points[ id ] = [ x , y , tile ] ;
	}
    }
    limitDxy( dxy ) {
	for ( let d of i2 ) {
	    dxy[ d ] = Math.max( this.moving.limits[ d ][ 0 ] , dxy[ d ] );
	    dxy[ d ] = Math.min( this.moving.limits[ d ][ 1 ] , dxy[ d ] );
	}
    }
    movePoint( ev , id , x , y ) {
	let target = ev.target ;
	event.preventDefault();
	// only do anything if we know where this point started
	if ( id in this.points ) {
	    let [ x0 , y0 , tile ] = this.points[ id ] ;
	    let dxy = [ x - x0 , y - y0 ] ;
	    this.moveDrag( dxy ) ;
	}
    }
    endPoint( ev , id , x , y ) {
	let target = ev.target ;
// 	console.log ( 'end' , x , y , pos , target?.obj?.pos ) ;
	// only do anything if we know where this point started
	if ( id in this.points ) {
	    let [ x0 , y0 , tile ] = this.points[ id ] ;
	    let dxy = [ x - x0 , y - y0 ] ;
	    this.moveDrag( dxy ) ;
	    delete this.points[ id ] ;
	    this.endDrag( dxy , tile.pos ) ;
	}
    }
}
