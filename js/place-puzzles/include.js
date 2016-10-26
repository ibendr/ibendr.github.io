// INCLUDE

var _includes = {}  // list of 'modules' <name>.js included
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
  }  }  }
  
function include_init() {
// call <name>_init (if it exists) for every included module
  for (var inc in _includes) {
    try {  // Q: is there a better way to check if a variable exists?
      var incinit = eval( inc + "_init" )
      if (incinit) if (typeof incinit == "function") incinit()
      }
    catch (e) { //  ad(e)
      }
  } }
window.onload = include_init;
