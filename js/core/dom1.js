// DOM

/* Scripts for interacting with the html document via the
Document Object Model (DOM)
*/

// Section 1 : access to elements

// We can define custom behaviours for particular
// attributes names,  effectively defining quasi-attributes.

var dom_special_attribute_sets = {
	parent  : function (el,x,ma) { ma.appendChild(el) },
	classes : function (el,x,cs) { el.setAttribute(cs.join(" ")) }
	}
var dom_special_attribute_gets = {     	// not yet used
	parent  : function (el,x) { return el.parentNode },
	classes : function (el,x) { return el.getAttribute("class").split(" ") }  
	}

// And check for attributes to be set on elements style object instead
//  of directly on the element object

var dom_style_attributes = [ "display" ]

function setNodeText(it,t) {
	if (it.textContent==undefined) { // IE workaround
		it.innerText = t }
	else it.textContent = t  }

function setNodeAttributes(node,atts,obj) {
	// atts is { ... , name:value , ... }
	// obj is optional parameter ... object to also modify
	for (nam in atts) {
		var val = atts[nam]
		if (nam in dom_special_attribute_sets)
			dom_special_attribute_sets[nam](node,nam,val)
		// else if (nam in dom_style_attributes) node.style[nam] = val
		else	node.setAttribute(nam,val)
		if (obj) obj[nam] = val
	}	}

function elHasClass(el,cls) {
		// Quick class check for use on elements
    //      that we're not wrapping with Element object.
	var c = el.getAttribute && (el.getAttribute("class"))
	return c && ( c.search(new RegExp("\\b"+cls+"\\b") ) )
}

function map2obj(map) {
	// Convert a DOM NamedNodeMap OF ATTRIBUTE NODES
	// into a { ...,nam:val,... } js object
	out = new Array
	for (var i=0; i<map.length; i++) {
		var attr=map[i]		// attribute node
		out[attr.name]=attr.value	}
	return out	}

// Section 2 : Cloning


function modifiedClone(el,mod,obj,disp) {
// Clone element el,  and modify descendant attributes with function mod
//  (called in context of object obj) and set display to disp (e.g. "block")
	var it=el.cloneNode(true)	// deep clone - include children
	if (disp) it.style.display = disp
	if (mod) modifyNode(it,mod,obj)
	return it
  }

//which type of nodes are modified by default
var defaultModTypes=[2,3,4] // Attribute, Text, CDATA

function modifyNode(nod,mod,obj,modTypes) {
// Recursive function to modify a node's attributes and its descendants'.
// Not ideal to use in IE,  which adds about 100 extra attributes to things,
//  some of which could cause problems on attempted modification
// If modTypes is set,  only child nodes of the listed types will be recursed
//  into.  See DOM documentation for node type numbers.
  nodType = nod.nodeType
  if ((modTypes||defaultModTypes).has(nodType)) {
    if (nod.nodeValue) {
			try {	nod.nodeValue = mod.call(obj,nod.nodeValue) }
				catch (e) {
					// Uncomment at your peril! - many read-only att's in IE
          // alert ( "Failed to modify "+nod.nodeName+
					//   ", value: "+nod.nodeValue+"  ...   "+e )
    } } }
	else {
    if (nodType==1) { // means node is Element
		  var atts=nod.attributes
		  if (atts) if (atts.length) if (atts.item) {
			  for (var i=0; i<atts.length; i++) {
	        modifyNode(atts.item(i),mod,obj)
			  }
		  }
		  var kids=nod.childNodes
		  if (kids) if (kids.length) if (kids.item)  {
			  for (var i=0; i<kids.length; i++)
				  modifyNode(kids.item(i),mod,obj)
			  }
		  }
    else { /* alert(nodType) */ }
  }
}
