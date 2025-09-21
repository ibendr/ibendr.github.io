// RubikWords ... core game module

const stdCells = [	[0,0] , [0,1] , [0,2] , [0,3] , [0,4] ,
			[1,0] , [1,1] , [1,2] , [1,3] , [1,4] ,
			[2,0] , [2,1] , [2,2] , [2,3] , [2,4] ,
			[3,0] , [3,1] , [3,2] , [3,3] , [3,4] ,
			[4,0] , [4,1] , [4,2] , [4,3] , [4,4]   ] ;
			
const stdSpots = [	[ [0,0] , [1,0] , [2,0] , [3,0] , [4,0] ] ,	// across
			[ [0,2] , [1,2] , [2,2] , [3,2] , [4,2] ] ,
			[ [0,4] , [1,4] , [2,4] , [3,4] , [4,4] ] ,
			[ [0,0] , [0,1] , [0,2] , [0,3] , [0,4] ] ,	// down
			[ [2,0] , [2,1] , [2,2] , [2,3] , [2,4] ] ,
			[ [4,0] , [4,1] , [4,2] , [4,3] , [4,4] ]	] ;

// nb: with explicit spot lists, we could have done moves as ( spot, n ) instead of ( d , i , n ) ... ?
//	BUT it keeps it more general this way - can still rotate on all rows / columns as it is
			
// NEW CLASS BASED VERSION ====================== V V V

isWord = ( w => ( w5.indexOf( w ) > -1 ) ) ;

// state is set of values for the cells (NOT location or movement history of tiles etc.)
class rubwState extends Array {
    // array length 5 of arrays length 5 of single characters
    // unlike Array, we construct with content - string or array (including another rubwState)
	realWords ;
    constructor( str ) {
	// construct an array with 5 slots
	super( 5 ) ;
	// str can be one string ( with or without \n - we strip it out anyway ) or array of lines
	if ( typeof str == 'string' ) {
	    str = str.replaceAll('\n','') ;
	    for (let y of i5) {
		this[ y ] = i5.map( x => str[ y*5 + x ] );
	    }
	}
	else {
	    // must be array of lines or array of arrays
	    if ( typeof str[ 0 ] == 'string' ) {
		for (let y of i5) {
		    this[ y ] = i5.map( x => str[ y ][ x ] ) ;
		}
	    }
	    else {
		// array of arrays - easy copy
		for (let y of i5) {
		    this[ y ] = str[ y ].slice( ) ;
		}
	    }
	}
	this.assess( )
    }
    assess( ) {
	this.realWords = stdSpots.filter( spot => isWord( this.wordAt( spot ) ) ) ;
	this.allReal = ( this.realWords.length == 6 ) ;
// 	this.realWords = { }
// 	this.allReal = true ;
// 	for ( let spot of stdSpots ) this.allReal &&= ( this.realWords[ spot ] = isWord( this.wordAt( spot ) ) ) ;
    }
    toString( ) {
	// can't use this.map as it tries to create another rubwState object
// 	return this.map( row => row.join('') ).join('\n') ;
	return i5.map( y => this[ y ].join('') ).join('\n') ;
    }
    at( cell ) {
	return this[ cell[ 1 ] ][ cell[ 0 ] ] ;
    }
    wordAt( spot ) {
	return spot.map( p => this.at( p )).join('') ;
    }
    allRealWords( ) {
	for ( let spot of stdSpots ) if ( !isWord( this.wordAt( spot ) ) ) return false ;
	return true;
    }
    equals( other ) {
	// compare content
	for ( let y of i5 ) for ( let x of i5 ) if ( this[ y ][ x ] != other[ y ][ x ] ) return false;
	return true;
    }
    copyFrom( other ) {
	// copy entries from another or compatible array
	for ( let y of i5 ) for ( let x of i5 ) ( this[ y ][ x ] = other[ y ][ x ] ) ;
    }
    move( m ) {
	// make move - should be passed rubwMove or rubwMoves or array to convert to rubwMove (which is then returned)
	if ( m instanceof rubwMoves ) for ( let m1 of m ) this.move( m1 )
	else {
	    if ( m.length == 3 ) this.rotate( ...m ) ;
	    else { // available for when we put other moves in later levels / versions
	    }
	}
	this.assess( )
    }
    jumble( n ) { // make n random moves - but no consecutive on same row
	// obsolete? 
	let moves = new rubwMoves( ) ;
	let mov = null ;
	let oldMov = [ 2 , 0 ] ;
	for (let i = 0 ; i<n ; i++) {
	    let ok = false ;
	    while ( ! ok ) {
		mov = [ rnd(2) , 2 * rnd(3) , ( 1 + rnd(4) ) ] ;
		ok = ( mov[ 0 ] != oldMov[ 0 ] ) || ( mov[ 1 ] != oldMov[ 1 ] );
	    }
	    oldMov = mov ;
	    moves.push( this.move( mov ) ) ;
	}
	return moves ;
    }
    rotate( d , i , n ) {
	// rotate row/column i by n spots
	let pos = [ 0 , 0 ] ;
	pos[ d ^ 1 ] = i ;
	let val = [] ;
	for (let j of i5) {
	    pos[ d ] = j ;
	    val.push( this[ pos[ 1 ] ][ pos[ 0 ] ] ) ;
	}
	for (let j of i5) {
	    pos[ d ] = j ;
	    let j1 = (5 + j - n) % 5 ;
	    this[ pos[ 1 ] ][ pos[ 0 ] ] = val[ j1 ] ;
	}
    }
}

// standard moves ... for now only rotation of row/column
class rubwMove extends Array {
	d ; i ; n ;
    constructor ( d , i , n , x ) {
	// omit any argument for random, x = other move to exclude matching row/column
	super( 3 ) ;
	this[ 0 ] = ( this.d = d ?? rnd( 1 ) ) ;
	this[ 1 ] = ( this.i = i ?? rnd( 3 ) * 2 ) ;
	this[ 2 ] = ( this.n = n ?? ( rnd( 4 ) + 3 ) % 5 - 2 ) ;
	// if we hit the excluded row/column, just switch direction, which makes change of axis 4/6 times not 3/5
	if ( x && this.d == x.d && this.d == x.d ) {
	    this[ 0 ] = ( this.d ^= 1 ) ;
	    this[ 1 ] = ( this.i = i ?? rnd( 3 ) * 2 ) ;
	}
    }
    inverse ( ) {
	return new rubwMove( this.d , this.i , - this.n ) ;
    }
}

class rubwMoves extends Array {
    // array of moves - not much extra needed
    inverse ( ) { return this.reverse().map( m => m.inverse() ) ; }
}


// device is principally its current state, but we add on the starting position, solution, move histories
class rubwDevice extends rubwState {	// TODO rename 'puzzle', remove timing stuff
    start ;		// start state for player
    preMoves ;		// moves from solution to start
    postMoves ;		// moves player has made since start (to current)
    solution ;
    solved ;
    timeDue ;		// time when time is up		// TODO these should go to next layer up ("level")
    timeLen ;		// how long from 0% -> 100%
    constructor( str , sol , rst , mov , tid , tln ) {
	// str = current state, sol = solution state, rst = reset state (defaults to current)
	//   OR
	// str = solution, sol = null , rst = null , mov =  sequence of moves ( OR number of moves for random ) to get to current = reset state
	//   OR
	// str = solution, sol = number of moves
	// tid = time left AS FLOAT 0...1 , tln = tide length
	super( str ) ;
	if ( typeof sol == 'number' ) mov = sol ;
	if ( mov != undefined ) {
	    this.solution = new rubwState( this ) ;
	    if ( typeof mov == 'number' ) {
		this.preMoves = new rubwMoves( mov ) ;
		let lastMove = null ;
		for ( let m = 0 ; m < mov ; m ++ ) {
		    lastMove = ( this.preMoves[ m ] = new rubwMove( null , null , null , lastMove ) ) ;
		}
	    }
	    else {
		this.preMoves = mov ;
	    }
	    console.log(this.preMoves);
	    for ( let move of this.preMoves ) {
		this.rotate( ...move ) ;
		console.log( this.toString( ) + '\n\n' ) ;
	    }
	    this.start = new rubwState( this ) ;
	}
	else {
	    this.preMoves = mov ; 	// whether defined or not
	    this.solution = sol ?? new rubwState( str ) ;
	    this.start = rst ?? new rubwState( str ) ;
	}
	this.postMoves = new rubwMoves( ) ;
	// set up deadlines
	this.timeLen   = tln ?? 60000 ;
	this.timeDue   = now( ) + ( tid ?? 0.5 ) * this.timeLen ;
    }
    // give time left as number between 0 and 1
    get timeLeft( ) { return ( this.timeDue - now() ) / this.timeLen ; }
//     get tide( ) { return Math.floor( 100 * ( this.timeDue - now() ) / ( this.timeLen ) ) ; }
    move( mov ) {
	if ( ! ( mov instanceof rubwMove ) ) mov = new rubwMove( ...mov ) ;
	// add a move to history and apply it to the state
	this.postMoves.push( mov ) ;
	super.move( mov ) ;
    }
    undo( ) {
	// take last move off history and undo it
	if ( this.postMoves.length ) {
	    let mov = this.postMoves.pop( ) ;
	    super.move( mov.inverse( ) ) ;
	}
    }
    reset( ) {
	// go back to start state and erase history
	this.copyFrom( this.start ) ;
	this.postMoves.splice( 0 ) ;
    }
    isSolved( ) {
	// criteria could change for some levels?
// 	this.assess( ) ;
	return this.equals( this.solution ) || this.allReal ;
    }
}

class rubwLevel extends rubwDevice {
    // The player plays a particular level until they beat or lose to the timer (tide)
    // and then they advance to next or regress to previous level
    // Each level has particular parameters
      level ; 		// level number being played
      timeScale ;	// what full time amounts to is ms (longer as levels increase)
    constructor ( level , tid ) {
	this.level = level ;
	let sol = new rubwState( rndPuzzle( ) );
	let puz = new rubwState( sol ) ;
	this.level = level ?? 1 ;
	tid = tid ?? 0.25 ;
	// for testing...    and cheating!
	console.log( sol.toString( ) + '\n\n' + puz.toString( ) + '\n' );
	super( puz , sol , puz , this.nMoves , tid , this.timeScale ) ;
    }
    destructor ( ) {
	super.destructor( )
    }
    get timeScale( ) { return level * 30000 ; }
    get nMoves( ) { return 1 + rnd( this.level ) ; }
}


// OLD { } VERSION ====================== V V V

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


function doNewGame( lev , tid ) {
    // throw away any html tiles in previous game
    if ( itt ) itt.destructor() ;
    // look up new puzzle
    let sol = new rubwState( rndPuzzle( ) );
    let puz = new rubwState( sol ) ;
    lev = lev ?? 1 ;
    tid = tid ?? 0.25 ;
    // for testing...    and cheating!
    console.log( sol.toString( ) + '\n\n' );
    itt = new rubwDeviceHtml( document.body , puz , sol , puz , lev , tid , lev * 60000 ) ;
}
