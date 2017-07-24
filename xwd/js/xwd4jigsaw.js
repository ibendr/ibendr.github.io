/*
 * crossword - specific javascript code
 * 
 * Add on to include after xwd4, modifying the code to allow for 
 * jigsaw style crossword
 * 
 */

// Constants

var nDirections = 1;
var directionNames = [ "Clues" ];
var shortDirectionNames = [ "." ];
var dirNamesUpper = [ "CLUES" ];
var allDirectionNames = [ ];
var allowSpotlessClues = true;

function xwdClue( spots , str , punctuation , solution ) {
    // A clue is a textual clue (str) for an answer which will go into
    // some sequence of spots (usually only one) as length permits
    // punctuation is an COMPULSORY string giving the break up into lengths of
    // the words of the answer, along with punctuation clues.
    // 'spots' is passed as crossword's .spotsByLength
    // parseInts( s ) , sum( l )  are both functions defined in object2.js
    var wordLengths = this.lengths = parseInts( punctuation ) ;
    var breaks = [ 0 ] ;
    var backJumps = [ [ ] ] ;
    var forwJumps = [ [ ] ] ;
    var totalLen = 0 ;
    var nWords = wordLengths.length ;
    var lDebug = ( nWords > 1 ) ;
    if ( lDebug ) alert ( wordLengths ) ;
    for ( var i = 0 ; i < nWords ; i++ ) {
        // Add to list of break-points
        breaks.push( totalLen += wordLengths[ i ] ) ;
        backJumps.push( [ ] ) ;
        forwJumps.push( [ ] ) ;
        // Check for acceptable jumps TO this FROM previously reached spots
        for ( var j = 0 ; j <= i ; j++ ) {
            // if break j is start, or reached by earlier jumps
            if ( ( j == 0 ) || backJumps[ j ] ) {
                // work out distance back
                var d = totalLen - breaks[ j ] ;
                // check if it's a length with spots
                if ( d in spots ) {
//                     alert( i + ',' + j + ',' + d ) ;
                    forwJumps[   j   ].push( i + 1 ) ;
                    backJumps[ i + 1 ].push(   j   ) ;
                }
            }
        }
    }
    if ( lDebug ) alert ( forwJumps );
    if ( lDebug ) alert ( backJumps );
    this.totalLength = totalLen ;
    // If no legal sequences of jumps reached the last break (total length)
    //  then the answer can't be placed in the grid
    if ( ! backJumps[ nWords ] ) {
        alert( "Length mismatch!\n" + str + '\n' + wordLengths + '\n' +  forwJumps )
    }
    // Go back through breaks culling ones that don't have a 
    // sequence of forward jumps to the finish
    for ( var i = nWords - 1 ; i ; i-- ) {
        if ( ! forwJumps[ i ] ) {
            // no paths forward - remove backward jumps
            var bjs = backJumps[ i ]
            while ( bjs ) {
                var j = bjs.pop( ) ;
                forwJumps[ j ] = arrayWithout( forwJumps[ j ] , i ) ;
            }
        }
    }
    // And finally take stock of the spot lengths that could be involved
    var spotLengths = [ ] ;
    for ( var j = 0 ; j < nWords ; j++ ) {
        forwJumps[ j ].forEach( function( i ) {
            var d = breaks[ i ] - breaks[ j ] ;
            if ( spotLengths.indexOf( d ) == -1 ) {
                spotLengths.push( d ) ;
            }
        }) ;
    }
    var mySpots = [ ] ;
    spotLengths.forEach( function( d ) {
        mySpots = mySpots.concat( spots[ d ] ) ;
    }) ;
    this.spots = mySpots ;
    this.breaks = breaks ;
    this.forwJumps = forwJumps ;
    this.str = str;
    this.punctuation = punctuation;
    this.solution = solution;
    // Construct the display version
    this.updateDisplay();
}

xwdClue.prototype.updateDisplay = function() {
    this.display = this.str + " (" + this.punctuation + ")" ;
};


Crossword.prototype.readClues = function( clueLines ) {
    this.cluesByDirection = [ [ ] ] ;
    var self = this;	// "this" doesn't seem to survive going into callback functions
    clueLines.forEach( function( line ) { 
	var eunuch = false ;   // for 'clues' with no content (just point to main clue)
	var lineDone = false;
	var punctuation = "";
        // Look for punctuation at tail of clue
        clueParts = line.split("(");
        if ( ( line[ line.length - 1 ] != ")" ) || ( clueParts.length < 2 ) ) {
            // ignore lines with no lengths - this is now the vital requirement, not labels
            return ;
        }
        else {        
            // We have parentheses - let's see whats in them, taking last match
            var punct = clueParts.pop();
            var clue = clueParts.join("(")	// put rest of clue back together
            // and trim it
            while ( clue.length && ( clue[ clue.length - 1 ] == " " ) )
                clue = clue.slice( 0 , clue.length - 1 );
            // trim trailing ')'
            punctuation = punct.slice( 0 , punct.length - 1 );
        }
	var newClue = new xwdClue( self.spotsByLength , clue , punctuation )
	self.clues.push( newClue ) ;
	self.cluesByDirection[ 0 ].push( newClue ) ;
    });
};
 

var xwdNoCursor = true;
