// Puzzle game - rotate rows or columns of the grid to unscramble the solution

// 2025 Sep ... going for some bash & crash development - will separate layers later

var srcPuzzles ;
// for home testing, this loads srcPuzzles from local file - save fetching from cloud every test run
document.write('<script type="text/javascript" src="js/rubikxwds5.js"></script>') ;

async function fetchPuzzles() {
    if ( ! srcPuzzles ) {
	console.log('srcPuzzles not already populated from local file!');
    //     let src = await fetch( "file://home/programming/ibendr.github.io/xwd/bendr/source/g-5x5-classic" );
	let src = await fetch( "https://ibendr.github.io/xwd/bendr/source/g-5x5-classic" );
	console.log( src );
	if ( src.ok ) {
	  src = await src.text() ;
	  srcPuzzles = src.split('\n\n') ;
    //       srcPuzzles = src.split('\n\n').map( s => s.split('\n').slice(0,5).map( l => l.slice(0,5) ) );
	}
    }
}

var elHosts ;
var elHost ;
var elOuterHost ;
var screenWidth ;
// var scale  = { px: 96 , deg: 360 } ;
var spx5 /*= 5 * scale[ 'px' ] */;
// var offset = { px: 2 , deg: 0 } ; 
var spx2 /*= ( scale[ 'px' ] >> 1 ) - ( offset[ 'px' ] ) */;
var it ;

// makeUnit = ( (x,u) => Math.floor( x * ( scale[ u ] ?? 1 ) + ( offset[ u ] ?? 0 ) ) + u ) ;
px =  ( x => Math.floor( x ) + 'px'  ) ;
deg = ( d => Math.floor( d ) + 'deg' ) ;
// makeDeg  = ( x => makeUnit( x , 'deg' ) ) ;

function updateEl( it ) {
    if ( it.pos && it.pos.length > 1 ) {
	let s = it.el.style ;
	pix1 = [ ] ;
	pix2 = [ ] ;
	let show2 = false ;
	let lower = 2 * linePx;
	let upper = 4 * scalePx + lower;
	for ( let d of i2 ) {
	    let p = ( spx5 + Math.floor( it.pos[ d ] * scalePx + linePx + it.drag[ d ] ) + spx2 ) % spx5 - spx2 ;
// 	    let p = ( spx5 + Math.floor( it.pos[ d ] * scale[ 'px' ] + offset[ 'px' ] + it.drag[ d ] ) + spx2 ) % spx5 - spx2 ;
	    pix1[ d ] = p ;
	    if      ( p < lower ) { pix2[ d ] = p + spx5 ; show2 = true ; }
	    else if ( p > upper ) { pix2[ d ] = p - spx5 ; show2 = true ; }
	    else		 pix2[ d ] = p ;
	}
	
// 	    if ( pix[ d ] 
// 	console.log( it.pos.map( makePx ) ) ;
// 	[ s.left , s.top ] = it.pos.map( makePx ) ;
 	[ s.left , s.top ] = pix1.map( px );
	s.transform = 'rotateX(' + deg( 360 * it.flips[ 1 ] ) + ') rotateY(' + deg( 360 * it.flips[ 0 ] ) + ')' ;
	if ( it.el2 ) {
	    s = it.el2.style ;
	    [ s.left , s.top ] = pix2.map( x => x + 'px' ) ;
	    s.display = show2 ? 'block' : 'none' ;
	}
    }
}
function celebrate( andThen ) {
    if ( elOuterHost ) {
	let s = elOuterHost.style ;
	s.transition = 'all 200ms linear' ;
	for (let t of i5) {
	    setTimeout( ( () => s.backgroundColor = "yellow" ) , t * 500 ) ;
	    setTimeout( ( () => s.backgroundColor = "#aa3333" ) , t * 500 + 250 ) ;
	}
	setTimeout( andThen , 2200 );
    }
}

function makeTileEl( lbl ) {
    let el = document.createElement('div') ;
    let st = el.style
    el.classList.add('tile') ;
    el.innerText = lbl ;
    st.width    = px( scalePx - linePx ) ;
    st.height   = px( scalePx - linePx ) ;
    st.fontSize = px( scalePx * 0.8 ) ;
    st.borderWidth = px( linePx ) ;
    elHost.appendChild( el ) ;
    return el ;
}
function makeTile( lbl, pos , pa ) {
    let elTile  = makeTileEl( lbl ) ;
    let elTile2 = makeTileEl( lbl ) ;
      // el - corresponding html element , pa - parent object (grid) , lbl: displayed content
      // pos - position in grid , drag - displacement (in px) currently dragged from position
      // flips - how many times flipped in each axis (used for animating wrap around)
      // el2 - duplicate element used for ghost appearances in wraparound
    let it = { el: elTile , pa: pa , lbl: lbl , pos: pos , drag: [ 0 , 0 ] , flips: [ 0 , 0 ] , el2: elTile2 } ;
    elTile.tile = it ;
    elTile2.tile = it ;
    elTile2.style.display = 'none' ;
    updateEl( it ) ;
    return it ;
}
function gridDestroy( grid ) {
    for ( tile of grid.tiles ) {
	tile.el.remove();
	tile.el2.remove();
    }
}
function makeGrid( sol , puz ) {
    let out = { el: elHost , sol: sol , state: puz ?? stateDupe( sol ) , tiles: [ ] } ;
    for ( let y of i5 ) {
	for ( let x of i5 ) {
	    let c = puz[ y ][ x ];
	    let blok = ( c == '=' ) ;
	    let tile = makeTile( blok ? '' : c , [ x , y ] , out ) ;
	    if ( blok ) tile.el.classList.add('blok') ;
	    if ( blok ) tile.el2.classList.add('blok') ;
	    out.tiles.push( tile )
	}
    }
    return out ;
}
function stateJumble( puz , n ) {
    // make n random moves - but no consecutive on same row
    let moves = [] ;
    let move = null ;
    let oldMove = [ 2 , 0 ] ;
    for (let i = 0 ; i<n ; i++) {
	let ok = false ;
	while ( ! ok ) {
	    move = [ rnd(2) , 2 * rnd(3) , ( 1 + rnd(4) ) ] ;
	    ok = ( move[ 0 ] != oldMove[ 0 ] ) || ( move[ 1 ] != oldMove[ 1 ] );
	}
	moves.push( move ) ;
	oldMove = move ;
	stateRotate( puz, ...move ) ;
    }
    return moves ;
}
function stateRotate( puz , d , i , n ) {
    // rotate puzzle's row/column i by n spots
//   console.log( puz, d,  i, n );
    let pos = [ 0 , 0 ] ;
    pos[ d ^ 1 ] = i ;
    let val = [] ;
    for (let j of i5) {
	pos[ d ] = j ;
	val.push( puz[ pos[ 1 ] ][ pos[ 0 ] ] ) ;
    }
//     console.log(val);
    for (let j of i5) {
	pos[ d ] = j ;
	let j1 = (5 + j - n) % 5 ;
// 	console.log( j , j1 , pos );
	puz[ pos[ 1 ] ][ pos[ 0 ] ] = val[ j1 ] ;
    }
//     console.log( puz );
}

function gridRotate( grid , d , i , n , inv ) {
    // do same rotation as above on grid visually
    //	set inv=true to do it "invisibly" (no flips, don't do update)
    for (let tile of grid.tiles) {
	let pos = tile.pos ;
	if ( pos[ d ^ 1 ] == i ) {
	    let j1  = pos[ d ] ;
	    let j = ( 5 + j1 + n ) % 5 ;
	    tile.pos[ d ] = j ;
	    if ( !inv ) {
		if ( j != j1 + n ) tile.flips[ d ] += (j1 + n - j) / 5 ;
		updateEl( tile ) ;
	    }
	}
    }
    stateRotate( grid.state , d , i , n ) ;
}

i2 = [ 0,1 ] ;
i5 = [ 0,1,2,3,4 ] ;
rnd       = (  n  => Math.floor( n * Math.random() ) ) ;
rndOf     = (  L  => L.length && L[ rnd( L.length ) ] ) ;
stateDupe = ( puz => i5.map( y => puz[ y ].slice() ) ) ;
stateDisp = ( puz => puz.map( row => row.join('') ).join('\n') ) ;
stateComp = ( (p1,p2) => { for ( let y of i5 ) for ( let x of i5 ) if ( p1[ y ][ x ] != p2[ y ][ x ] ) return false ; return true ; } ) ;
transposePuzzle = ( puz => i5.map( y => i5.map( x => puz[ 6*x + y ] ).join('') ).join('\n') ) ;
// transposePuzzle = ( puz => i5.map( i => i5.map( j => puz[ j ][ i ] ).join('') ) ) ;
expandPuzzle    = ( puz => i5.map( y => i5.map( x => puz[ 6*y + x ] ) ) ) ;
rndPuzzle       = ( ( ) => expandPuzzle( rnd( 2 ) ? transposePuzzle( rndOf( srcPuzzles ) ) : rndOf( srcPuzzles ) ) ) ;



    // Event handling
    // mouse or touch similar on grid ... we'll call either 'point'
    // (which could be any pointing mechanism, including trackpad, graphics tablet)
    //		start	-> ready to move either row or column (as eligible) of tile
    //		moving	-> if 'turning' ... update model to junction, switch row/col (when we get fancy)
    //		end	-> finalise rotation in model

var points = { } ;
var moving = { tiles: [ ] , dir: null , which: null , dmin: 0 , dmax: 0 } ;

tileCanMove = ( ( tile , dir ) => ( tile.pos[ dir ^ 1 ] & 1 ) == 0 ) ;

function cancelMovers() {
    // take all tiles of moving.tiles list, resetting drag
    for (let tile of moving.tiles) {
	tile.drag = [ 0 , 0 ] ;
	updateEl( tile );
	tile.el.classList.remove( 'moving' ) ;
	tile.el2.classList.remove( 'moving' ) ;
    }
    moving.tiles = [ ] ;
}
function gridStartRotate( grid , d , i , j ) {
    // setup motion of tiles for rotation direction d row/col i
    // j is the index of the 'grabbed' tile in that row for purpose of setting distance limits
    moving.dir   = d ;
    moving.which = i ;
    cancelMovers() ;
    for ( let tile of grid.tiles ) {
	if ( tile.pos[ d ^ 1 ] == i ) {
	    moving.tiles.push( tile ) ;
	    tile.el.classList.add( 'moving' ) ;
	    tile.el2.classList.add( 'moving' ) ;
	}
    moving.dmin = (   - j ) * scalePx - linePx ;
    moving.dmax = ( 4 - j ) * scalePx + linePx ;
    }
}

function startPoint( ev , id , x , y ) {
    // at this stage we are not supporting multi-touch (which makes the points array seem a bit silly)
    if ( points.length ) return ;
    let target  = ev.target;
    points[ id ] = [ x , y , target ] ;
    let tile    = target && target.tile;
    if (tile) {
	let grid = tile.pa ;
	if (grid) {
	    event.preventDefault();
// 	    console.log( tile ) ;
	    let nMovesFree = tileCanMove( tile , 0 ) + tileCanMove( tile , 1 ) ;
	    if ( nMovesFree == 0 ) {
		// not a movable tile - forget about it!
		delete points[ id ] ;
	    }
	    else if ( nMovesFree == 1 ) {
		// can only move one direction so we can already lock it in
		let d  = tileCanMove( tile , 1 ) ? 1 : 0 ;
	        gridStartRotate( grid , d , tile.pos[ d ^ 1 ] , tile.pos[ d ] ) ;
	    }
	    else if ( nMovesFree == 2 ) {
		// both directions available - we won't pick a direction until some movement has occurred
		moving.dir    = null ;
		moving.which   = null ;
		moving.tiles = [ tile ] ;
		tile.el.classList.add( 'moving' ) ;
	    }
	}
    }
}
	
function movePoint( ev , id , x , y ) {
    // only do anything if we know where this point started
    if ( id in points ) {
	event.preventDefault();
	let point = points[ id ] ;
	let dxy = [ x - point[ 0 ] , y - point[ 1 ] ]
	if ( moving.dir == null ) {
	    // haven't picked direction yet...
	    let tile = point[ 2 ].tile ;
	    let absDx = Math.abs( dxy[ 0 ] ) ;
	    let absDy = Math.abs( dxy[ 1 ] ) ;
	    if ( absDx < 8 && absDy < 8 ) {
		// haven't moved far enough yet ... draw movement in both directions
		tile.drag[ 0 ] = dxy[ 0 ] ;
		tile.drag[ 1 ] = dxy[ 1 ] ;
		updateEl( tile ) ;
	    }
	    else {
		// set the direction, then ensuing code activated
		let d = absDx > absDy ? 0 : 1 ;
		gridStartRotate( tile.pa , d , tile.pos[ d ^ 1 ] , tile.pos[ d ] ) ;
	    }
	}	
	if ( moving.dir != null ) {
	    let dis = dxy[ moving.dir ] ;
	    if ( dis < moving.dmin ) dis = moving.dmin ;
	    if ( dis > moving.dmax ) dis = moving.dmax ;
	    for (let tile of moving.tiles) {
		tile.drag[ moving.dir ] = dis ;
		updateEl( tile );
	    }
	}
    }
}
function endPoint( ev , id , x , y ) {
    var target = ev.target;
    // only do anything if we know where this point started
    if ( id in points ) {
	let point = points[ id ] ;
	let grid = point[ 2 ].tile.pa ;
	if ( moving.tiles.length && ( moving.dir != null ) ) {
	    // tiles have been moved - we see how far and convert to an actual rotation in the model
	    let dis = [ x - point[ 0 ] , y - point[ 1 ] ][ moving.dir ] ;
	    if ( dis < moving.dmin ) dis = moving.dmin ;
	    if ( dis > moving.dmax ) dis = moving.dmax ;
	    dis = Math.floor( ( dis / scalePx ) + 0.5 ) ;
	    if ( dis ) {
		// does the rotation invisibly (user has already seen the motion)
		gridRotate( grid , moving.dir, moving.which , dis , true ) ;
		// this does the tile updates not done in gridRotate
		// check for success
		if ( stateComp( grid.state , grid.sol ) ) {
		    console.log( "VICTORY!" ) ;
		    celebrate( doNewGame );
		}
	    }
	    cancelMovers( ) ;
	}
    }
}
function doNewGame( ) {
    // throw away any html tiles in previous game
    if ( it ) gridDestroy(it);
    // look up new puzzle
    let sol = rndPuzzle( );
    let puz = stateDupe( sol )
    let moves = stateJumble( puz , 2 );
    // for testing...    and cheating!
    console.log( stateDisp( sol ) , stateDisp( puz ) , moves );
    it = makeGrid( sol , puz );    
}

function initListeners( ) {
//     var self = this ;
//     window.addEventListener("resize", function () {
// 	adjustLayout() ;
//     } ) ;
    points = { } ;	// list of active 'points' i.e. mouse drags / touches
    
    elHost.addEventListener( "mousedown",  ev => startPoint( ev , "mouse" , event.pageX , event.pageY ) ) ;
    elHost.addEventListener( "mousemove",  ev =>  movePoint( ev , "mouse" , event.pageX , event.pageY ) ) ;
    elHost.addEventListener( "mouseup",    ev =>   endPoint( ev , "mouse" , event.pageX , event.pageY ) ) ;
    elHost.addEventListener( "mouseleave", ev =>   endPoint( ev , "mouse" , event.pageX , event.pageY ) ) ;

    elHost.addEventListener( "touchstart", ev => { for (let touch of event.changedTouches) {
						 startPoint( ev, touch.identifier , touch.pageX , touch.pageY ) ; }    });
    elHost.addEventListener( "touchmove" , ev => { for (let touch of event.changedTouches) {
						  movePoint( ev, touch.identifier , touch.pageX , touch.pageY ) ; }    });
    elHost.addEventListener( "touchend"  , ev => { for (let touch of event.changedTouches) {
						   endPoint( ev, touch.identifier , touch.pageX , touch.pageY ) ; }    });

}
    
var scalePx ;
var screenWidth ;
var linePx ;

async function go() {
    await fetchPuzzles() ;
    elHosts = document.getElementsByClassName('host');
    elHost = elHosts.length ? elHosts[ 0 ] : document.body ;
    let elOuterHosts = document.getElementsByClassName('outerHost');
    elOuterHost = ( elOuterHosts.length && elOuterHosts[ 0 ] ) || null ;
    // scaling - we aim to fill the screen on a mobile in portrait orientation
    screenWidth = parseInt( getComputedStyle( elOuterHost ).width ) - 9 ;
    // but in case we're in portrait, make everything fit
    let height = window.visualViewport.height ;
    if ( screenWidth > height * 5 / 8 ) screenWidth = Math.floor( height * 5 / 8 )
      // scale is 3/16 of screen, so we get 5 1/3 grid squares to work with
    scalePx = ( screenWidth >> 2 ) - ( screenWidth >> 4 );
    linePx = screenWidth >> 7 ;
    elOuterHost.style.width  = Math.floor( ( 5.18 * scalePx ) ) + 'px'  ;
    elOuterHost.style.height = Math.floor( ( 8.25 * scalePx ) ) + 'px'  ;
    spx5 = 5 * scalePx ;
    spx2 = scalePx >> 1 ;
    elHost.style.width  = ( spx5 + 2 * linePx ) + 'px' ;
    elHost.style.height = ( spx5 + 2 * linePx ) + 'px'  ;
    initListeners() ;
    doNewGame();
}

window.addEventListener("load",go) ;
