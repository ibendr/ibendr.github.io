// DECODE content for pages requiring a key
function clog( s ) { console.log ( s.length , s ) }
b62   =  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' ;
b64   =  b62 + '+/' ;
b64u  =  b62 + '-_' ;
dtoa  =  d => b64[ d ] ;
atod  =  a => b64.indexOf( a ) ;
utod  =  a => b64u.indexOf( a ) ;
utodd =  a => ( utod( a[ 0 ] ) << 6 ) + utod( a[ 1 ] ) ;
pad64 =  s => s + [ '' , '' , '==' , '=' ][ s.length & 3 ] ;
str64 =  s => s.split('').filter( c => b64.includes( c ) ).join('') ;
ciphL = ( s , L ) => ( i = 0 , s.split('').map( a => dtoa( atod ( a ) ^ ( L[ ( i++ ) % L.length ] ^= ( ( i * 7 ) % 61 ) ) ) ) ).join('') ;
ciphX = ( s , x ) => ciphL( s , x.split('').map( utod ) ) ;
function shuf( s , m , c ) {
  var l = s.length ; var j = c % l ; var j1 = j ; var out = '' ;
  for ( var i = 0 ; i < l ; i++ ) {
    out += s[ j ] ; j = (j + m ) % l ;
    if ( j == j1 ) j1 = ( j = ( j + 1 ) % l ) ;
  } return out ;
}
shuff = key => ( s => shuf( s , ( utodd( key ) % s.length ) , utod( key[ 2 ] ) ) ) ;
function decode( src , key ) {
  var shf = shuff( key ) ;
  return window.atob( pad64( shf( ciphX( shf( str64( src ) ) , key.slice( 3 ) ) ) ) ) ;
}
function wr( src ) {
  if ( key = ( new URLSearchParams( window.location.search ) ).get( 'key' ) ) {
    var out = decode( src , key ) ;
    var kl  = key.length ;
    document.write( ( out.slice( - kl ) == key /*|| true */) ? out.slice( 0 , -kl ) : '<h3>KEY ERROR</h3>' ) ;
    }
  else document.write( '<h3>KEY REQUIRED</h3>' ) ;
}
