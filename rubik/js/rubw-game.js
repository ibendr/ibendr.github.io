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
	realWords ; hello = [ "world" ] ; // test ... default properties are copied to new instances ( true to .hasOwnProperty )
	    // for shared variables, add to prototype.
    constructor( str , movesAllowed ) {
	// construct an array with 5 slots
	super( 5 ) ;
	// str can be one string ( with or without \n - we strip it out anyway ) or array of lines or null for blanks
	if ( str == null ) {
	    for (let y of i5) {
		this[ y ] = new Array( 5 ) ;
	    }
	}
	else if ( typeof str == 'string' ) {
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
		// array of arrays - easy copy - note that this includes using another state as argument and duplicates (not wraps) it
		for (let y of i5) {
		    this[ y ] = str[ y ].slice( ) ;
		}
	    }
	}
	this.assess( ) ;
// 	this.addPosAccessors( ) ;	// see note on method
    }
    touch( ) { } // null method as identity move but also check that we exist
    assess( ) {
	this.realWords = stdSpots.filter( spot => isWord( this.wordAt( spot ) ) ) ;
	this.allReal = ( this.realWords.length == 6 ) ;
// 	this.realWords = { }
// 	this.allReal = true ;
// 	for ( let spot of stdSpots ) this.allReal &&= ( this.realWords[ spot ] = isWord( this.wordAt( spot ) ) ) ;
    }
    addPosAccessors( ) {
	// enable direct access with position array, e.g. pos=[3,4]; c=state[ pos ]
	// (I DON'T LIKE IT!) js converts the [3,4] to '3,4' before trying to look it up as a property
	// As I haven't found a way to override the overall getter, this works by adding
	// 25 individual getters and setters, for the individual sets of coordinates.
	// NOTE: I will disable this for the time being, and hope I can eventually write general getter code
	for (let cel of stdCells) { Object.defineProperty( this , (cel + '') , {
					  get(   ) { return  this[ cel[ 1 ] ][ cel[ 0 ] ]     ; } ,
					  set( v ) {         this[ cel[ 1 ] ][ cel[ 0 ] ] = v } }   ) ;
	}
	// DONE: need to rewrite anyway as __defineGetter__ and __defineSetter__ deprecated and could disappear any time!
// 	for (let cel of stdCells) { this.__defineGetter__( (cel + '') , (   ) =>   this[ cel[ 1 ] ][ cel[ 0 ] ]      ) }
// 	for (let cel of stdCells) { this.__defineSetter__( (cel + '') , ( v ) => { this[ cel[ 1 ] ][ cel[ 0 ] ] = v} ) }
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
	// make move - should be passed as rubwMov or rubwMovs
	if ( m instanceof rubwMovs ) for ( let m1 of m ) this.move( m1 ) ;
	m.call ( this );
	this.assess( ) ;
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
    // general framework for line (row/column) based transformations
    alterLine( d , i , action ) {
	// perform transformation on row/column i, 
	//	d = axis    ( which coord changing in movement) d=0 <=>
	//	i = which row/column ... NOTE null => all 5 row/cols
	//	action is function giving old coord to copy value from for new coord
	if ( i == null ) { for ( let j of i5 ) this.alterLine( d , j , action ) ; return }
	// read current values into temporary array
	let pos = [ 0 , 0 ] ;
	pos[ d ^ 1 ] = i ;
	let val = [] ;
	for (let j of i5) {
	    pos[ d ] = j ;
	    val.push( this[ pos[ 1 ] ][ pos[ 0 ] ] ) ;
	}
	// then write new values
	for (let j of i5) {
	    pos[ d ] = j ;
	    let j1 = action ( j ) % 5 ;
	    this[ pos[ 1 ] ][ pos[ 0 ] ] = val[ j1 ] ;
	}
    }
    rotate ( d , i , n ) { 	return this.alterLine( d , i , j => 5 + j - n  ) ; }
    flip   ( d , i )     {	return this.alterLine( d , i , j => 4 - j      ) ; }
	
}

// start abstract - specific subclasses of this for actual action
// note that specific instances of move will represent a type of move and set of parameters for it
// NOTE therefore we don't envisage having move types with hugely variable parameters!
// e.g. default game - 24 moves = 2 x 3 x 4 rotations, going up to 40 (2 x 5 x 4) when odd row rotations allowed,
//	and if we include some more exotic things in higher levels, it'll always a small number of discrete possibilities.
//	So we'll probably not go over about 50 different move objects, almost certainly not over 100.
// Every time a random move is picked, it will be from an explicit list of these specific move objects, rather
//	than being a multi-step process of choosing type and then parameters
class rubwMov extends Array {
        methodName = 'touch' ;
// 	methodArgs = [ ] ;     // should be the parameters of the move, i.e. elements of the array
    // all types of move should be initialised and stored as an array of parameters
    // so only override default constructor if really useful to do so
//     constructor (...args) { super(...args) }
    // if state has a method that does what's needed (possibly from a subclass of rubwState) just set methodName, methodArgs
    // otherwise, override this
    call ( state ) { state[ this.methodName ]( ...this );    }
    // all types of move must have an inverse
    // but where possible, arrange so that last parameter being negated does the trick ...
    inverse ( ) { return new this.constructor( ...this.slice( 0 , this.length - 1 ) , - this[ this.length - 1 ] ) ; }
    // tis is not just here as shorthand - it will sometimes be an efficiency gain to override this with direct undo()
    undo( state ) { this.inverse().call( state ) ; }
    clash( other ) {
	// method to determine whether this and another should not occur together in a random move sequence because they combine into one move
	// most of the time, only moves of the same type will clash, as reported by class-specific clashSame( other )
	return ( other instanceof this.constructor ) && this.clashSame( other ) ;
    }
    // as with default inverse method, we base default clashSame on two moves only differing in the last parameter
    clashSame ( other ) { for ( let i of range( this.length - 1 ) ) if ( other[ i ] != this[ i ] ) return false; return true }
}
class rubwMovs extends Array {
    // partially also extends rubwMov by providing these three methods... BUT beware methods of rubwMov expect numbered elements of this to be move parameters
    // array of moves - not much extra needed
    call( state ) { for ( let mov of this ) mov.call( state ) ; }
    inverse ( ) { return this.reverse().map( m => m.inverse() ) ; }
    undo( state ) { for ( let mov of this.toReversed() ) mov.undo( state ) ; }
    fillFrom( allowed , n , letClash ) {
	// fill with random selections from allowed, avoiding clashing consecutive moves
        // n is how many, or omit to use current length ( if generated with new rubwMovs( n ) )
	n = n ?? this.length ;
	let last = null ;
	for ( let i of range( n ) ) {
	    let ok = false ;
	    while ( !ok ) ok = letClash || !( this[ i ] = rndOf( allowed ) ).clash( last ) ;
	    last = this[ i ] ;
	}
    }
}
// specific types , and standard lists
//  still a bit general - mov affecting a line, and presumably clashing with same type on same line
class rubwMovLine extends rubwMov {
    get d ( ) { return this[ 0 ] ; }
    get i ( ) { return this[ 1 ] ; }
    set d ( v ) {      this[ 0 ] = v ; }
    set i ( v ) {      this[ 1 ] = v ; }
    clashSame ( other ) { return ( this[ 0 ] == other[ 0 ] ) && ( this[ 1 ] == other[ 1 ] ) }
}
class rubwMovRotate extends rubwMovLine {
    methodName = 'rotate' ;
    get n ( ) { return this[ 2 ] ; }
    set n ( v ) {      this[ 2 ] = v ; }
}
// the standard 40 possibilities
stdMovRotates = concat( ... [0,1].map( d => concat( ... [0,1,2,3,4].map( i => [-2,-1,1,2].map( n => new rubwMovRotate( d , i , n ) ) ) ) ) ) ;
stdMovRotateEvens = concat ( ... [0,2,4,5,7,9].map( r => stdMovRotates.slice( 4 * r , 4 * r + 4 ) ) );
class rubwMovFlip extends rubwMovLine {
    methodName = 'flip' ;
    inverse( ) { return this ; }
}
stdMovFlips = concat(...  [0,1].map( d => [0,1,2,3,4].map( i => new rubwMovFlip( d , i ) ) ) ) ;
stdMovGridRotates = concat( ... [0,1].map( d => [-2,-1,1,2].map( n => new rubwMovRotate( d , null , n ) ) ) ) ;
stdMovGridFlips = [0,1].map( d => new rubwMovFlip( d , null ) ) ;
stdMovs = concat( ... [ stdMovRotates , stdMovFlips , stdMovGridRotates , stdMovGridFlips ] ) ;

// A single puzzle is one challenge with a starting position, set of allowable moves, and end position and/or condition
class rubwPuzzle extends rubwState {
    start ;		// start state for player
    solution ;		// end state (hopefully)
    movesAllowed = stdMovRotateEvens ;	// list of moves permitted in this puzzle
    nMoves = 1 ;			// how many moves from solution start should be
    preMoves ;		// moves taken from solution to start (if so constructed)
    postMoves ;		// moves player has made since start (to current)
    finishTest ;	// rename goal ?
    constructor( str , allowed , mov , finishTest ) {
	// str = current state (possibly as string/array), mov = solution state (ditto)
	//   OR
	// str = solution, mov =  sequence of moves ( OR number of moves for random ) to get from solution to start state
	// NOTE: experiment!
	// can we return the argument passed as the "new" object - i.e. avoid making a new one 
	//  NOTE: seems to work but with weird consequences 
	//		... when subclass rubwPuzzleHtml calls this in it's constructor with super( puzzle ),
	//		the result is the object it is creating appearing as a rubwPuzzle, not a rubwPuzzleHtml,
        //		and therefore not having access to its subclass methods (like makeEls).
	if ( str instanceof rubwPuzzle ) return str ;
	super( str ) ;
 	if ( allowed ) this.movesAllowed = allowed ;
	mov = mov ?? this.nMoves ;
	if ( typeof mov == 'number' ) {
	    // number - do this many random moves
	    this.nMoves = mov ;
	    mov = new rubwMovs( mov );
	    mov.fillFrom( this.movesAllowed ) ;
	}
	if ( mov instanceof rubwMov) {
	    // only one move - wrap in a new list
	    mov = new rubwMovs( mov ) ;
	}
	if ( mov instanceof rubwMovs ) { // continues both above case
	    // copy current state into solution, apply pre moves, then copy into start
	    this.preMoves = mov ;
	    this.solution = new rubwState( this ) ;
	    clog( 'premoving ' , this.preMoves ) ;
	    this.preMoves.call( this ) ;
	    this.start    = new rubwState( this ) ;
	}
	else {
	    // string or array can be converted to state
	    console.log( mov ) ;
	    if ( ( typeof mov == 'string ') || ( mov instanceof Array ) ) mov = new rubwState( mov ) ;
	    if ( mov instanceof rubwState ) {
		// leave state as is, mov is solution
		this.solution = mov ;
		this.start    = new rubwState( this ) ;
	    }
	}
	this.postMoves = new rubwMovs( ) ;
	this.finishTest = finishTest ?? this.isSolved ;
    }
    // give time left as number between 0 and 1
    get timeLeft( ) { return ( this.timeDue - now() ) / this.timeLen ; }
//     get tide( ) { return Math.floor( 100 * ( this.timeDue - now() ) / ( this.timeLen ) ) ; }
    move( mov ) {
	// do a move and add it to history
	// getting stricter ... no more raw arrays to be converted! moves need to be from movesAllowed
	// BUT we can allow an index to that array. (Then easy for a bot to play - just pick numbers.)
	if ( typeof mov == 'number' ) mov = this.movesAllowed[ mov ] ;
	if ( arrayIn( mov , this.movesAllowed ) ) {
	    this.postMoves.push( mov ) ;
	    console.log( this.postMoves );
	    mov.call( this ) ;
	}
    }
    undo( ) {
	// take last move off history and undo it
	if ( this.postMoves.length ) {
	    let mov = this.postMoves.pop( ) ;
	    mov.undo( this ) ;
	}
    }
    reset( ) {
	// go back to start state and erase history
// 	this.copyFrom( this.start ) ;
	// or trust our inverses? - nice test t do it this way, and could be good to animate as sequence of moves
	//   	this gives player a little bit more benefit, because as well as going back to start
	//		they get a glimpse of where they just went, so slightly easier to avoid repeating same mistakes
	this.postMoves.undo( this )
	this.postMoves.splice( 0 ) ;
    }
    isSolved( ) {
	// criteria could change for some levels? Set finishTest to this or other
// 	this.assess( ) ;
	return this.equals( this.solution ) || this.allRealWords( ) ;
    }
}

stdLevels = {} ;
//TODO - rework this NOT extending puzzle, but having puzzle as one part ... better reflection of the layout
class rubwLevel  {
    // The player plays a particular level until they beat or lose to the timer (tide)
    // and then they advance to next or regress to previous level
    // Each level has particular parameters
      level ; 		// level number being played
//       timeScale ;	// what full time amounts to is ms (longer as levels increase)  -> timeLen
      timeDue ;		// time when time is up		// 
//       timeLen ;		// how long from 0% -> 100%
      puzzle ;		// puzzle currently underway
    constructor ( level , tid ) {
	// level = 1 , 2 , 3 ...   ( have 0 as demo mode ? "free play" ? )
	// tid = time left ... as proportion of timeLen AS FLOAT 0...1 
	this.level = level ?? 1 ;
	let sol = new rubwState( rndPuzzle( ) );
	this.timeDue   = now( ) + ( tid ?? 0.5 ) * this.timeLen ;
	this.puzzle = new rubwPuzzle( sol , this.movesAllowed , this.nMoves ,  ) ;
	tid = tid ?? 0.25 ;
	// for testing...    and cheating!
	console.log( this.puzzle.solution.toString( ) + '\n\n' + this.puzzle.toString( ) + '\n\n' );
	// set up deadlines
    }
    destructor ( ) {
	super.destructor( )
    }
    get timeLen( )      { return    this.level * 30000 ;       }
      // All the level-dependant parameters...
    get nMoves( )       { return  1 + rnd( this.level ) ; }
    get movesAllowed( ) {
	let level = this.level ;
	if ( level < 4 )  return stdMovRotateEvens ;
	if ( level < 7 )  return stdMovRotates ;
	if ( level < 10 ) return concat( stdMovFlipOdds  , stdMovRotateEvens ) ;
	if ( level < 13 ) return concat( stdMovFlipEvens , stdMovRotateOdds  ) ;
	return concat( stdMovFlips , stdMovRotates  ) ;
    }
    get finishTest( )  {  return null ; } // allow default
  
}
// class to play a full game (? do we need this, or just do continuous play going up and down levels? )
class rubwGame extends rubwLevel {
     constructor ( ) {
	  super( 1 , 0.5 ) ;
     }
}

// OLD { } VERSION ====================== V V V

// i2 = [ 0,1 ] ;
// i5 = [ 0,1,2,3,4 ] ;
// stateDupe = ( puz => i5.map( y => puz[ y ].slice() ) ) ;
// stateDisp = ( puz => puz.map( row => row.join('') ).join('\n') ) ;
// stateComp = ( (p1,p2) => { for ( let y of i5 ) for ( let x of i5 ) if ( p1[ y ][ x ] != p2[ y ][ x ] ) return false ; return true ; } ) ;
transposePuzzleStr = ( puz => i5.map( y => i5.map( x => puz[ 6*x + y ] ).join('') ).join('\n') ) ;
// transposePuzzle = ( puz => i5.map( i => i5.map( j => puz[ j ][ i ] ).join('') ) ) ;
expandPuzzle    = ( puz => i5.map( y => i5.map( x => puz[ 6*y + x ] ) ) ) ;
rndPuzzle       = ( ( ) => expandPuzzle( rnd( 2 ) ? transposePuzzleStr( rndOf( srcPuzzles ) ) : rndOf( srcPuzzles ) ) ) ;

