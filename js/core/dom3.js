// DOM

/* Scripts for interacting with the html document via the
Document Object Model (DOM)

Stripped back since version 2 - cloning stuff taken out
*/

// Section 1 : access to elements

// We can define custom behaviours for particular
// attributes names,  effectively defining quasi-attributes.

var dom_special_attribute_sets = {
	parent  : function (el,x,pa) { pa.appendChild(el) },
	classes : function (el,x,cs) { el.setAttribute(cs.join(" ")) }
	}
var dom_special_attribute_gets = {     	// not yet used
	parent  : function (el,x) { return el.parentNode },
	classes : function (el,x) { return el.getAttribute("class").split(" ") }  
	}

// And check for attributes to be set on an element's style object instead
//  of directly on the element object itself.
// Note that this list is FAR from comprehensive
//	- attributes will have to be added as needed

var dom_style_attributes = [ "display","background","left","top","width","height",
		"visibility","color","z-index", "overflow","position" ]

function setNodeText(it,t) {
	if (it.textContent==undefined) { // IE workaround
		it.innerText = t }
	else it.textContent = t  }

function setNodeAttributes(node,atts,obj) {
	// atts is { ... , name:value , ... }
	// obj is optional parameter ... attribute dictionary to also modify
	for (nam in atts) {
		var val = atts[nam]
		if (nam in dom_special_attribute_sets)
			dom_special_attribute_sets[nam](node,nam,val)
		else if (dom_style_attributes.has(nam)) node.style[nam] = val
		else	node.setAttribute(nam,val)
		if (obj) obj[nam] = val
	}	}

function elHasClass(el,cls) {
	// Quick class check for use on elements
	//      that we're not wrapping with Element object.
	var c = el.getAttribute && (el.getAttribute("class"))
	return c && ( c.search(new RegExp("\\b"+cls+"\\b") ) > -1 )
}

function map2obj(map) {
	// Convert a DOM NamedNodeMap OF ATTRIBUTE NODES
	// into a { ...,nam:val,... } js object
	out = new Array
	for (var i=0; i<map.length; i++) {
		var attr=map[i]		// attribute node
		out[attr.name]=attr.value	}
	return out	}

