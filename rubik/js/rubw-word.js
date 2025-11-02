// word manipulation

const	ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' ;
const	inABC = ( c => ABC.includes( c ) ) ;
// const	inABC = ( c => ABC.indexOf( c ) > - 1 ) ;
var wordsLen = [ ];
// word lists wl[ len ] should be populated as required after this

const isWord =   w => ( wordsLen[ w.length ].includes( w ) ) ;

function wFilt( str ) {
    // extract from word list matches for str, treating any non-alpha characters as wildcards
    let len    = str.length ;
    let checks = range( len ).filter( i => inABC( str[ i ] ) ).map( i => [ i , str[ i ] ] ) ;
    return rawFilt( len , checks ) ;
}

function rawFilt( len , checks ) {
    // filter from word list length len , doing 
    // checks - array of checks [ index , char ]
    let ws = wordsLen[ len ] ;
    if ( ws ) {
	return wordsLen[ len ].filter( w => {
	    for ( let [ i , c ] of checks ) {
		if ( w[ i ] != c ) return false ;
	    }
	    return true ;
	} ) ;
    }
}
	    
    

