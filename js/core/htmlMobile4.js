// MobileElement is a subclass of Element for movable html elements

// Changed since version 3: now based on htmlElement not Element (name change)

// The only new method (for now)
function elementSetXY(xy,uns) {	elementSetXY_.call(this,xy[0],xy[1],uns) }
function elementSetXY_(x,y,uns) {
	this.xy = [x,y]
	uns = (uns || this.units || "")
	this.it.style.left = x + uns
	this.it.style.top  = y + uns
// 		this.setAtts({left:xy[0] + uns,top:xy[1] + uns})  // smarter code but slower
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
	htmlElement.apply(this,elArgs)
	if (xy==null) { xy = [0,0] ; pos = pos || "relative" }
	this.it.style.position = ( this.pos = ( pos = pos || "absolute" ) )
	elementSetXY.call(this,xy,"px")
	}

MobileElement.prototype = new htmlElement
mergeIn( MobileElement.prototype, {
	setXY  : elementSetXY,
	setXY_ : elementSetXY_,
	units:"px"
	} )
