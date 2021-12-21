// Drop - and - drag stuff,  with user-defined events

// Changed since version 5: expanded functionality of drop method

// Changed since version 4: now based on htmlElement not Element (name change)
//	although actually,  no change in code here (yet)

// List of elements currently being dragged
var _dragEls=[]
// z-index of last element dragged (keeps getting higher)
var _dragZ=0

function dragElementGrab(xm,ym) {
	// xm,ym are clientX,clientY from mouse event
	// Only do anything if we weren't already dragging the element
	if (!_dragEls.has(this)) {
		// Add to list
		_dragEls.push(this)
		// Record relative mouse position
		this.dragX = this.xy[0]-xm
		this.dragY = this.xy[1]-ym
		// And record old position in case of snap-back
		this.oldX = this.xy[0]
		this.oldY = this.xy[1]
		// Each time an element is grabbed, it comes to the top, above the rest.
		// Instead of changing all the other zIndex's,  we just keep going higher
		this.it.style.zIndex=(++_dragZ)
		if (_dragEls.length==1) {
			// If nothing was being dragged already,  dragMousemove was not being done
			addEventHandler("mousemove",dragMousemove)
			addEventHandler("mouseup",dragMouseup)
			}
		// trigger user-events,  if any defined (e.g. by DropTarget)
		handleEvent("DragElementGrab",{target:this})
	}	}
function dragElementDrop() {
	handleEvent( "DragElementDrop",{target:this} )
	// If not allowed fall off designated targets...
	if (!this.loose) {
		if (!this.dropTargetHit) {
			// snap back to where it had been
			this.setXY( [ this.oldX , this.oldY ] )
	}	}	}
	

// Constructor
function DragElement(elArgs,xy,pos) {
	if (arguments.length==0) return
// 	alert( this.name )
	MobileElement.call(this,elArgs,xy,pos)
	if ( this.addClass ) {  this.addClass( "drag" ) }
	else { /*ad(this) ;*/ }
	}
DragElement.prototype = new MobileElement
mergeIn( DragElement.prototype, {
	loose:true,	// whether to allow drop away from listed targets
	grab:dragElementGrab,
	drop:dragElementDrop  } )

// Mouse event handlers - see event1.js for how event-handling operates.

function dragMousedown(e,it) {
	// Event handler to 'grab' draggable elements when clicked on
	var elOk=false
	// ascend DOM node tree until finding .drag ancestor,  or BODY element or null
	while (it && (!(elOk = elHasClass(it,"drag"))) &&
		it.tagName!="BODY" && (!elHasClass(it,"mousehog"))) {
			it=it.parentNode      }
	// Only proceed if we found a .drag element
	if (it && elOk) {
		var el = it._jsElObj  // get the DragElement object
		el.grab(e.clientX,e.clientY)
		return false  // exhaust event - don't "bubble"
		}
	else return true  // "bubble" event
	}
	
function dragMousemove(e) {
	// Event handler to move elements currently being dragged
	for (var i=0;i<_dragEls.length;i++) {
	    var dragEl = _dragEls[i]
		try {dragEl.setXY([ e.clientX+dragEl.dragX, e.clientY+dragEl.dragY ])}
		catch (e) {aalert("bad drag on "+describe(dragEl)+" : "+describe(e))
			}
		return false
	}	}
function dragMouseup() {
	// Event handler to drop all elements currently being dragged
	while (_dragEls.length) _dragEls.pop().drop()
 	removeEventHandler("mousemove",dragMousemove)
	removeEventHandler("mouseup",dragMouseup)
	return false
	}

function initDragHandlers() {
	initHandler('mouseup')
	initHandler('mousedown')
	initHandler('mousemove')
	addEventHandler('mousedown',dragMousedown)
}
var htmlDrag5_init = initDragHandlers
