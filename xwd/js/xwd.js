/*
 * crossword - specific javascript code
 * 
 * much lifted from python an5 (June 2015) of netbook crossword tools
 * 
 * note - NO html in this layet - presentation is all added in separate module
 * 
 * 
 * Three classes defined here -
 * 	xwdCell		single square of grid
 * 	xwdSpot		row of adjacent cells (horizontal or vertical)
 * 	xwdClue		clue describing content of a spot or series of spots
 * 	Crossword	the whole shebang
 * 
 */
// Parameters

var debug = 1;
var keepSingletons = false;

// Constants

var directionNames = [ "Across" , "Down" ];
var shortDirectionNames = [ "ac" , "dn" ];

var matchesPending = [] ; collisions = [];
var fileRoot = "words-len-";
var lenLimit = 19;

var extraCommas = true;	// puts commas inbetween lengths of words in clues for long answers

// Various characters of significance

var ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var abc = ABC.toLowerCase();

var cAlphas = ABC + abc;

//  characters used to denote live cells (input and output),
//  and number of possibile letters (as output)
var cWilds = "123456789;;;;;;:::::,,,,, ";

var cClash = '*';
var cBlock = '+=.';

var cCells = cAlphas + cWilds + cClash;

var cEnds = "|#/\\<>";  // characters denoting end of line of crossword (comments etc. may follow)

// cell and spot classes are structural info only - content or possible content elsewhere

function xwdCell( x , y , sol ) {
    // A cell is a small square of the crossword ( space in which one letter / character is entered )
    this.pos = { x: x , y: y };
    // Naming - for code use - is alphabetic (concise), with row first for correct overall ordering
    //	eg "Be" is row 2 column 5
    this.name =  ABC[ y ] + abc[ x ];
    // What spots of the crossword the cell is in (shouldn't stay empty)
    this.spots = [];
    this.sol = sol || " ";
}

xwdCell.prototype.inSpots = function( spots ) {
    // test whether cell is in any of a list of spots
    var self = this;
    var inIt = false;
    if ( spots )
	spots.forEach( function( spot ) {
	if ( spot && ( spot.cells.indexOf( self ) > -1 ) ) inIt = true;
	});
    return inIt;
}

  
function xwdSpot( cells ) {
    // A spot is a sequence of cells - where you enter a whole word of solution
    this.cells = cells;
    this.length = cells.length;
    // Naming is join of names of cells - internal code use only - should have more obscure name
    this.name = cells.reduce( function( c1 , c2 ) { return ( c1.name || c1 ) + "-" + c2.name } );
    this.sol  = cells.reduce( function( c1 , c2 ) { return ( c1.sol  || c1 )    +    c2.sol  } );
    // But we also have label according to head-cell label - and clue direction
    // Check whether this is a downward spot (see if second cell below first)
    var dir = ( ( cells.length > 1 ) && ( cells[ 1 ].pos.y > cells[ 0 ].pos.y ) ) ? 1 : 0;
    this.label = [ dir , cells[ 0 ].label ];
    this.updateDisplay();
}

xwdSpot.prototype.updateDisplay = function() {
  this.display = this.label[ 1 ] + " " + shortDirectionNames[ this.label[ 0 ] ];
}

function xwdClue( spots , str , punctuation , solution ) {
    // A clue is a textual clue (str) for a sequence of spots (usually only one)
    // punctuation is an optional string giving the break up into lengths of
    // the words of the answer, along with punctuation clues.
    // Single spot may be passed as argument spots - we'll wrap it...
    this.spots = ( spots instanceof xwdSpot ) ? [ spots ] : spots;
    this.str = str;
    // If punctuation not specified we use length(s) of spot(s) separated by spaces
    //	(commas are much more conventional, but I'm thinking to personally shift
    //	to using spaces, so that commas can be used when present in answer
    //	(mostly only relevant in longer quotation answers - although "I, Robot" etc.)
    // Compromise: we'll put in a control parameter  extraCommas
    if (!punctuation) {
	var lengths = [];
	spots.forEach( function( spot ) {
	lengths.push( spot.length );
	});
	punctuation = lengths.join( extraCommas ? "," : " " );
    }
    this.punctuation = punctuation;
    this.solution = solution; 
    // Construct the display version
    this.updateDisplay();
}

xwdClue.prototype.updateDisplay = function() {
    // should be called after any changes to component parts
    if ( this.spots.length == 1 ) {
	this.display = this.spots[ 0 ].label[ 1 ] + "." ;
    }
    else {
	var labels = [];
	this.spots.forEach( function( spot ) {
	    labels.push( spot.display );
	});
	this.display = labels.join(",") + ".";
    }
    while ( this.display.length < 5 ) this.display += " ";
    this.display += this.str + " (" + this.punctuation + ")";		     
};


function xwdContentChar( cont ) {
    // What to display ( in one character ) for a given set of possibilities
    // cont is a set of [ letter , ... ] lists 
    l = cont.length
    if ( l == 0 ) return cClash;
    if ( l == 1 ) return cont[ 0 ][ 0 ];
    if ( l > 26 ) l = 26;
    return cWilds[ l - 1 ];
}

function xwdShowLabel( lbl , short ) {
    return ( short ? shortDirectionNames : directionNames ) [ lbl[ 0 ] ] + ' ' + lbl[ 1 ];
}


function Crossword( gridRows , clues ) {
    /* 
    * gridRows is an array of strings representing rows of the solved crossword,
    * 	using spaces for the empty cells if a solution is not being given.
    * 
    * clues (as passed) is array of strings, giving clues in a fairly normal
    * 		human-readable format
    * 
    * this.clues will be an array of xwdClue objects
    * 
    */
    this.readGrid( gridRows );

    this.clues = [ ];		// would index dictionary by spots but need names instead
				    // of objects for javascript dictionary keys
    this.comboSpots = [ ];	// Arrays of spots which have combined clues
    this.readClues( clues );
    //   alert ( this.size );
}



function strAlphaMatch( str , ref , strict ) {
    // check if str contains ref AND NO OTHER alphabetic characters
    //  case insensitive unless strict = true
    if ( !strict ) {
	str = str.toUpperCase();
	ref = ref.toUpperCase();
    }
    var bits = str.split( ref );
    // Return false unless exactly one instance of ref word present
    if ( bits.length != 2 ) return false;
    // Check that remaining bits are all non-alphabetical
    return strAllMatching( bits.join("") , cAlphas , true );
}

function strAllMatching( str , ref , rev ) {
    // Check if a string str is composed ALL of characters from ref
    //	or do reverse if rev=true - check if ALL characters NOT in ref
    rev = rev ? true : flase;
    for ( var i=0 ; i<str.length ; i++ )
	if ( rev ^ ( ref.indexOf( str[ i ] ) == -1 ) ) return false;
    return true;
}
Crossword.prototype.cluesBySpot = function( spot ) {
    var clues = [];
    this.clues.forEach( function ( clue ) {
	if ( clue.spots.indexOf ( spot ) > -1 ) {
	clues.push( clue );
	}
    });
    return clues;
}

Crossword.prototype.displayCluesBySpot = function( spot ) {
    var displays = [];
    this.clues.forEach( function ( clue ) {
	if ( clue.spots.indexOf ( spot ) > -1 ) {
	displays.push( clue.display );
	}
    });
    return displays;
}

Crossword.prototype.readClues = function( clues ) {
    var self = this;	// "this" doesn't seem to survive going into callback functions
    var defaultDirection = 0;  
    clues.forEach( function( clue ) { 
	var lineDone = false;
	// Check for "Across" and "Down" headings for sections of clues
	directionNames.forEach( function( directionName , directionNumber ) {
	if ( strAlphaMatch( clue , directionName ) ) {
	    defaultDirection = directionNumber;
	    lineDone = true;
	}
	});
	if ( lineDone ) return;	// this is only return from function in the clues.forEach() loop
	var punctuation = null;
	// We require clues to be prefixed with a label with a full stop. (We could provide some
	// fallback possibilities later.) The label should be comma separated spot references,
	// using suffixes ac and dn for clues in the non-default direction.
	var clueParts = clue.split(".");
	if ( clueParts.length < 2 ) return; // return without adding a clue amounts to ignoring line`
	var labels = clueParts[ 0 ];
	clue = clueParts.slice( 1 ).join("."); // put the rest of the clue back together as it was
	labels = labels.split(",");
	var spots = [];
	var totalLength = 0;
	labels.forEach( function ( label , i ) {
	var labelNumber = parseInt( label );
	var labelDirection = -1;
	// check for presence of ac or dn
	shortDirectionNames.forEach( function( directionName , directionNumber ) {
	    if ( strAlphaMatch( label , directionName ) ) labelDirection = directionNumber;
	});
	// Or Across or Down
	directionNames.forEach( function( directionName , directionNumber ) {
	    if ( strAlphaMatch( label , directionName ) ) labelDirection = directionNumber;
	});
	// If none, go with current direction
	if ( labelDirection == -1 ) labelDirection = defaultDirection;
	// now add spot to list if it exists

	self.spots[ labelDirection ].forEach( function ( spot ) {
	    if ( spot.label[ 1 ] == labelNumber ) {
	    spots.push( spot );
	    totalLength += spot.length;
	    }
	});
	// Invalid references will be ignored, although this is not ideal
	});
	if ( spots.length < labels.length ) { /* raise error here for dodgy labels */ }
	if ( spots.length == 0 ) return;	// can't identify a spot
	if ( spots.length > 1 ) {
	// combo clue
	self.comboSpots.push( spots );
	}
	// Look for punctuation at tail of clue
	if ( clue[ clue.length - 1 ] == ")" ) {
	clueParts = clue.split("(");
	if ( clueParts.length > 1 ) {
	    // We have parentheses - let's see whats in them, taking last match
	    var punct = clueParts.pop();
	    clue = clueParts.join("(")	// put rest of clue back together
	    // Check that it's valid as a punctuation indicator -
	    // no alphabetic, numbers add up to sum of spot-lengths
	    var legal = true;
	    var copy = punct;
	    var lengths = [];
	    var total = 0;
	    punctuation = ""
	    while ( copy.length > 1 ) { // we'll ignore final ')'
		var len1 = parseInt( copy );
		if ( len1 ) {
		    // a number - add it to list of lengths and total length (as number)
		    len1s = "" + len1 ;
		    punctuation += len1s ;
		    total += len1 ;
		    lengths.push( len1 ) ;
		    // and skip through to next bit
		    copy = copy.slice( copy.indexOf( len1s ) +len1s.length ) ;/*
		    copy = copy.split( len1 , 2 )[ 1 ];*/
		    if ( copy.length < 2 ) break;
		}
		var c = copy[ 0 ];
		// insert any character restrictions / filters etc. here
		if ( cAlphas.indexOf( c ) > -1 ) {
		    legal = false;
		    break;
		}
		punctuation += c;
		copy = copy.slice( 1 );
	    }
	    // If illegal characters or length mismatch, discard and put old clue back together
	    if ( (!legal) || ( total != totalLength ) ) {
	    alert( total + "-" + totalLength );
	    punctuation = null;
	    clue += ( "(" + punct ); // punct still included final ")"
	    }
	    // If OK, trim spaces from denuded main clue
	    else {
	    while ( clue.length && ( clue[ clue.length - 1 ] == " " ) )
		clue = clue.slice( 0 , clue.length - 1 );
	    }
	}
	}
	self.clues.push( new xwdClue( spots , clue , punctuation ) );
    });
};
  

Crossword.prototype.readGrid = function( gridRows ) {
    this.cells = [];		// all cells of the grid (as one straight array)
    this.cells2 = [];		// cells indexed by 2 coordinates - [ y ][ x ] ( i.e. in rows )
    this.spots = [ [] , [] ];	// Spots - sequences of connected cells - across and down
    var spotNowAcc = null;	// Current 'across' spot
    var spotsNowDn = [];		// Current 'down' spots for each column
    
    this.cellContent = {};	// Possible content for the cells, as sets of possibilities
			    // USED TO BE IN "an5":   After processing -
			    // dictionary from cell (ptr) to a set of of permitted letters
			    //  .... dict of letter -> [ n0 , n1 ] lists
			    // where letter is a letter which could go in the cell, and
			    // n0 , n1  are the number of words currently permissible (in
			    // the across and down spots respectively) which agree with
			    // this letter assignment;  one for unused direction.  (Zero
			    // should not occur 'naturally' or else letter not in set
			    // At input stage - 
			    // dictionary from cell(ptr) to string (content) or number (priority)
    this.cellScores = {};// Number of live possibilities for each cell;  after processing -
    // 			//   cellScores[ cell ] == len( cellContent[ cell ] )
    //   spotContent = dict()	// Possible content for the spots, as lists of words
    //   spotScores = dict()	// spot -> list of dicts : letter -> // of words containing
    //   spotRegExps = dict()  // regular expressions for each spot

    if (debug>1) alert( "Establishing crossword structure..." );

    // On the fly building of Across and Down spots ...
    //	... a little tricky - reading cells in rows, at any given time only one 'live'
    //		Across clue but several Down clues. Initially we allow spots of length 1.
    
    var rowLengths = [];
    var maxRowLength = 0;
    
    for ( var y=0 ; y<gridRows.length ; y++ ) {
	var gridRow = gridRows[ y ];
	// blank row means end of grid data
	if ( !gridRow ) break;
	// Process row of grid
	this.cells2[ y ] = [];
	var rowLength = 0;
	for ( var x=0 ; x<gridRow.length ; x++ ) {
	// each character c...
	var c = gridRow[ x ];
	// various characters indicate rest of line is irrelevant
	if ( cEnds.indexOf( c ) > -1 ) break;
	else {
	    if ( cCells.indexOf( c ) > -1 ) {
	    // Live cell of crossword - continue (or start) spots
	    rowLength++ ;
	    var newCell = new xwdCell( x , y , c );
	    if ( !spotNowAcc      )  this.spots[ 0 ].push( spotNowAcc      = [] );
	    if ( !spotsNowDn[ x ] )  this.spots[ 1 ].push( spotsNowDn[ x ] = [] );
	    this.cells.push( newCell );
	    this.cells2[ y ][ x ] = newCell;
	    spotNowAcc.push( newCell );
	    spotsNowDn[ x ].push( newCell );
	    // assign content = upper-case letter or set of possibilities
	    if ( cAlphas.indexOf( c ) > -1 ) {
		this.cellContent[ newCell.name ] = c.toUpperCase();
		n = 1;
	    }
	    else {
		// Wildcard ... have to allow everything at first
		this.cellContent[ newCell ] = ABC;   // can only populate later
		n = cWilds.indexOf( c ) + 1;	//  n == 0  means  c == cClash
	    }
	    this.cellScores[ newCell.name ] = n;
	    }
	    else {
	    // assume blockage - could check == cBlock if requiring strict adherence
	    // Close current spots through this spot in both directions
	    rowLength++ ;
	    if ( spotNowAcc ) spotNowAcc = null;
	    if ( spotsNowDn[ x ] ) delete spotsNowDn[ x ];
	    }
	}
	}
	// End of the line - finish off current across spot and record length
	if ( spotNowAcc) spotNowAcc = null;
	rowLengths.push( rowLength );
	if ( rowLength > maxRowLength ) maxRowLength = rowLength;
    }
    this.size = [ maxRowLength, rowLengths.length ];
    // End of grid
    
    // Cull out any singleton spots,
    //	and assign remaining spots to cells
    //	and assign head labels
    //	AND create xwdSpot objects
    //   this.headCells = [];
    for ( var d=0 ; d<2 ; d++ ) {  // i.e. for d=0,1
	// Must copy into a new list
	var newList = [];
	for ( var i=0 ; i < this.spots[ d ].length ; i++ ) {
	var spot = this.spots[ d ][ i ];
	if ( keepSingletons || ( spot.length > 1 ) ) {
	    // Legitimate spot - add to lists
	    newList.push( spot = new xwdSpot( spot ) );	// list of keepers for this direction
    // 	if ( this.headCells.indexOf( spot[ 0 ] ) > -1 ) {
    // 	  this.headCells.push( spot[ 0 ] ); // list of head cells
	    spot.cells[ 0 ].label="*";
    // 	}
	    // ...and list of spots that each cell is in, for each of its cells
	    for ( var j=0 ; j<spot.cells.length ; j++ ) {
	    spot.cells[ j ].spots.push( [ spot , j ] );
	    }
	}
	}
	this.spots[ d ] = newList;
    }
    // This will sometimes be convenient - and costs very little memory
    this.allSpots = this.spots[ 0 ].concat( this.spots[ 1 ] );
    // Only after culling of singletons do we do assign spot labels...
    // Get the numbers right by going through the cells in grid order
    var label = 0;
    this.cells.forEach( function( cell ) {
	if ( cell.label == "*" ) {
	cell.label = ( ++ label );
	}
    });
    // Then get the labels right in each spot
    for ( var d=0 ; d<2 ; d++ ) {  // i.e. for d=0,1
	this.spots[ d ].forEach( function( spot ) {
	spot.label = [ d , spot.cells[ 0 ].label ];
	spot.updateDisplay();
	});
    }
};
