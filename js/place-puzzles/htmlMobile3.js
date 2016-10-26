// MobileElement is a subclass of Element for movable html elements

// The only new method (for now)
function elementSetXY(xy,uns) {
		this.xy = xy.slice(0)
		uns = (uns || this.units || "")
		this.it.style.left = xy[0] + uns
		this.it.style.top  = xy[1] + uns
	}
/*	The optional pos argument is used for the CSS2 (style) 'position' attribute.
	- absolute (default):  .left, .top dictate position,  element doesn't affect layout
	- fixed:	like absolute,  but fixed to viewport not document
	- relative:	gets rendered by normal layout manager,
		then setting .top and .left dictate it's position relative to where laid out.
	    (relative becomes default when xy not set)
*/
function MobileElement(elArgs,xy,pos) { // alert([el,atts,xy,pos,mod])
	if (arguments.length==0) return
	Element.apply(this,elArgs)
	if (xy==null) { xy = [0,0] ; pos = pos || "relative" }
	this.it.style.position = ( this.pos = ( pos = pos || "absolute" ) )
	elementSetXY.call(this,xy,"px")
	}

MobileElement.prototype = new Element
mergeIn( MobileElement.prototype, {
	setXY : elementSetXY,
	units:"px"
	} )
