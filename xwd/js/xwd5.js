/*
 * crossword - specific javascript code
 * 
 * much lifted from python an5 (June 2015) of netbook crossword tools
 * 
 * note - NO html in this layer - presentation is all added in separate module
 * 
 * Version 3 as of May 2016
 * 
 * There was no version 2
 * 
 * Position object being simplified
 * 
 * Three classes defined here -
 * 	xwdCell		single square of grid
 * 	xwdSpot		row of adjacent cells (horizontal or vertical)
 * 	xwdClue		clue describing content of a spot or series of spots
 * 	Crossword	the whole shebang
 * 
 * ver 5 from Nov 2024 ... not much changed; bit of code tidying
 * 
 */
// Parameters

var debug = 1 ;
var keepSingletons = false ;
var xwdHasBars = true ;
var allowSpanSpots = true ;
var allowSpotlessClues = false;
var extraCommas = true;	// puts commas inbetween lengths of words in clues for long answers

// Constants

const nDirections = 2;
const directionNames = [ "Across" , "Down" ];
const shortDirectionNames = [ "ac" , "dn" ];
const dirNamesUpper = [ "ACROSS" , "DOWN" ];
const allDirectionNames = [ "Across" , "Down" , "ac" , "dn" ];

// Various characters of significance

const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const abc = ABC.toLowerCase();

const cAlphas = ABC + abc;

//  characters used to denote live cells (input and output),
//  and number of possibile letters (as output)
const cWilds = "123456789;;;;;;:::::,,,,, ";

const cClash = '*';
const cBlock = '+=.';
// const matchesPending = [] ; collisions = [];

const cCells = cAlphas + cWilds + cClash;

const cEnds = "|#/\\<>";  // characters denoting end of line of crossword (comments etc. may follow)

// cell and spot classes are structural info only - content or possible content elsewhere

function xwdCell( x , y , sol ) {
    // A cell is a small square of the crossword ( space in which one letter / character is entered )
    this.pos = [ x , y ]
    // Naming - for code use - is alphabetic (concise), with row first for correct overall ordering
    //	eg "Be" is row 2 column 5
    this.name =  ABC[ y ] + abc[ x ];
    // What spots of the crossword the cell is in (shouldn't stay empty)
    this.spots = [];
    this.sol = sol || " ";
}

xwdCell.prototype.inSpots = function( spots ) {
    // test whether cell is in any of a list of spots
    var inIt = false;
//     var self = this;
//     if ( spots )
// 	spots.forEach( function( spot ) {
// 	if ( spot && ( spot.cells.indexOf( self ) > -1 ) ) inIt = true;
// 	});
    for ( var spot of spots ) {
	if ( spot && ( spot.cells.indexOf( this ) > -1 ) ) {
	    inIt = true;
	    break ;
	}
    }
    return inIt;
}
  
function xwdSpot( cells ) {
    // A spot is a sequence of cells - where you enter a whole word of solution
    this.cells = cells ;
    this.bars = [ ] ;
    this.length = cells.length ;
    // Naming is join of names of cells - internal code use only - should have more obscure name
    this.name = cells.reduce( function( c1 , c2 ) { return ( c1.name || c1 ) + "-" + c2.name } );
    this.sol  = cells.reduce( function( c1 , c2 ) { return ( c1.sol  || c1 )    +    c2.sol  } );
    // But we also have label according to head-cell label - and clue direction
    // Check whether this is a downward spot (see if second cell below first)
    var dir = ( ( cells.length > 1 ) && ( cells[ 1 ].pos[ 1 ] > cells[ 0 ].pos[ 1 ] ) ) ? 1 : 0;
    this.label = [ this.dir = dir , this.num = cells[ 0 ].label ] ;
    this.clues = [ ] ;
//     this.updateDisplay( ) ;
}
/*
xwdSpot.prototype.updateDisplay = function() {
	// changed 2021 - took space out
  this.display = this.label[ 1 ] + shortDirectionNames[ this.label[ 0 ] ];
}*/

function xwdClue( spots , str , punctuation , solution , annotation ) {
    // A clue is a textual clue (str) for a sequence of spots (usually only one)
    // punctuation is an optional string giving the break up into lengths of
    // the words of the answer, along with punctuation clues.
    // Single spot may be passed as argument spots - we'll wrap it...
    if ( spots instanceof xwdSpot ) {
      spots = [ spots ] ;
    }
    this.spots = spots.slice() ;
//     this.headSpot = spots[ 0 ] ;
    var clue = this ;
    this.spots.forEach( function( spot ) {
	spot.clues.push( clue )
    } );
    this.str = str;
    // If punctuation not specified we use length(s) of spot(s) separated by spaces
    //	(commas are much more conventional, but I'm thinking to personally shift
    //	to using spaces, so that commas can be used when present in answer
    //	(mostly only relevant in longer quotation answers - although "I, Robot" etc.)
    // Compromise: we'll put in a control parameter  extraCommas
    var spotLengths = [] ;
    var totalSpotLength = 0 ;
    this.spots.forEach( function( spot ) {
        spotLengths.push( spot.length ) ;
        totalSpotLength += spot.length ;
    });
    if ( punctuation ) {
        // parseInts( s ) , sum( l )  are both functions defined in object2.js
        wordLengths      = parseInts( punctuation ) ;
        this.lengths     = wordLengths ;
        this.totalLength = sum( this.lengths ) ;
        var ok = ( this.totalLength == totalSpotLength ) ;
			//2024: option to allow anything with if overall length adding up (which
			//	basically then allows cases of words spanning spots)
        // spots, spotLengths and wordLengths arrays get used up here
		var wd = 0 ;
		var sp = 0 ;
		while ( ok && sp < spots.length ) {
			// for each spot, try and match with one or more word lengths
			spot = spots[ sp++ ] ;
			leng = spot.length
			sumLeng = 0 ;
			while ( ( sumLeng < leng ) && ( wd < wordLengths.length ) ) {
				sumLeng += wordLengths[ wd++ ] ;
				if ( sumLeng < leng ) {
					spot.bars.push( sumLeng ) ;
				}
			}
			if ( !allowSpanSpots ) { // only do stricter test if needed
				ok = ( sumLeng == leng ) ;
			}
		}
        if ( !ok ) {
            // TODO: shouldn't really put alert here - not html layer 
            // - need to raise alarm some other way
            alert( "Length mismatch!\n" + str + '\n' + spotLengths + '\n' +  this.lengths )
        }
    }
    else {
        punctuation = spotLengths.join( extraCommas ? "," : " " );
        this.lengths = spotLengths;
    }
    this.punctuation = punctuation;
    this.solution = solution;
    this.annotation = annotation ?? '';
    // Construct the display version
    this.updateDisplay();
}

xwdClue.prototype.updateDisplay = function( skipFirstDirn = true ) {
    // NB "display" is the text representation of the clue. We
    //   are not doing things with the actual display (html etc.) here.
    // should be called after any changes to component parts
    if ( this.spots.length ) {
	if ( skipFirstDirn && this.spots.length == 1 ) {
	    this.display = this.spots[ 0 ].label[ 1 ] + "." ;
	}
	else {
	    var labels = [];
	    this.spots.forEach( function( spot ) {
		labels.push( spot.display );
	    });
	    this.display = labels.join(",") + ".";
	}
	while ( this.display.length < 5 ) this.display += " " ;
	this.display += this.str + " (" + this.punctuation + ")" ;
    }
    else {
	this.display = this.str ;
    }
    return this.display
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


function Crossword( gridLines , clueLines , annoLines ) { 
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
    if ( ! gridLines ) return ;	// for empty constructor for subclass prototypes
    this.readGrid( gridLines );

    this.clues = [ ];		// would index dictionary by spots but need names instead
				    // of objects for javascript dictionary keys
    this.comboSpots = [ ];	// Arrays of spots which have combined clues
//     alert('about to read clues')
    this.readClues( clueLines , annoLines );
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
    // return all clues that concern the spot
    var clues = [];
    this.clues.forEach( function ( clue ) {
	if ( clue.spots.indexOf ( spot ) > -1 ) {
	clues.push( clue );
	}
    });
    return clues;
}

Crossword.prototype.displayCluesBySpot = function( spot ) {
    // return just the display strings of clues for spot
    var displays = [];
    this.clues.forEach( function ( clue ) {
	if ( clue.spots.indexOf ( spot ) > -1 ) {
	displays.push( clue.display );
	}
    });
    return displays;
}

Crossword.prototype.readClues = function( clueLines , annoLines ) {
//   console.log( annoLines );
    // process an array of lines of text as set of clues - would use .fill if universal
    //	2025-09 ... adding annotations:
    //		a clue may be followed by a line with '.' as first non-space character, which is read as anno to the clue
    this.cluesByDirection = [ ] ;
    for ( var i = 0 ; i < nDirections ; i ++ ) {
        this.cluesByDirection.push( [ ] ) ;
    }
    var self = this;	// "this" doesn't seem to survive going into callback functions
    var defaultDirection = 0;
    var lastClueRead = null ;
    for ( let line of clueLines ) {
	var eunuch = false ;   // for 'clues' with no content (just point to main clue)
	var lineDone = false;
	var anno = null ;
	// Check for "Across" and "Down" headings for sections of clues
	directionNames.forEach( function( directionName , directionNumber ) {
            // Old test was too broad - caught any clue whose only text is a direction name
            // e.g. 3. Down? (9)
// 	    if ( strAlphaMatch( clue , directionName ) ) {
            // So we now require direction name at start of line
            if ( line.slice( 0 , directionName.length ).toUpperCase() == directionName.toUpperCase() ) {
                // but still also that there is no other text in the line (must be a better way)
                if ( strAlphaMatch( line , directionName ) ) {
                    defaultDirection = directionNumber;
                    lineDone = true;
		    lastClueRead = null ;
                }
	    }
	});
	if ( lineDone ) continue;
	var punctuation = "";
	// We require clues to be prefixed with a label with a full stop. (We could provide some
	// fallback possibilities later.) The label should be comma separated spot references,
	// using suffixes ac and dn for clues in the non-default direction.
	var clueParts = line.split(".");
	if ( clueParts.length < 2 ) {
	    // not a valid clue line
	    lastClueRead = null ;
	    continue; // return without adding a clue amounts to ignoring line
	}
	if ( clueParts[ 0 ].trim() == "" ) {
	    // no labels => annotation for previous clue (from Sep 2025)
	    if ( lastClueRead ) lastClueRead.annotation = line.slice( clueParts[ 0 ].length + 1 );
	    continue;
	}
	var labels = clueParts[ 0 ];
	line = clueParts.slice( 1 ).join("."); // put the rest of the clue back together as it was
	if ( line.slice( 0, 5 ) == " see " || line.slice( 0, 5 ) == " See " ) {
	    // check for cross reference clues which we will display
	    // but not actually associate with spots
	    // Simple check - if only letters are the ' see ' and up to one short direction name
	    if ( strAlphaMatch( line , "see" ) ) eunuch = true
	    else {
		allDirectionNames.forEach( function( directionName , directionNumber ) {
		    if ( strAlphaMatch( line.slice( 5 ) , directionName ) ) eunuch=true;
		});
	    }
	}
	labels = labels.split(",");
	var spots = [];
	var totalLength = 0;
	if (eunuch) {
	    line = clueParts.join(".") // display just as it was, but no spots etc.
	}
	else {
	    labels.forEach( function ( label , i ) {
		var labelNumber = parseInt( label );
		var labelDirection = -1;
		// check for presence of ac or dn
		allDirectionNames.forEach( function( directionName , i ) {
		    if ( strAlphaMatch( label , directionName ) ) labelDirection = i & 1 ;
		});
    // 	    // Or Across or Down
    // 	    directionNames.forEach( function( directionName , directionNumber ) {
    // 		if ( strAlphaMatch( label , directionName ) ) labelDirection = directionNumber;
    // 	    });
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
                  // can't identify a spot...
            if ( spots.length > 1 ) {
                // combo clue
                self.comboSpots.push( spots );
                }
	    if ( spots.length == 0 ) {
                if ( ! allowSpotlessClues ) continue;
                // if spotless clues allowed, clue constructor needs to know what spots exist
                spots = self.spotsByLength;
            }
	    // Look for punctuation at tail of clue
	    if ( line[ line.length - 1 ] == ")" ) {
		clueParts = line.split("(");
		if ( clueParts.length > 1 ) {
		    // We have parentheses - let's see whats in them, taking last match
		    var punct = clueParts.pop();
		    line = clueParts.join("(")	// put rest of clue back together
                    //   OLD CODE REMOVED- as of xwd4 we accept punctuation string to be
                    //  any sequence of characters, with integers parsed as lengths
                    //  and everything else left intact. The idea is that the final
                    //  "answer" to the clue is the punctuation string with the
                    //  numbers replaced by corresponding content from the grid.
                    //   ALSO length checking done at processing of clue now.
		    while ( line.length && ( line[ line.length - 1 ] == " " ) )
			line = line.slice( 0 , line.length - 1 );
                    punctuation = punct.slice( 0 , punct.length - 1 )
		}
	    }
	}
	lastClueRead = new xwdClue( spots , line , punctuation ) ;
	labels = labels.join(',') ;
	if ( annoLines ) {
	  // simple search for line of same direction annos with (perfectly) matching label
	  for ( let anno of annoLines[ ( spots && spots[ 0 ] && spots[ 0 ].dir ) ?? defaultDirection ] )
	    if ( anno.split('.')[ 0 ].trim() == labels )
	      lastClueRead.annotation = anno.slice( anno.indexOf( '.' ) + 1 ).trim() ;
	}
	self.clues.push( lastClueRead ) ;
	self.cluesByDirection[ defaultDirection ].push( lastClueRead ) ;
    }
};
  

Crossword.prototype.readGrid = function( gridRows ) {
    this.cells = [];		// all cells of the grid (as one straight array)
    this.cells2 = [];		// cells indexed by 2 coordinates - [ y ][ x ] ( i.e. in rows )
    this.spots = [ [] , [] ];	// Spots - sequences of connected cells - across and down
				//  to begin with, arrays of cells, subsequently made into xwdSpot objects
    this.spotsByLength = { };   // Dictionary (by length) of lists of spots
    var spotNowAcc = null;	// Current 'across' spot
    var spotsNowDn = [];		// Current 'down' spots for each column
    

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
		    // make a cell object
		    var newCell = new xwdCell( x , y , c );
		    // start new spot/s as necessary
		    if ( !spotNowAcc      )  this.spots[ 0 ].push( spotNowAcc      = [] );
		    if ( !spotsNowDn[ x ] )  this.spots[ 1 ].push( spotsNowDn[ x ] = [] );
		    this.cells.push( newCell );
		    this.cells2[ y ][ x ] = newCell;
		    spotNowAcc.push( newCell );
		    spotsNowDn[ x ].push( newCell );
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
                // Legitimate spot - add to new list, as actual xwdSpot object
                newList.push( spot = new xwdSpot( spot ) );	// list of keepers for this direction
        // 	if ( this.headCells.indexOf( spot[ 0 ] ) > -1 ) {
        // 	  this.headCells.push( spot[ 0 ] ); // list of head cells
                spot.cells[ 0 ].label="*"; // mark as head-cell (we'll number them later)
        // 	}
                var leng = spot.cells.length ;
                listDictAdd( this.spotsByLength , leng , spot ) ;
                // ...and list of spots that each cell is in, for each of its cells
                for ( var j=0 ; j < leng ; j++ ) {
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
    for ( var cell of this.cells ) {
	if ( cell.label == "*" ) {
	cell.label = ( ++ label );
	}
    }
    // Then get the labels right in each spot
    for ( var d=0 ; d<2 ; d++ ) {  // i.e. for d=0,1
	for ( spot of this.spots[ d ] ) {
            spot.label = [ d , spot.cells[ 0 ].label ];
	    spot.display = spot.cells[ 0 ].label + shortDirectionNames[ d ];
	}
    }
};
