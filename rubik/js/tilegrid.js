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
	this.el.innerText = ( this.lbl = lbl );
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
class dragTile extends Tile {
    constructor( ...args ) {
	super( ...args ) ;
	this.drag = [ 0 , 0 ] ; //null ; // [ dx , dy ] when element being dragged from position implied by pos
	this.dragOK = 0 ; // 0 = can't drag (default)
			  // 1 = drag X
			  // 2 = drag Y				// 3 = drag X or Y ( but not diagonal )
			  // 4 = 45 degree diagonals 		// 7 = 8-directions
			  // 8 = knight move angles ( ?! ) , 16, 32 ???
			  // 64 = catchall final category 		// 127 =  MOVE ANYWHERE
	this.dragLims = [ [ 0 , 0 ] , [ 0 , 0 ] ] ; 	// max distance tile can move in px
    }	
    update( ) {
	// use parent objects posToPx method to get pixel position, then add drag
	if ( this.pa && this.pa.posToPx ) {
	    this.setPosSize( this.pa.posToPx( this.pos ).map( ( p,i ) => p + this.drag[ i ] ) ) ;
	}
    }
}

// grid to host tiles
class TileGrid extends elem {
	tiles ; 		// objects for the slideable pieces
	tileAt ; 		// actually a state with tiles as entries, so we can do same moves
// 	moving ;		// { tiles: list of moving tiles , dir: axis , which: row/col }
    constructor ( pa , siz , scal , styl ) {
	// pa is parent element to attach to
	// siz is size [ width , height ] in TILES
	// scal is scaling info [ scale-X , scale-Y , bufferPx , linePx ] px per tile placement , gap between tiles , line width ( optional )
	// make the host element
	if ( scal ) {
	    // check if number ... expand
	    if ( typeof scal == "number" ) scal = [ scal , scal , scal >> 5 , scal >> 7 ] ;
	}
	else {
	    // no scale specified - work back from parent element
	}
	
	adjustScale( ) ;
// 	let siz = ( spx5 + 2.5 * linePx ) + 'px' ;
	console.log(this);
	if ( ! sizPx ) {
	    sizPx = [ parseInt( pa?.el?.style?.width ) , parseInt( pa?.el?.style?.height ) ] ;
	}
	super( 'div' , pa , [ 'tile-grid' ] , { width: sizPx[ 0 ] , height: sizPx[ 1 ] } ) ;
	// make tiles
	this.tiles = [ ] ;
	this.tileAt = new rubwState( ) ;
	for ( let cell of stdCells ) {
	    let tile = new rubwTile( this.el , this.at( cell ) , cell.slice( ) )
	    this.tiles.push( tile ) ;
	    this.tileAt[ cell[ 1 ] ][ cell[ 0 ] ] = tile ;
	}
	this.moving = { tiles: [ ] , dir: 0 , which: 0 , dmin: 0 , dmax: 0 } ;
	this.update() ;
	initPointerListeners( this.el ) ;
    }
    destructor( ) {	// ALERT - Element.remove() does not destroy! TODO - all this is general could go to elem in dom
	for ( let tile of this.tiles ) {
	    tile.el.remove() ;
	    tile.els[1].remove() ;
	}
	this.tiles.splice( 0 );
	for ( let el of this.els ) el.remove() ;
	( super.destructor ?? ( ()=>{} ) ) ( ) ;
	delete this.el ;
	this.els.splice( 0 );
    }
//     tileAt( pos , all ) {
// 	// return first tile found at pos ( or null ), unless all=true , then return [ all tiles at pos ] (of course there should be exactly one!)
// 	if ( all ) return this.tiles.filter( tile => ( tile.pos[ 0 ] == pos[ 0 ] && tile.pos[ 1 ] == pos[ 1 ] ) ) ;
// 	for ( let tile of this.tiles ) if ( tile.pos[ 0 ] == pos[ 0 ] && tile.pos[ 1 ] == pos[ 1 ] ) return tile ;
//     }
    update( ) {
	// after a move, tileAt state will tell us where tiles should be
	// check for real words
	for ( let cell of stdCells ) {
	    let tile = this.tileAt.at( cell ) ;
// 	    console.log( cell , tile )
	    tile.pos = cell.slice( ) ;
	    tile.inRealWord = false ;
	    tile.el.classList.remove( 'inRealWord' );
	}
	for ( let spot of stdSpots ) {
	    if ( isWord( this.wordAt( spot ) ) ) {
		for ( let pos of spot ) {
		    let tile = this.tileAt.at( pos ) ;
			if (tile) {
			    tile.inRealWord = true ;
			    tile.el.classList.add( 'inRealWord' );
			}
			else throw "No tile at " + pos + " !!" ;
		}
	    }
	}
	for ( let tile of this.tiles ) {
	    tile.update( ) ;
	}
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
    startRotate( d , i , j , ds ) {
	// start moving tiles in row/column i, 
	// while holding tile #j of that line with pointer (relevant as it can't go beyond the edge of box)
	// ds is distances available to move on this line. (in form -2,-1,1,2 ... so need to also allow -4,-3,3,4 as appropriate)
	this.moving.dir   = d ;
	this.moving.which = i ;
	this.moving.grab  = j ;
	this.moving.movs  = ds ;
	this.cancelMovers() ;
	for ( let tile of this.tiles ) {
	    if ( tile.pos[ d ^ 1 ] == i ) {
		this.moving.tiles.push( tile ) ;
		tile.el.classList.add( 'moving' ) ;
		tile.els[ 1 ].classList.add( 'moving' ) ;
	    }
	}
	this.moving.dmin = (   - j ) * scalePx - linePx ;
	this.moving.dmax = ( 4 - j ) * scalePx + linePx ;
    }
    move( mov , inv ) {
	super.move( mov ) ;	  // move the underlying model
	this.tileAt.move( mov );  // move the tiles the same way
	this.update() 	// this will record the correct new positions for the tiles
    }
    undo( ) {
	// make sure undo also applied to tileAt
	if ( this.postMoves.length ) {
	    let mov = this.postMoves.pop( ) ;
	    mov.undo( this ) ;
	    mov.undo( this.tileAt ) ;
	    this.update( ) ;
	}
    }
    // Pointer handlers
    // TODO tileCanMove depends on movesAllowed, will need other actions for flips
    startPoint( ev , id , x , y ) {
	let target = ev.target ;
// 	console.log ( target ) ;
	if ( this.points.length ) return ;
	this.points[ id ] = [ x , y , target ] ;
	let tile    = target && target.obj;
	if (tile) {
	    event.preventDefault();
	    // see what rotations are availabe on lines through this tile
	    let pos = tile.pos ;
	    let movesFree = [ [ ] , [ ] ] ; // distances we can go in either direction
	    for ( let mov of this.movesAllowed )
		if ( mov instanceof rubwMovRotate )
		    if ( mov[ 1 ] == pos[ mov[ 0 ] ^ 1 ] )
			movesFree[ mov[ 0 ] ].push( mov ) ;
	    let nMovesFree = ( movesFree[ 0 ].length > 0 ) + ( movesFree[ 1 ].length > 0 )
	    if ( nMovesFree == 0 ) {
		// not a movable tile - forget about it!
		delete points[ id ] ;
	    }
	    else if ( nMovesFree == 1 ) {
		// can only move one direction so we can already lock it in
		let d  = ( movesFree[ 1 ].length > 0 ) ? 1 : 0 ;
	        this.startRotate( d , tile.pos[ d ^ 1 ] , tile.pos[ d ] , movesFree[ d ] ) ;
	    }
	    else if ( nMovesFree == 2 ) {
		// both directions available - we won't pick a direction until some movement has occurred
		this.moving.dir    = null ;
		this.moving.which   = null ;
		this.moving.tiles = [ tile ] ;
		this.moving.movs = movesFree ;
		tile.el.classList.add( 'moving' ) ;
	    }
	}
    }
    movePoint( ev , id , x , y ) {
	// only do anything if we know where this point started
	if ( id in this.points ) {
	    event.preventDefault();
	    let point = this.points[ id ] ;
	    let dxy = [ x - point[ 0 ] , y - point[ 1 ] ]
	    if ( this.moving.dir == null ) {
		// haven't picked direction yet...
		let tile = point[ 2 ].obj ;
		let absDx = Math.abs( dxy[ 0 ] ) ;
		let absDy = Math.abs( dxy[ 1 ] ) ;
		if ( absDx < lpx2 && absDy < lpx2 ) {
		    // haven't moved far enough yet ... draw movement in both directions
		    tile.drag[ 0 ] = dxy[ 0 ] ;
		    tile.drag[ 1 ] = dxy[ 1 ] ;
		    tile.update( ) ;
		}
		else {
		    // set the direction, then ensuing code activated
		    let d = absDx > absDy ? 0 : 1 ;
		    this.startRotate( d , tile.pos[ d ^ 1 ] , tile.pos[ d ] , this.moving.movs[ d ] ) ;
		}
	    }	
	    if ( this.moving.dir != null ) {
		let dis = dxy[ this.moving.dir ] ;
		if ( dis < this.moving.dmin ) dis = this.moving.dmin ;
		if ( dis > this.moving.dmax ) dis = this.moving.dmax ;
		for (let tile of this.moving.tiles) {
		    tile.drag[ this.moving.dir ] = dis ;
		    tile.update( );
		}
	    }
	}
    }
    endPoint( ev , id , x , y ) {
	// only do anything if we know where this point started
	if ( id in this.points ) {
	    let point = this.points[ id ] ;
	    // whatever else happens, the pointer move is over!
	    delete this.points[ id ] ;
	    let moving = this.moving ;
	    if ( moving.tiles.length && ( moving.dir != null ) ) {
		// tiles have been moved - we see how far and convert to an actual rotation in the model
		let dis = [ x - point[ 0 ] , y - point[ 1 ] ][ moving.dir ] ;
		// cap at ends
		if ( dis < moving.dmin ) dis = moving.dmin ;
		if ( dis > moving.dmax ) dis = moving.dmax ;
		// scale to grid squares
		dis = ( dis / scalePx ) ;
		// now that we allow different sets of allowed moves, check all available for closest match
		// distance mod 5
		const dm5 = ( (a,b) => Math.min ( ( 10 + a - b ) % 5 , ( 10 + b - a ) % 5 ) ) ;
		let closest = Math.abs( dis ) ; // so we don't move at all if that's the closest
		let closeMov = null ;
// 		clog( moving )
		for ( let mov of moving.movs ) {
		    let disd = dm5( dis, mov.n ) ;
		    if ( disd < closest ) {
			closest = disd ;
			closeMov = mov ;
		    }
		}
// 		clog( closeMov, closeMov && closeMov.n ) ;
		if ( closeMov ) {
		    this.move( closeMov , true ) ;
		    // this does the tile updates not done in gridRotate
		    // check for success
		    this.update( ) ;
		    if ( this.isSolved( ) ) {
			let tide = this.timeLeft + 0.2 ;
			console.log( "VICTORY! " + tide ) ;
			if ( tide > 1 ) {
			    console.log( "TOTAL VICTORY!" ) ;
// 			    tide = 0.25 ;
			}
// 			celebrate( () => doNewGame( 1 + rnd(2) + rnd(2) , tide ) ); // level: 25% 1 , 50% 2, 25% 3	// TODO
		    }
		}
	    }
	    this.cancelMovers( ) ;
	}
    }
}
// // TODO - big change of direction ... don't make the html view an extension of underlying object.
// // Make views extend views, no inheritance back and forth between game and html layer.
// 
// // class to interact with a level
// class rubwLevelHtml extends rubwLevel {
//     constructor ( pa, ...args ) {
// 	// pa is parent element to attach to
// 	// make the abstract
// 	super( ...args ) ;
// 	// check scale, make elements
// 	adjustScale( ) ;
// 	let w = ( 5 * scalePx + 10 * linePx ) + 'px' ;
// 	let h = ( 8 * scalePx                 ) + 'px' ;
// 	this.makeEls( 'div' , pa , [ 'host' , 'outer' ] , { width: w , height: h } , 1 ) ;
// 	this.els[ 1 ].classList.add( 'timer' ) ;
// 	// make the puzzle area... and position it nicely :)
// 	this.puzzleHost = new rubwPuzzleHtml( this.el , this.puzzle ) ;
// 	this.puzzleHost.setPosSize( [ 3 * linePx , 3 * linePx ] );
// 	// make the console ... ditto
// 	this.console = new rubwConsole( this.el , this )
// 	this.console.setPosSize( [ 3 * linePx , 5 * scalePx + 9 * linePx ] , [ ( 5 * scalePx + 2.5 * linePx ) + 'px' , ( 2.5 * scalePx ) + 'px' ] )
// 	this.update()
//     }
//     destructor ( ) {
//     }
//     undo( ) {
// 	// makes sure tiles are also moved
// 	this.puzzleHost.undo( ) ;
//     }
//     update( ) {
// 	this.puzzleHost.update( ) ;
//       	// do the tide
// 	// right now show current state
// 	let st = this.els[ 1 ].style ;
// 	st.transition = '';
// 	st.height = Math.floor( ( 1 - this.timeLeft ) * parseInt(this.el.style.height) ) + 'px' ;
// 	// then set the tide coming in...
// 	console.log( st.height + ' ... ' + Math.max( 2 , this.timeDue - now() ) + 'ms linear' ) ;
// 	setTimeout( () => { st.transition = 'height ' + Math.max( 2 , this.timeDue - now() ) + 'ms linear' ; } , 0 ) ;
// //   	    elTide.style.width  = elOuterHost.style.width ;
// 	setTimeout( () => st.height = this.el.style.height , 0 ) ; // for some reason doing it directly got in before transition change took effect (!?)
// 	if ( this.timeOutId ) clearTimeout( this.timeOutId ) ;
// 	this.timeOutId = setTimeout( () => this.timeUp( ) , Math.max( 2 , this.timeDue - now() ) ) ;
//     }
//     timeUp ( ) {
// 	console.log( "TIME UP")
// 	
//     }
// }
// 
// class rubwGameHtml extends rubwGame {
//      constructor ( ) {
// 	  super( ) ;
//      }
// }
// 
// class rubwConsole extends elem {
//     constructor ( pa , lev ) {
// 	// pa is parent element to attach to
// 	// lev is the rubwLevelHtml to interact with
// 	super( 'div' , pa , [ 'host' , 'console' ] ) ;
// 	// make buttons
// 	const buts = [ 'undo' , 'skip' ] ;
// 	const acts = [ () => lev.undo( ) , () => lev.skip() ] ;
// 	this.buttons = i2.map( i => new elButton( this.el , buts[ i ] , ( () => acts[ i ]() ) , [ ( 0.1 + i * 2.8 ) * scalePx , 1.32 * scalePx ] , [ 2 * scalePx , scalePx ] , 0 , { borderWidth: linePx + 'px' } ) ) ;
//     }
// }
// 
// // How we achieve some of the effect of multiple inheritance
// for ( let prop of [ 'elss' , 'makeEls' , 'setStyle' , 'setPosSize' ] )
//     for ( let cls of [ rubwPuzzleHtml , rubwLevelHtml ] )
// 	cls.prototype[ prop ] = elem.prototype[ prop ];
// 
// // in transition
// 
// tileCanMove = ( () => true ) ;
// // tileCanMove = ( ( tile , dir ) => ( tile.pos[ dir ^ 1 ] & 1 ) == 0 ) ;
// 
// function tideIn( it ) {
//     console.log( "Tide is in!" ) ;
// }
// var scalePx ;
// var screenWidth ;
// var linePx ;
// var spx5 ;
// var spx2 ;
// var lpx2 ;
// function adjustScale() {
//     // adjust scaling - we aim to fill the screen on a mobile in portrait orientation
//     screenWidth = parseInt( getComputedStyle( document.body ).width ) - 9 ;
//     // ... but in case we're in portrait, make everything fit
//     let height = window.visualViewport.height ;
//     if ( screenWidth > height * 5 / 8 ) screenWidth = Math.floor( height * 5 / 8 )
//       // scale is 25/128 of screen, so we get 5.12 grid squares to work with
//     scalePx = ( 25 * screenWidth ) >> 7 ; //  ( screenWidth >> 2 ) - ( screenWidth >> 4 ) + ( screenWidth >> 7 );
//     linePx = screenWidth >> 7 ;
//     spx5 = 5 * scalePx ;
//     spx2 = scalePx >> 1 ;
//     lpx2 = linePx << 1 ;
// }
// // OLD { } VERSION ====================== V V V
// 
// 
// // makeUnit = ( (x,u) => Math.floor( x * ( scale[ u ] ?? 1 ) + ( offset[ u ] ?? 0 ) ) + u ) ;
// px =  ( x => Math.floor( x ) + 'px'  ) ;
// deg = ( d => Math.floor( d ) + 'deg' ) ;
// 
// /*
// function gridDestroy( grid ) {
//     for ( let tile of grid.tiles )
// 	for ( let el of tile.els ) 
// 	    el.remove();
//}



// // 	const lower = 0.5 * pa.linePx ;
// // 	const upper = 4 * pa.scalePx + 1.5 * pa.linePx ;	// TODO 
// 	let p   = this.pos.slice( ) ;
// 	let px  = p.map( x => Math.floor( x * pa.scalePx + pa.linePx ) ) ;
// // 	let px2 = px.slice() // ghost position if needed
// 	let show2 = false ;
// // 	// only any chance we'll need ghost if being dragged	TODO WRAPAROUND ... here or only in subclasses?
// // 	if ( this.drag ) {
// // 	    for ( let d of i2 ) {
// // 		let px1 = ( spx5 + px[ d ] + this.drag[ d ] + spx2 ) % spx5 - spx2 ;
// // 		px[ d ] = px1 ;
// // 		if      ( px1 < lower ) { px2[ d ] = px1 + spx5 ; show2 = true ; }
// // 		else if ( px1 > upper ) { px2[ d ] = px1 - spx5 ; show2 = true ; }
// // 		else 			{ px2[ d ] = px1 ; }
// // 	    }
// // 	}
// 	this.setPosSize( px  , null , [ 0 ] );
// // 	this.setPosSize( px2 , null , [ 1 ] , { display: show2 ? 'block' : 'none' } ) ;
//     }
// }
