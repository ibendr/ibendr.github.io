var paramDecs  = ( "url=" + document.URL ).split( "?" );
var parameters = {};
paramDecs.forEach( function( paramDec ) {
  var vnn = paramDec.split( "=" ).reverse();
  vnn.slice(1).forEach( function( n ) {
    parameters[ n ] = vnn[ 0 ] });
});
delete paramDecs;