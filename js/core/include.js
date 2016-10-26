// INCLUDE

/*

This provides a mechanism for including multiple js 'modules'

The usual approach would be to have one script element in a document
with this file as its source,  and then an inline script element
which uses the include() command to include all the required modules.

For larger projects,  a single top-level file (name ending in -inc.js)
would be included which in turn includes all required modules.

Note that any top-level code in the modules (executed straight away)
CANNOT rely on previously included modules being already executed.
Therefore any code with such dependencies should be placed in the
<module>_init function which is called after the document is loaded.

June 2015: The following may issue may be solveable by having
the include routine write a command to call the module's init
function into the document. Then sub-included modules still won't
have been executed or initialised before their parent is
executed, but will be initialised before the parent.
This change will be in include1.js

These initialising routines will be called in the order that the modules
were included,  which may still be counter-intuitive in that a module
which includes others will be listed ahead of them,  and therefore will
not have them initialised first.

For example...  bar includes foo and uses it's routines...

bar.js:
	include("foo")

	function bar_init() {  ... use something defined in foo_init ... }

won't work because foo_init won't be executed until after bar_init.  But it
will work if either (a) the thing used in bar_init() is defined in foo but
outside of foo_init() or (b) foo is included by the parent module ahead of bar

master-inc.js:
	include( ...,"foo","bar",... )

Using this latter workaround means clearly labelling any such dependencies
so that the right includes are done in the right order in the master module.

For modules with a lot of dependencies,  it is best to have a small top-level
file which only contains an include command,  listing the prerequisites
and finally the 'core' module with the actual new code in it.  This allows
for some more version control also,  although the proliferation of extra
files is a bit of a hassle.
*/

var _includes = {}  // list of 'modules' <name>.js included
var _includes_ordered = [] // Added 24/10/2011.
	// Dictionary kept for backward compatibility
	//  and to make 'in' useable (my equivalent .has()
	//  function for Arrays not yet imported.)
var _include_path = "" // where to find .js files

function include() {  // include .js file(s), if haven't already
  for (var i=0; i<arguments.length; i++) {
    var name = arguments[i]
    if (!(name in _includes)) {
      var html =  '<SCRIPT type = "text/javascript" src = "' +
                      _include_path + name + '.js"></SCRIPT>'
      // alert(html)
      document.writeln(html)
      _includes[name]=true
      _includes_ordered.push(name)
  }  }  }
  
function include_init() {/*alert( _includes_ordered );*/
// call <name>_init (if it exists) for every included module
// Q : can we guarantee that this will be in the intended order?
// A : Yes,  now that we swirch to using the array not the dictionary
//   for (var inc in _includes) {
   for (var i=0; i<_includes_ordered.length; i++) {
    var inc = _includes_ordered[i]
    try {  // Q: is there a better way to check if a variable exists?
      var incinit = eval( inc + "_init" )
      }
    catch (e) { // no init defined - not an error
      incinit = null }
    if (incinit) if (typeof incinit == "function") {
// 	aalert( "Calling " + inc + "_init")
      try {  incinit()  }
      catch (e) {
        ad(e)  // init defined but threw error
      } }
  } }
window.onload = include_init;
