/*
 * crossword - specific javascript code
 * 
 * add-on for html stuff
 * 
 * version 2 - instead of including an .xwd.js file with js defining xwdClues, xwdGrid,
 * 		we include a plain text file in an iframe
 * 
 */
Crossword.prototype.html = function() {
  outStr = '<table class="xwd-grid" border="0" cellspacing="0" cellpadding="2">';
  for ( var y=0 ; y<this.size[ 1 ] ; y++ ) {
    outStr += ( '<tr id="xwdGrid-Row-' + y + '">' )
    for ( var x=0 ; x<this.size[ 0 ] ; x++ ) {
      var cell = this.cells2[ y ][ x ];
      var cellId = ' id="xwdGrid-Cell-' + x + '-' + y + '"'
      if ( cell ) {
	outStr += ( '<td id=' + cellId + '>' );
	outStr += ( '<div class="content">&nbsp;</div>' + ( cell.label || "&nbsp;" ) + '</td>' );
      }
      else {
	outStr += ( '<th id=' + cellId + '> g </th>' );
      }
    }
    outStr += '</tr>';
  }
  outStr += '</table>';
  return outStr;
}

// look for query

var xwdPuzzleName = null;
var url = document.URL;
var qn = url.indexOf( '?' );
if ( qn > -1 ) {
  var query = url.slice( qn + 1 );
  if ( query.length ) {
    xwdPuzzleName = query;
    document.title = xwdPuzzleName;
    // simple approach for now - we'll use whole query string as puzzle name
    var fileName = query
    var el = '<iframe class="xwd-source" src="puzzles/' + fileName + '"></iframe>';
    document.write( el );
    var el = '<object id="obj" class="xwd-source" type="text" data="puzzles/' + fileName + '"></object>';
    document.write( el );
//     // another experiment - the 'import' relation
//     //  (ideally we want to be able to grab files that aren't in .js or .html)
//     var el = '<link rel="import" href="'  + query + '.html">'
//     document.write( el );
  }
}

// document.onload = function() {
// }