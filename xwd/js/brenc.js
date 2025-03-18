// DECODE content for pages requiring a key
// see brenc.py for commentary!
b62   =  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
b64   =  b62 + '+/'
b64u  =  b62 + '-_'
dtoa  =  d => b64[ d ] || '='
atod  =  a => b64.indexOf( a )
utod  =  a => b64u.indexOf( a )
utodd = ( a , i = 0 ) => ( b64u.indexOf( a[ i ] ) << 6 ) + b64u.indexOf( a[ i + 1 ] )
str64 =  s => s.split('').filter( c => ( atod ( c ) > -1 ) || ( c == '=' ) ).join('')
ciphX = ( s , x ) => ( i = 0 , s.split('').map( a => dtoa( utod ( x[ ( i++ ) % x.length ] ) ^ atod ( a ) ) ) ).join('')
shuf  = ( s , m , c ) => Array.from( s.split('').keys() ).map( i => s[ ( i * m + c ) % s.length ] ).join('')
shuff = key => ( s => shuf( s , utodd( key , 0 ) , utodd( key , 2 ) ) )
function decode( src , key ) {
  var shf = shuff( key ) ;
  var xors = key.slice( 4 ) ;
  return window.atob( shf( ciphX( shf( str64( src ) ) , xors ) ) ) ;
}
if ( key = ( new URLSearchParams( window.location.search ) ).get( 'key' ) ) {
    it = document.body ;
    src = it.textContent ;
    it.innerHTML = decode( src , key ) ;
}
