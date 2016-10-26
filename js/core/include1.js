// INCLUDE

/*
June 2015 : version 1 split from include.js

Main changes - 

- incorporated initialising of parameters object
- fixed up some issues with execution order of <module>_init() methods:
  . Sub-included modules now get initialised ahead of their includers'
  . <module>_post_includes() - if present - will be executed after
    the execution of module - and therefore of it's inclusions

This provides a mechanism for including multiple js 'modules'

The usual approach would be to have one script element in a document
with this file as its source,  and then an inline script element
which uses the include() command to include all the required modules.

For larger projects,  a single top-level file (name ending in -inc.js)
would be included which in turn includes all required modules.

Note that any top-level code in the modules (executed straight away)
CANNOT rely on previously included modules being already executed.
Therefore any code with such dependencies should be placed in the
<module>_post_includes function which is called from a <script> element
written into the document (by the include function) but not
encountered until after the <script> elements that implement
those sub-inclusions.

For back-compatibility, <module>_init is still called from document.onload().

For modules with a lot of dependencies,  it is best to have a small top-level
file which only contains an include command,  listing the prerequisites
and finally the 'core' module with the actual new code in it.  This allows
for some more version control also,  although the proliferation of extra
files is a bit of a hassle.
*/

// 2015: added this bit that was previously covered separately in parameters.js ...

// Fetch parameters values from document URL
var parameters = {};
var paramDecs  = ( "url=" + document.URL ).split( "?" );
paramDecs.forEach( function( paramDec ) {
  var vnn = paramDec.split( "=" ).reverse();
  if ( vnn.length == 1 ) vnn = [ true , vnn[ 0 ] ];
  vnn.slice(1).forEach( function( n ) {
    parameters[ n ] = vnn[ 0 ] });
});
delete paramDecs;

var _includes = {}  // list of 'modules' <name>.js included
var _includes_ordered = [] // Added 24/10/2011.
	// Dictionary kept for backward compatibility
	//  and to make 'in' useable (my equivalent .has()
	//  function for Arrays not yet imported.)
var _include_path = "" // where to find .js files

function include() {  // include .js file(s), if haven't already
  for ( var i=0 ; i<arguments.length ; i++ ) {
    var name = arguments[ i ];
    if ( !( name in _includes ) ) {
      document.writeln( '<SCRIPT type = "text/javascript" src = "' +
                      _include_path + name + '.js"></SCRIPT>' );
      document.writeln( '<SCRIPT type = "text/javascript"> postProcess( "' +
                      name + '"); </SCRIPT>' );
      _includes[ name ] = true;
}  }  }

function postProcess( name ) {
  _includes_ordered.push( name );
  callIfExists( name + "_post_includes" );
}
  
function callIfExists( funName , arg ) {
  // Ensure funName is just an identifier, reduce risk of eval()
  if ( funName.search( /\W/ ) > -1 ) return null;
  try {  // Q: is there a better way to check if a variable exists?
    var fun = eval( funName );
  }
  catch ( e ) { // no function of that name
    return null; }
  if ( ( fun ) && ( typeof fun == "function" ) ) {
    try {  return fun( arg );
    }
    catch ( e ) {
      alert( e )  // function defined but threw error
  } }
}

function include_init() {
// call <name>_init (if it exists) for every included module
// Q : can we guarantee that this will be in the intended order?
// A : Yes,  now that we switch to using the array not the dictionary
//   for (var inc in _includes) {
  _includes_ordered.forEach( function ( inc ) {
    callIfExists( inc + "_init" );
  }
}

window.onload = include_init;
