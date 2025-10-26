// RubikWords ... html layer

// 2025 Sep 17  broken into multiple files... 

// NEW CLASS BASED VERSION ====================== V V V

class rubwTile extends elem {
	lbl ; pos ; drag ; flips = 0 ;
    constructor( pa , lbl , pos ) {
	let styl = {
	    width:       px( scalePx - linePx ) , 
	    height:      px( scalePx - linePx ) ,
	    fontSize:    px( scalePx * 0.8 ) ,
	    borderWidth: px( linePx )
	} ;
	let cls = ( lbl == "=" ) ? [ 'tile' , 'blok' ] : 'tile' ;
	// make main and ghost element for wraparound
	super( 'div' , pa , cls , styl , 1 ) ;
	this.el.innerText = ( this.lbl = ( ( lbl == "=" ) ? '' : lbl ) );
	this.els[1].innerText = ( this.lbl = ( ( lbl == "=" ) ? '' : lbl ) );
	this.pos = pos ?? [ 0 , 0 ] ;  // x , y
	this.drag = [ 0 , 0 ] //null ; // [ dx , dy ] when element being dragged from position implied by pos
	this.update( ) ;
    }
    update( ) {
	const lower = 0.5 * linePx ;
	const upper = 4 * scalePx + 1.5 * linePx ;
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
	this.setPosSize( px  , null , [ 0 ] );
	this.setPosSize( px2 , null , [ 1 ] , { display: show2 ? 'block' : 'none' } ) ;
    }
}

// class to interact with one puzzle
class rubwPuzzleHtml extends elem {
	tiles ; 		// objects for the slideable pieces
	tileAt ; 		// actually a state with tiles as entries, so we can do same moves
	moving ;		// { tiles: list of moving tiles , dir: axis , which: row/col }
    constructor ( pa, puz ) {
	// pa is parent element to attach to
	// puz is the actual puzzle we're presenting
	// make the abstract device
	// make the host element
	adjustScale( ) ;
	let siz = ( spx5 + 2.5 * linePx ) + 'px' ;
	super(  'div' , pa , [ 'host' , 'inner' ] , { width: siz , height: siz } ) ;
	this.pa = pa ;
	this.it = puz ;
	// make tiles
	this.tiles = [ ] ;
	this.tileAt = new rubwState( ) ;
	for ( let cell of stdCells ) {
	    let tile = new rubwTile( this.el , this.it.at( cell ) , cell.slice( ) )
	    this.tiles.push( tile ) ;
	    this.tileAt[ cell[ 1 ] ][ cell[ 0 ] ] = tile ;
	}
	this.moving = { tiles: [ ] , dir: 0 , which: 0 , dmin: 0 , dmax: 0 } ;
	this.update() ;
	initPointerListeners( this.el ) ;
    }
    destructor( ) {	// ALERT - Element.remove() does not destroy! TODO - much of this is general could go to elem in dom - need to generalise children
	for ( let tile of this.tiles ) {
	    tile.destructor() ;
	}
	this.tiles.splice( 0 ) ;
// 	console.log( this.els ) ;
	super.destructor( ) ;
// 	( super.destructor ?? ( ()=>{} ) ) ( ) ;	// this failed! super.destructor must have lost its binding to 'this' just by aplying ?? operator. (I tested, being in ( ) doesn't worry it.)
    }

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
	    if ( isWord( this.it.wordAt( spot ) ) ) {
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
	// ds is distances available to move on this line. (in form -4,-3,-2,-1,1,2,3,4 as appropriate)
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
	this.moving.doneMax = 0 ;
    }
    move( mov , inv ) {
	this.tileAt.move( mov );  // move the tiles the same way
	this.pa.move( mov.rep ) // move in the underlying model - passed as string to check legality
	this.update() ; 	// this will record the correct new positions for the tiles
// 	setTimeout( ()	 => { this.pa.move( mov.rep ) ; } , 50 ) ;   // move in the underlying model - passed as string to check legality
    }
    undo( ) {
	// make sure undo also applied to tileAt
	if ( this.it.postMoves.length ) {
	    let mov = this.it.postMoves.pop( ) ;
	    mov.undo( this.it ) ;
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
	    for ( let mov of this.it.movesAllowed ) {
		if ( mov instanceof rubwMovLine ) {
		    if ( mov[ 1 ] == pos[ mov[ 0 ] ^ 1 ] ) {
// 			if      ( mov instanceof rubwMovLineRotate )
// 			    movesFree[ mov[ 0 ] ].push( mov ) ;
// 			else if ( mov instanceof rubwMovLineFlip   )
			    movesFree[ mov[ 0 ] ].push( mov ) ;
		    }
		}		    
	    }
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
		// record futhest distance moved, for triggering flips
		if ( Math.abs( dis ) > this.moving.doneMax ) this.moving.doneMax = Math.abs( dis ) ;
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
		if ( closest < 0.5 ) {
// 		    console.log( 'flipper?' , moving.doneMax) ;
		    // back to same spot ... if moved far enough ( > 2 squares ? ) do flip
		    if ( moving.doneMax > 2 * scalePx ) {
// 			console.log( 'flipper...' ) ;
			for ( let mov of moving.movs )
			    if ( mov instanceof rubwMovLineFlip ) {
// 				console.log( 'FLIPPER!' ) ;
				closeMov = mov ;
				break ;
			    }
		    }
		}
		else { // see which allowed rotation is closest
		    for ( let mov of moving.movs ) {
			if ( mov instanceof rubwMovLineRotate ) {
			    let disd = dm5( dis, mov.n ) ; // dm5 = distance modulo 5 (so -4.1 is close to 1 )
			    if ( disd < closest ) {
				closest = disd ;
				closeMov = mov ;
			    }
			}
		    }
		}
		if ( closeMov ) {
		    this.move( closeMov ) ;
		    // this does the tile updates not done in gridRotate
		    // check for success
		    if ( this.puzzle ) this.update( ) ;
		}
	    }
	    this.cancelMovers( ) ;
	}
    }
}
// TODO - big change of direction ... don't make the html view an extension of underlying object.
// Make views extend views, no inheritance back and forth between game and html layer.

// class to interact with a level
class rubwGameHtml extends rubwGame {
    constructor ( pa, ...args ) {
	// pa is parent element to attach to
	// make the abstract
	super( ...args ) ;	// NOTE super() calls makeNextPuzzle but BEFORE we start to intercept it
	// check scale, make elements
	adjustScale( ) ;
	let w = ( 5 * scalePx + 10 * linePx ) + 'px' ;
	let h = ( 8 * scalePx                 ) + 'px' ;
	this.makeEls( 'div' , pa ?? document.body , [ 'host' , 'outer' ] , { width: w , height: h } ) ;
	// make the tide and dashboard... order of creation determines which are on top (unless we use z-index)
	this.tide = new rubwTide( this ) ;
	this.dashboard = new rubwDashboard( this ) ;
	this.dashboard.setPosSize( [ 3 * linePx , 5 * scalePx + 9 * linePx ] , [ ( 5 * scalePx + 2.5 * linePx ) + 'px' , ( 2.5 * scalePx ) + 'px' ] ) ;
// 	this.tellUser( "Slide\nlines\nof tiles.\nMake\nwords!", () => { this.startLevel() } , "Start") ;
    }
    destructor ( ) {
    }
    undo( ) {
	// makes sure tiles are also moved
	// nb - overriding rubwGame: this.puzzle.undo( )
	this.puzzleHost.undo( ) ;
    }
    update( ) {
	this.puzzleHost.update( ) ;
	this.tide.update( ) ;
	this.dashboard.update( ) ;
	super.update( ) ;
    }
    // overrides
    makePuzzle( ) {
	super.makePuzzle( ) ;
	// make the puzzle area... and position it nicely :)
	this.puzzleHost = new rubwPuzzleHtml( this , this.puzzle ) ;
	this.puzzleHost.setPosSize( [ 3 * linePx , 3 * linePx ] );
	this.update( ) ;
    }
    killPuzzle( ) {
	this.puzzleHost.destructor( ) ;
	super.killPuzzle( ) ;
    }
    tellUser( str , andThen , confirm ) {
// 	    console.log( arguments ) ;
	if ( confirm ) {
	    if ( typeof confirm != "string" ) confirm = 'OK' ;
	    // the user could use the button on dialog box OR type ok()
	    let spnr = spinDialog( this , str , () => { ok = ( ()=>{} ) ; andThen( ) } , confirm ) ;
	    // note - spinDialog returns a callback function that can be used to do the unspin
	    // typing 'ok' calls second half of spinner, which in turn finally does andThen
	    super.tellUser( str , spnr , true  ) ;
	}
	else {
	    // Skip the spinDialog for some messages ... for now only do new level and game over
	    if ( str.slice( 0 , 5 ) == 'LEVEL' ) {
		// andThen executed by spinDialog only - null function passed on to super
		spinDialog( this , str , andThen ) ;
		super.tellUser( str , f0 ) ;
	    }
	    else {
		super.tellUser( str , andThen ) ;
	    }
	}
    }
    show( event , andThen , confirm ) {
	let it = this ;
	// show timer shifting
	if ( event in { "winPuzzle": 1 , "skipPuzzle": 1 , "winLevel": 1 } )
	    this.tide.gotoward( Math.min( this.timeProp , 1 ) , 2000 ) ;

	super.show( event , 	// rubwGame sends message to tellUser, then comes back here
	    ( ) => {
		if ( event == "winPuzzle" ) {
		    setTimeout( () => { 
			doBlinky( this.tide , x => ( doBlow ( it , andThen ) ) ) ; } , 50 ) ;
		}
		else if ( ( event == "skipPuzzle" ) || ( event == "loseLevel" ) || ( event == "loseGame" ) ) {
		    
		    setTimeout( () => { doBlinky( this.tide ) ; doSink ( it , andThen ) ; } , 50 ) ;
		}
		// if none of the above have scheduled it
		else setTimeout( andThen( ) , 50 ) ;
	    }  , confirm ) ;
    }
    get nPostMoves( ) { return this.puzzle.nPostMoves ; }
}

const dashProps = [ [ 'Level' , 'level' ] , [ 'Puzzle' , 'puzN' ] , [ 'Moves' , 'nPostMoves' ] ]
class rubwDashboard extends elem {
    constructor ( pa ) {
	// pa is parent rubwGameHtml
	super( 'div' , pa , [ 'host' , 'dashboard' ] ) ;
// 	this.statLine = new elem( 'div' , this , 'status' ) ; 
// 	for ( let prop of props ) {
// 	    let disp = htmlTree( [ 'span' ,, 'display' ] , this.statLine ,  ) ;
// 	    let labl = htmlTree( [ 'span' , prop[ 0 ], 'label' ]  , disp ) ;
// 	    this[ 'el' + prop[ 1 ] ] = htmlTree( [ 'span' ,, 'content' ] , disp  ) ;
// 	}
	// make displays (as inert buttons)
	this.displays = dashProps.map( ( p , i ) => {
	    let btn = new elButton( this.el , p[ 0 ] + ':' , f0 ,
				[ [ ( 0.1 + i * 1.7 ) * scalePx , 0.12 * scalePx ] , [ 1.4 * scalePx , scalePx ] , 0 , { borderWidth: linePx + 'px' , fontSize: toPx( 0.3 * scalePx ) , borderRadius: '15%' } ] ) ;
	    htmlTree( [ 'br' ] , btn ) ;
	    return htmlTree( [ 'span' ,, 'display' ] , btn ) ;
	} ) ;
	// make action buttons
// 	const labels  = [   '⏴'   ,   '⏸'  ,   '⏩'  ] ; // looks good here but didn't work
	const labels  = [ '\u23f4' , '\u23f8' , '\u23e9' ] ;
	const methods = [  'undo'  ,  'pause' ,  'skip'  ] ;
	this.buttons = methods.map( ( m , i ) => new elButton( this.el , labels[ i ] , ev => { pa[ m ]( ) ; ev.preventDefault( ) ; } ,
				[ [ ( 0.1 + i * 1.7 ) * scalePx , 1.32 * scalePx ] , [ 1.4 * scalePx , scalePx ] , 0 , { borderWidth: linePx + 'px' , fontSize: toPx( 0.65 * scalePx ) , borderRadius: '15%' } ] , m ) ) ;
// 	this.buttons = i2.map( i => new elButton( this.el , buts[ i ] , ev => { acts[ i ]() ; ev.preventDefault( ) ; } , [ ( 0.1 + i * 2.8 ) * scalePx , 1.32 * scalePx ] , [ 2 * scalePx , scalePx ] , 0 , { borderWidth: linePx + 'px' } ) ) ;
    }
    update( ) {
	dashProps.map( ( p , i ) => {
// 	    console.log( p[ 1 ] , this.pa[ p[ 1 ] ] ) ;	    
	    this.displays[ i ].innerText = this.pa[ p[ 1 ] ] ;
	} ) ;
// 	for ( let prop of dashProps ) {
// 	    this[ 'el' + prop[ 1 ] ].innerText = this.pa[ prop[ 0 ] ] ;
// 	}
    }
}
class rubwTide extends elem {
    // the tide / timer - red fill that 
    constructor ( pa ) {
	// pa is parent rubwGameHtml
	let w = pa.el.style.width ;
	let h = pa.el.style.height ;
	super( 'div' , pa , [ 'timer' ] , { width: w , height: h } ) ;
	this.fullH = parseInt( h ) ;
    }
    gotoward( score , time , lag ) {
	// move toward score at time ms in the future
	let st = this.el.style ;
	setTimeout( () => {
	    st.transitionDuration = time + 'ms' ; // ...+ 'ms, 0ms' if doing background-colour
	    st.height = Math.floor( ( 1 - score ) * this.fullH ) + 'px' ; 
	    st.backgroundColor = 'rgb(' + Math.floor( 255 - 128 * score ) + ' 0 0)' ;
	} , lag || 1 ) ;
    }	
    
    update( ) {
	// right now show current state
	this.gotoward( this.pa.timeProp , 0 , 2 ) ;
	// but head towards finished
	this.gotoward( 0 , Math.max( 2 , this.pa.timeDue - now() ) , 100 ) ;
    }
}


// How we achieve some of the effect of multiple inheritance
for ( let prop of [ 'elss' , 'makeEls' , 'setStyle' , 'setPosSize' ] )
    for ( let cls of [ rubwPuzzleHtml , rubwGameHtml ] )
	cls.prototype[ prop ] = elem.prototype[ prop ];

// in transition

// tileCanMove = ( () => true ) ;
// // tileCanMove = ( ( tile , dir ) => ( tile.pos[ dir ^ 1 ] & 1 ) == 0 ) ;
// 
// function tideIn( it ) {
//     console.log( "Tide is in!" ) ;
// }
var scalePx ;
var screenWidth ;
var linePx ;
var spx5 ;
var spx2 ;
var lpx2 ;
function adjustScale() {
    // adjust scaling - we aim to fill the screen on a mobile in portrait orientation
    screenWidth = parseInt( getComputedStyle( document.body ).width ) - 9 ;
    // ... but in case we're in portrait, make everything fit
    let height = window.visualViewport.height ;
    if ( screenWidth > height * 5 / 8 ) screenWidth = Math.floor( height * 5 / 8 )
      // scale is 25/128 of screen, so we get 5.12 grid squares to work with
    scalePx = ( 24 * screenWidth ) >> 7 ; //  ( screenWidth >> 2 ) - ( screenWidth >> 4 ) + ( screenWidth >> 7 );
    linePx = screenWidth >> 7 ;
    spx5 = 5 * scalePx ;
    spx2 = scalePx >> 1 ;
    lpx2 = linePx << 1 ;
    document.body.style.fontSize = Math.floor( scalePx ) + 'px' ;
}

// VISUAL EFFECTS

// blinky colour on outer host
function doBlinky( it , andThen ) {
    if ( it.el ) {
	let s = it.el.style ;
// 	s.transitionProperty = 'backgroundColor' ;
//    	s.transitionDuration = '20ms' ;
	for (let t = 0; t < 8 ; t++ ) {
	    setTimeout( () => {
		  s.backgroundColor = [ "#aa3333" , "yellow" ][ t & 1 ] ;
		  if (!t) if ( andThen ) andThen ( );
			      } , ( 66 - ( t + 2 ) * t ) * 20 ) ;
	}
    }
    else {
	// can't do our blinking, cut straight to then task
	if ( andThen ) andThen();
    }
}

// OLD { } VERSION ====================== V V V


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

// Some effects as possibilities for end of level etc.
// any timing based effect will take an "andThen" argument
//	NOTE: ( shouldn't we just learn to use Promises and Thenables? )

// chain of tasks which accept andThen arguments - head and tail affair
// note that this returns  - not executes - the combined function
doPair = ( a , b ) => ( aT => a( () => b( aT ) ) ) ;
doChain = ( a , b, ...c ) => doPair( a , c.length ? doChain( b, ...c ): b ) ;

// blow it up - uses ticks, doBlow and tick, ticakAndThen
const rndColor = ( () => '#' + [0,1,2,3,4,5].map(()=>'0123456789abcdef'[rnd(16)]).join('') ) ;

// run a sequence of Newtonian updates

var ticks = 0 ;
var tickAndThen = ( ()=>{} ) ;
var tickIt ;
var tickParams = [ ] ;
doBlow = ( it , andThen ) => {
    ticks = 0 ; tickIt = it ; tickAndThen = andThen ;
    tickParams = [ 64 , 16 , 8  , 24 , 64 , 240 , -120 , 12 , -4 ] ;
    it.puzzleHost.el.style.background = 'none' ;
    it.puzzleHost.el.style.borderColor = '#ffffff00' ; // see-through - removing borer shifts contents
  for ( let tile of it.puzzleHost.tiles ) {  tile.update( ) ; tile.posPx = null ; tile.velPx = null ; } ;
  tick( ) } ;
doSink = ( it , andThen ) => {
    ticks = 0 ; tickIt = it ; tickAndThen = andThen ;
    tickParams = [ 4 , -10 , 6 ,  0 , -4 , 30 , 0 , 2 , 2 ] ;
  for ( let tile of it.puzzleHost.tiles ) {  tile.update( ) ; tile.posPx = null ; tile.velPx = null ; } ;
  tick( ) } ;

tick = ( t => {
    t = t || 30 ;
//     let vs = t + 'V: ' ;
//     let ps = t + 'P: ' ;
    for ( let tile of tickIt.puzzleHost.tiles)  {
        let st = tile.el.style ;
        let p = tile.posPx ?? [ st.left , st.top , '0' , '100'].map( s => parseInt(s) ) ;
	let [ a,b,c,d,e,f,g,h,i ] = tickParams ;
        let v = tile.velPx ?? [ rnd(a)-b-tile.pos[0]*c,rnd(d)-e,rnd(f)-g,rnd(h)-i] ;
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


// doBlinkyBlow = ( aT => doBlinky( () => doBlow ( aT ) ) ) ;
doBlinkyBlow = doPair( doBlinky , doBlow ) ;
const celebrate = doBlinkyBlow ;

    //		start	-> ready to move either row or column (as eligible) of tile
    //		moving	-> if 'turning' ... update model to junction, switch row/col (when we get fancy)
    //		end	-> finalise move in model

var points = { } ;
var moving = { tiles: [ ] , dir: null , which: null , dmin: 0 , dmax: 0 } ;

