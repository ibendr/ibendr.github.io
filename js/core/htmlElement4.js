// ELEMENT class : wrapper for a html element
//  the actual DOM object is the field .it

// Discovery as of 24/10/2011 : Element (In Iceweasel at least) is already
//	the name of the class for the actual DOM elements,
//	so our class has been renamed htmlElement

// Mod Aug 2013 - fixed apparent error in lines 40,41


/* Arguments to htmlElement constructor:

el:   if wrapping or cloning existing element:  DOM element object or "_" + element id
      if creating new element:  tag name
parts:   array of items which are each either -
		{ ... , name:val , ... }  : set of attribute values to set on element
		"..."   : content for text node to create and add to element
		[...]   : arguments for a new child element
		htmlElement : already created object to add as child
cloneArgs:  (if cloning)  [ modifier , object ]  function to be called
		(with object as this) on text in all attribute values and text node
		content of clone
getAtts:  (boolean) - whether to fetch attribute values from DOM
getKids:  (boolean) - whether to fetch child elements, text-nodes

*/

function htmlElement(el,parts,cloneArgs,getAtts,getKids) {
	if (arguments.length==0) return // 'empty' constructor for subclass protos
	var it = null
	this.pa = null
	this.atts = {}
	this.kids = []
	var elType = (typeof el)
	if (elType=="object") {
		if ("nodeType" in el) {    // wrap given element
			it = el
		} }
	else if (elType=="string") {
		if (el.charAt(0)=="_") { // fetch by id & wrap
			it = document.getElementById(el.slice(1))
			}
		else {			// create new element
			it = document.createElement(el)
			}
		}
	if (cloneArgs) {
		cloneArgs.splice(0,0,it)
		it = modifiedClone.apply(this,cloneArgs)
		}
	if (it) {
		this.it = it
	it._jsElObj = this
		if (parts) elementAddParts.call(this,parts)
		if (getAtts) {
			// fetch object attributes from DOM
			}
		if (getKids) {
			// fetch children from DOM
			}
		}
  }

// Methods for Element objects

// Sets the attributes (or quasi-attribute - see dom1.js)
//   on the element itself (this.it),  and updates this.atts.
function elementSetAtts(atts) {
	setNodeAttributes(this.it,atts,this.atts) }
// Get attribute - local copy if possible (or force=true to refetch from DOM)
function elementGetAtt(att,force) {
	if ( (!force) && (att in this.atts)) return this.atts[att]
	var out = this.it.getAttribute(att)
	if (out==undefined) out = null
	else this.atts[att] = out
	return out	}

function elementAddChild(x)  {  // x is a js htmlElement object NOT DOM object
	x.setAtts({parent:this.it}) // DOM object parent is DOM object
	x.pa=this		 // JS object parent is JS object
	this.kids.push(x)
  }
function elementAddNewChild() {
		var args = _array(arguments)
		var kid = new htmlElement // gets protoype properties only for now
		htmlElement.apply(kid,args)
		elementAddChild.call( this, kid )
// 		aalert("added a "+kid.it.tagName)
// 		elementAddChild.call( this, newapply(htmlElement,arguments) )
		}
function elementAddParts (parts) {
	// sets attributes,  adds new text nodes and elements
	for (var i=0; i<parts.length; i++) {
		var part=parts[i]
		if ((typeof part)=="string") {		// text node
			this.it.appendChild(document.createTextNode(part))
			/*this.kids.push(part)*/ }
		else if (part instanceof Array) { 	// sub-element - new
			elementAddNewChild.apply(this,part)
			/*this.kids.push(part) */}
		else if (part instanceof htmlElement) {	// htmlElement object
			elementAddChild.call(this,part) }
		else if (part instanceof Object)	// attributes
			elementSetAtts.call(this,part)
	}	}

htmlElement.prototype = {
	setAtts : elementSetAtts,
	getAtt : elementGetAtt,
	addChild : elementAddChild,
	addParts : elementAddParts,
	addNewChild : elementAddNewChild,
	remove : function () {
		if (this.it) {
			// to allow proper garbage collection and avoid memory leakage
			if (this.it.getAttribute("_jsElObj")) // Explorer
				this.it.removeAttribute("_jsElObj")
      			else delete this.it._jsElObj          // Mozilla
    			this.it.parentNode.removeChild( this.it )	// take element out of document
			delete this.it	// AND destroy it (hopefully)
			}
		if (this.pa) this.pa.kids.remove(this)
		},
	empty : function () {     // no guarantee this will work -
		// a browser might keep re-attaching child nodes to an element.
		while (this.it.lastChild) this.it.removeChild(this.it.lastChild) },
	setText : function (t) { setNodeText(this.it,t) },
	hasClass : function (c) { 
		var cs = this.getAtt("class")
		return cs && ( cs.search(new RegExp("\\b"+c+"\\b") ) > -1 )
		},
	addClass : function (c) {
		// We add then class to the space-separated list of classes already there
		var cs = this.getAtt("class")
		if (cs) {	// only add to list if not already there
			if ( cs.search(new RegExp("\\b"+c+"\\b") ) == -1 ) cs += " " + c
			}
		else cs = c
		// The call to setAtts is done even if class was in list already
		//   as it also updates the js copy of element attributes.
		this.setAtts({"class":cs})
		},
	hide : function() { this.it.style.visibility = "hidden" },
	show : function() { this.it.style.visibility = "visible" }
	}

function elHasClass(el,cls) {		// Quick class check for use on elements
                //      that we're not wrapping with Element object.
	var c = el.getAttribute && (el.getAttribute("class"))
	return c && ( c.search(new RegExp("\\b"+cls+"\\b") ) > -1 )
  }


var doc_body
function htmlElement4_init() {
	doc_body = new htmlElement(document.body)
	}
