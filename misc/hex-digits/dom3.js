// NODE
var dom3_xml_NS = { href: "http://www.w3.org/1999/xlink" }
var dom3_special_attributes = { parent: dom3_set_parent }

function dom3_make(elN) {	// document.createElement - with start values
	var el=document.createElement(elN)
	var pars = new Array();
	for (var i = 1; i<arguments.length; i++)
		pars.push(arguments[i]) // manual slice!
//	var pars = arguments.slice(1)	 // (should've worked but didn't)
	dom3_setAs(el,pars)
	return el;	

}
function dom3_setAs(el,args) {
	for (var i=0; i<args.length; i++) {
		var n = args[i++];
		var v = args[i];
		if (n in dom3_xml_NS) {	// list of attributes requiring NameSpace
			el.setAttributeNS(dom3_xml_NS[n],n,v)	}
		else	{ 
			if (n in dom3_special_attributes) { // special treatment list
				dom3_special_attributes[n](el,v) }
			else {
				el.setAttribute(n,v) }
			}
	}	}
function dom3_kill(x) {	x.parentNode.removeChild( x ) }
function dom3_empty(x) { 	while (x.lastChild) x.removeChild(x.lastChild) }
function dom3_get(x) { return document.getElementById(x) }
function dom3_set_text(el,t) {
	el.removeChild(el.firstChild)
	el.appendChild(document.createTextNode(t))
	}
function dom3_set_parent(el,ma) {	ma.appendChild(el) }