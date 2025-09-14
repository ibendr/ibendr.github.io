/*

2025 - 
*/

Crossword.prototype.downloadXmlCC = function() {
  const dotPuz = bendrToXmlCC( this );
  if (!dotPuz) {
    return;
  }
  const a = document.createElement("a");
  a.style.display = "none";
  document.body.appendChild(a);
  a.href = window.URL.createObjectURL(
    new Blob([dotPuz], {type: "application/x-crossword"})
  );
  let name = this.puzzleName ?? 'puzzle';
  let author = this.srcParts.Author;
  if ( author ) {
    if ( author.slice(0,3) == 'by ' ) author = author.slice(3);
    name = author + '-' + name;
  }
  a.setAttribute( "download", name + ".xml" );
  a.click();
}
function bendrToXmlSpotXy( spot ) {
  // string like 'x="3" y="4-8"'
  let cells = spot.cells
  let x1y1 = cells[ 0 ].pos;
  let x2y2 = cells[ cells.length - 1 ].pos;
  let out = 'x="' + ( x1y1[ 0 ] + 1 );
  if ( x2y2[ 0 ] != x1y1[ 0 ] )
    out = out + '-' + ( x2y2[ 0 ] + 1 );
  out = out + '" y="' + ( x1y1[ 1 ] + 1 );
  if ( x2y2[ 1 ] != x1y1[ 1 ] )
    out = out + '-' + ( x2y2[ 1 ] + 1 );
  out = out + '"';
  return out;
}
function bendrToXmlPuncSol( clue ) {
  let out1 = clue.spots.map( spot => { return spot.sol ; } ).join( '' );
  let out2 = '';
  let i = 0;
  for ( let l of clue.lengths ) {
    out2 = out2 + ( out2 ? ' ' : '' ) + out1.slice( i , i + l );
    i += l;
  }
  return out2;
}
function bendrToXmlAttSafe( str ) {
    //     make a string safe(r) to put in quotes in an attribute of XML element (where anno goes)
    //     AMPERSAND MUST GO FIRST, otherwise it does the amperand created by other substitution
    const entities = [ ['&','amp'],['<','lt'],['>','gt'],['"','quot'] ] ;
    for ( let ent of entities ) {
	str = str.replaceAll( ent[ 0 ] , '&' + ent[ 1 ] + ';' ) ;
    }
    return str ;
}
function bendrToXmlCC( it ) {
  out = `<?xml version="1.0" encoding="UTF-8"?>\n<crossword-compiler xmlns="http://crossword.info/xml/crossword-compiler">
<rectangular-puzzle xmlns="http://crossword.info/xml/rectangular-puzzle" alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ">\n<metadata>\n`;
	out = out + '<title>' + ( it.puzzleName ?? 'puzzle' ) + '</title>\n';
	out = out + '<creator>' +  ( it.srcParts.Author ?? 'BenDR' ) + '</creator>\n';
	out = out + '<description/>\n<instructions/>\n<copyright/>\n</metadata>\n<crossword>\n';
	out = out + '<grid width="' + it.size[ 0 ] + '" height="' + it.size[ 1 ] + '">\n';
	out = out + '<grid-look numbering-scheme="normal" clue-square-divider-width="0.7"/>';
  // grid cells
  for (let y = 0; y < it.size[ 1 ]; y++) {
    for (let x = 0; x < it.size[ 0 ]; x++) {
	out = out + '<cell x="' + (x+1) + '" y="' + (y+1) + '" ';
	let cell = it.cells2[ y ][ x ];
	if ( cell ) {
	  out = out + 'solution="' + cell.sol + '"';
	  let label = cell.label;
	  if ( label ) {
	    out = out + ' number="' + label + '"';
	  }
	} else {
	  out = out + 'type="block"';
	}
	out = out + '/>\n';
    }
  }
  out = out + '</grid>\n';
  
  // "words" - spots and groups of spots for clue purposes
  //	essentially one per clue if we include "see ..." as clues
  //	(so 2nd half of two-spot entries have their solutions appear twice)
  // easiest to build word and clue sections simultaneously
  let wordLines = [ ];
  let clueLines = [ ];
  for ( let dir = 0 ; dir < 2 ; dir++ ) {
    clueLines.push( '<clues ordering="normal"> <title> <b>' + [ 'Across' , 'Down' ][ dir ] + '</b></title>' );
    for ( let spot of it.spots[ dir ] ) {
      // find all clues that start with this spot (should usually be one, or none if it's a second or later word of entry)
      let clues = it.clues.filter( clue => { return clue.spots && clue.spots[ 0 ] == spot; } );
	// put a 'word' in for each clue, and if no clues on for the spot
      if ( clues.length == 0 ) {
	// no clues starting here (at most a "see..." clue)
	wordLines.push( '<word id="' + ( wordLines.length + 1 ) + '" ' + bendrToXmlSpotXy( spot ) + ' solution="' + spot.sol + '"/>' );
	clueLines.push( 'LINK-CLUE:' + spot.label ); // place-holder that we'll come back to
      } else {
	for ( let clue of clues ) {
	  let line = '<word id="' + ( wordLines.length + 1 ) + '" ' + bendrToXmlSpotXy( spot ) + ' solution="' + bendrToXmlPuncSol( clue ) + '"';
	  if ( clue.spots.length == 1 ) {
	    wordLines.push( line + '/>' );
	  } else {
	    wordLines.push( line + '>' + clue.spots.slice(1).map( spot1 => '<cells ' + bendrToXmlSpotXy( spot1 ) + '/>' ).join('') + '</word>' );
	  }
	  clueLines.push( '<clue word="' + wordLines.length + '" number = "' + spot.label[ 1 ] + '" format="' + clue.punctuation.replace(' ',',') + ( clue.annotation ? '" citation="' + bendrToXmlAttSafe ( clue.annotation ) + '">' : '">' ) ) ;
	  clueLines.push( clue.str + '</clue>' );
	  clue.xmlWordId = wordLines.length;
	}
      }
    }
    clueLines.push( '</clues>' );
  }
   // now go back and do the link clues
  for ( let i = 0 ; i < clueLines.length ; i ++ ) {
    if ( clueLines[ i ].slice( 0 , 10 ) == 'LINK-CLUE:' ) {
      let label = clueLines[ i ].slice( 10 );
      console.log( label );
      let spot = it.spots[ parseInt( label[ 0 ] ) ].filter( spot => ( '' + spot.label == label ) )[ 0 ]
      let clues = it.clues.filter( clue => { return clue.spots && clue.spots.includes( spot ); } );
      let line = '';
      for ( let clue of clues ) {
	if ( line ) line = line + '\n'
	line = line + '<clue word="' + clue.xmlWordId + '" number = "' + spot.label[ 1 ] + '" is-link="1">See ' + clue.spots[ 0 ].display + '</clue>';
      }
      clueLines[ i ] = line ;
    }
  }
  for ( let line of wordLines ) out = out + line + '\n';
  for ( let line of clueLines ) out = out + line + '\n';
  
  out = out + '</crossword></rectangular-puzzle></crossword-compiler>\n'
  return out;
}

