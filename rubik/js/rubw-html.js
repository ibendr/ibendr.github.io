// RubikWords ... html layer

// 2025 Sep 17  broken into multiple files... 

// NEW CLASS BASED VERSION ====================== V V V

class rubwTile extends elem {
	pos ; drag ;
    constructor( pa , lbl , pos ) {
	let styl = {
	    width:       px( scalePx - linePx ) , 
	    height:      px( scalePx - linePx ) ,
	    fontSize:    px( scalePx * 0.8 ) ,
	    borderWidth: px( linePx )
	} ;
	super( 'div' , pa , 'tile' , styl , 1 ) ;
	this.el.innerText = lbl ;
	this.pos = pos ?? [ 0 , 0 ] ;  // x , y
	this.drag = null ; // [ dx , dy ] when element being dragged from position implied by pos
	this.update( ) ;
    }
    update( ) {
	const lower = 2 * linePx;
	const upper = 4 * scalePx + lower;
	let p   = this.pos.slice( ) ;
	let px  = p.map( x => Math.floor( x * scalePx + linePx ) ) ;
	let px2 = px.slice() // ghost position if needed
	let show2 = false ;
	// only any chance we'll need ghost if being dragged
	if ( this.drag ) {
	    for ( let d of i2 ) {
		let px1 = ( spx5 + px[ d ] + this.drag[ d ] + spx2 ) % spx5 - spx2 ;
		px[ d ] = px1 ;
		if      ( px1 < lower ) { px2[ d ] = px1 + spx5 ; show2 = true ; }
		else if ( px1 > upper ) { px2[ d ] = px1 - spx5 ; show2 = true ; }
		else 			{ px2[ d ] = px1 ; }
	    }
	}	      
	this.setStyle( {
	    left:	px[ 0 ] + 'px' ,
	    top:	px[ 1 ] + 'px' ,
	} , [ this.el ] ) ;
	this.setStyle( {
	    left:	px2[ 0 ] + 'px' ,
	    top:	px2[ 1 ] + 'px' ,
	    display:	show2 ? 'block' : 'none'
	}, [ this.els[ 1 ] ] ) ;
    }
}

class rubwDeviceHtml extends rubwDevice {
    constructor ( pa, ...args ) {
	super( ...args ) ;
	this.el = document.createElement( 'div' );
    }
  
}

// How we achieve some of the effect of multiple inheritance
rubwDeviceHtml.prototype.setStyle = elem.prototype.setStyle ;
rubwDeviceHtml.prototype.makeEls  = elem.prototype.constructor ;

// OLD { } VERSION ====================== V V V

function makeGrid( sol , puz , tim ) {
    let out = { el: elHost , sol: sol , state: puz ?? stateDupe( sol ) , tiles: [ ] , level: 1 , tide: 75 , tideDue: now() + tim  } ;
    out.elTide = makeEl( 'div' , elOuterHost , 'tide' ) ;
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
    updateEl( out ) ;
    return out ;
}

function makeTileEl( lbl ) {
    let el = makeEl( 'div' , elHost , 'tile' ) ;
    let st = el.style
    el.innerText = lbl ;
    st.width    = px( scalePx - linePx ) ;
    st.height   = px( scalePx - linePx ) ;
    st.fontSize = px( scalePx * 0.8 ) ;
    st.borderWidth = px( linePx ) ;
    return el ;
}
var elHosts ;
var elHost ;
var elTide ;
var elOuterHost ;
var screenWidth ;
var tideTimer ;
// var scale  = { px: 96 , deg: 360 } ;
var spx5 /*= 5 * scale[ 'px' ] */;
// var offset = { px: 2 , deg: 0 } ; 
var spx2 /*= ( scale[ 'px' ] >> 1 ) - ( offset[ 'px' ] ) */;
var itt ;

// makeUnit = ( (x,u) => Math.floor( x * ( scale[ u ] ?? 1 ) + ( offset[ u ] ?? 0 ) ) + u ) ;
px =  ( x => Math.floor( x ) + 'px'  ) ;
deg = ( d => Math.floor( d ) + 'deg' ) ;
// makeDeg  = ( x => makeUnit( x , 'deg' ) ) ;

function tideIn( ) { console.log( "Tide is in!" )}
function updateEl( it ) {
    it = it ?? itt ;
    // flag which words are real
    if ( it.tiles ) {
	for ( let tile of it.tiles ) {
	    tile.inRealWord = false ;
	    tile.el.classList.remove( 'inRealWord' );
	}
	for ( let spot of stdSpots ) {
	    if ( w5.indexOf( wordAt( it.state , spot ) ) != -1 ) {
		for ( let pos of spot ) {
		    tile = tileByPos( it , pos ) ;
			if (tile) {
			    tile.inRealWord = true ;
			    tile.el.classList.add( 'inRealWord' );
			}
			else throw "No tile at " + pos + " !!" ;
		}
	    }
	}
	for ( let tile of it.tiles ) {
	    updateEl( tile ) ;
	}
	// do the tide
	if ( it.elTide && it.tide && it.tideDue ) {
	    // right now show current state
	    it.elTide.style.transition = '';
	    it.elTide.style.height = it.tide + '%';
	    // then set the tide coming in...
	    console.log( 'height ' + Math.max( 2 , it.tideDue - now() ) + 'ms linear' ) ;
 	    it.elTide.style.transition = 'all ' + Math.max( 2 , it.tideDue - now() ) + 'ms linear' ;
//   	    elTide.style.width  = elOuterHost.style.width ;
  	    setTimeout( () => it.elTide.style.height = '100%' , 0 ) ; // for some reason doing it directly got in before transition change took effect (!?)
  	    if ( tideTimer ) clearTimeout( tideTimer ) ;
  	    tideTimer = setTimeout( tideIn , Math.max( 2 , it.tideDue - now() ) ) ;
	}   
    }
    else if ( it.pos && it.pos.length > 1 ) {
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
 	[ s.left , s.top ] = pix1.map( px );
	s.transform = 'rotateX(' + it.flips[ 1 ] + 'turn) rotateY(' + it.flips[ 0 ] + 'turn)' ;
	s.backgroundColor = '' ;
	if ( it.el2 ) {
	    s = it.el2.style ;
	    [ s.left , s.top ] = pix2.map( x => x + 'px' ) ;
	    s.display = show2 ? 'block' : 'none' ;
	}
    }
}
// Some effects as possibilities for end of level etc.
// any timing based effect will take an "andThen" argument
//	NOTE: ( shouldn't we just learn to use Promises and Thenables? )

// chain of tasks which accept andThen arguments - head and tail affair
// note that this returns  - not executes - the combined function
doPair = ( a , b ) => ( aT => a( () => b( aT ) ) ) ;
doChain = ( a , b, ...c ) => doPair( a , c.length ? doChain( b, ...c ): b ) ;

// blow it up - uses ticks, doBlow and tick, ticakAndThen
const rndColor = ( () => '#' + [0,1,2,3,4,5].map(()=>'0123456789abcdef'[rnd(16)]).join('') ) ;
var ticks = 0 ;
var tickAndThen = ( ()=>{} ) ;
doBlow = ( andThen => { ticks = 0 ; tickAndThen = andThen ;
  for (let tile of itt.tiles) {   updateEl(tile) ; tile.posPx = null ; tile.velPx = null ; } ;
  tick() } )
tick = ( t => {
    t = t || 50 ;
//     let vs = t + 'V: ' ;
//     let ps = t + 'P: ' ;
    for (let tile of itt.tiles) {
        let st = tile.el.style ;
        let p = tile.posPx ?? [ st.left , st.top , '0' , '100'].map( s => parseInt(s) ) ;
        let v = tile.velPx ?? [ rnd(64)-16-tile.pos[0]*8,rnd(24)-64,rnd(240)-120,rnd(12)-4] ;
	let axis = rnd(4) + ', ' + rnd(4) + ', ' + (2+rnd(4)) + ', ' ;
        st.transition = 'all ' + t + 'ms linear, background-color 240ms ease-in-out' ;
	st.zIndex = 6 + v[3] ;
        st.left = ( p[ 0 ] = p[ 0 ] + v[ 0 ] ) + 'px' ;
        st.top  = ( p[ 1 ] = p[ 1 ] + v[ 1 ] ) + 'px' ;
//         st.transform = 'rotate(' + ( p[ 2 ] = p[ 2 ] + v[ 2 ] ) + 'deg)' ;
	p[ 3 ] = p[ 3 ] + v[ 3 ] ;
        st.transform = 'rotate3d(' + axis + ( p[ 2 ] = p[ 2 ] + v[ 2 ] ) + 'deg) scale(' + (p[3]/100) + ')' ;
	st.backgroundColor = rndColor( ) ;
        v[ 1 ] += 6;
//         vs += v.join('.') + ',';
//         ps += p.join('.') + ',';
        tile.posPx = p ;
        tile.velPx = v ;
    }
    // console.log( ps ) ;
    if ( ticks < 25 ) {
        ticks ++ ;
        setTimeout( tick , t ) ;
    }
	else tickAndThen( ) ;
} ) ;

// blinky colour on outer host
function doBlinky( andThen ) {
    let el = itt.elTide || elOuterHost ;
    if ( el ) {
	let s = el.style ;
	s.transition = 'all 200ms linear' ;
	for (let t = 0; t < 6 ; t++ ) {
	    setTimeout( () => { console.log(t)
		  s.backgroundColor = [ "#aa3333" , "yellow" ][ t & 1 ] ;
		  if (!t) andThen( );
			      } , ( 48 - ( t + 4 ) * t ) * 20 ) ;
	}
// 	for (let t of i5) {
// 	    setTimeout( ( () => s.backgroundColor = "yellow" ) , t * 500 ) ;
// 	    setTimeout( ( () => s.backgroundColor = "#aa3333" ) , t * 500 + 250 ) ;
// 	}
    }
}

// doBlinkyBlow = ( aT => doBlinky( () => doBlow ( aT ) ) ) ;
doBlinkyBlow = doPair( doBlinky , doBlow ) ;
const celebrate = doBlinkyBlow ;


function gridDestroy( grid ) {
    for ( tile of grid.tiles ) {
	tile.el.remove();
	tile.el2.remove();
    }
    grid.elTide.remove();
}


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
//     console.log( ev )
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
		    let tide = grid.tide - 20 ;
		    if ( tide < 0 ) {
			console.log( "TOTAL VICTORY!" ) ;
			tide = 75 ;
		    }
		    celebrate( () => doNewGame( 1 + rnd(2) + rnd(2) , tide ) ); // level: 25% 1 , 50% 2, 25% 3
		}
	    }
	    cancelMovers( ) ;
	}
    }
}

var scalePx ;
var screenWidth ;
var linePx ;

/*async*/ function go() {
//     await fetchPuzzles() ;
    let elOuterHosts = document.getElementsByClassName('outerHost');
    elOuterHost = ( elOuterHosts.length && elOuterHosts[ 0 ] ) || makeEl( 'div' , document.body , 'outerHost' ) ;
//     elHosts = document.getElementsByClassName('host');
    elHost = makeEl( 'div' , elOuterHost , 'host' ) ;
//     elTide = makeEl( 'div' , elOuterHost , 'tide' ) ;
    // scaling - we aim to fill the screen on a mobile in portrait orientation
    screenWidth = parseInt( getComputedStyle( elOuterHost ).width ) - 9 ;
    // but in case we're in portrait, make everything fit
    let height = window.visualViewport.height ;
    if ( screenWidth > height * 5 / 8 ) screenWidth = Math.floor( height * 5 / 8 )
      // scale is 3/16 of screen, so we get 5 1/3 grid squares to work with
    scalePx = ( screenWidth >> 2 ) - ( screenWidth >> 4 );
    linePx = screenWidth >> 7 ;
    elOuterHost.style.width  = Math.floor( ( 5.2 * scalePx ) ) + 'px'  ;
    elOuterHost.style.height = Math.floor( ( 8.25 * scalePx ) ) + 'px'  ;
    spx5 = 5 * scalePx ;
    spx2 = scalePx >> 1 ;
    elHost.style.width  = ( spx5 + 2 * linePx ) + 'px' ;
    elHost.style.height = ( spx5 + 2 * linePx ) + 'px'  ;
    initPointerListeners() ;
    doNewGame();
}
