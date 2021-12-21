/*  DropTarget is a MobileElement (doesn't actually move usually)
	which acts as a target for draggable elements (DragElement) to
	be dropped on.  Responds to a user-defined event fired by the
	dropping of a DragElement.
*/

function DropTarget(mobElArgs,range,snapTo) {
	// snapTo is coordinates (relative to object) to snap dropped object to
	//	leave undefined for no snapping.
	if (arguments.length==0) return
	MobileElement.apply(this,mobElArgs)
	// List of items that have been dropped on this,  and not removed
	this.drops = new Array()
	if (range==undefined) range= [-20,-20,20,20]
	if ((typeof range)=="number") range=[-range,-range,range,range]
	if (range.length==2) range=[-range[0],-range[1],range[0],range[1]]
	this.range = [this.xy[0]+range[0],this.xy[1]+range[1],
	              this.xy[0]+range[2],this.xy[1]+range[3]]
	if ( this.snap = (snapTo!=undefined) ) {
		if ((typeof snapTo)=="number") snapTo = [snapTo,snapTo]
		this.snapTo = snapTo || [0,0] }
	this.addClass("target")
  }
DropTarget.prototype = new MobileElement
mergeIn(DropTarget.prototype, {		// does nothing for now
	} )
// Event handlers to check whether a DragElement is being dropped on
// or removed from a DropTarget on its list of targets.
function checkDropTargetOn(e,t) {
	if (t.dropTargets!=undefined) { /*alert(t.dropTargets)*/
		var hit = null,targets = t.dropTargets
		for (var i=targets.length-1; i>=0; i--) {
			var targ=targets[i]
			if ( (t.xy[0] > targ.range[0]) && (t.xy[0] < targ.range[2]) &&
			     (t.xy[1] > targ.range[1]) && (t.xy[1] < targ.range[3]) ) {
					hit = targ   // flag target hit
					i = -1 		 //  and terminate loop
			}   }
		if (hit) {
			hit.drops.remove(t)  // avoid duplicates
			hit.drops.push(t)   // but ensure this one on top
			t.dropTargetHit = hit
			// Snap
			if (hit.snap) t.setXY([hit.xy[0]+hit.snapTo[0],hit.xy[1]+hit.snapTo[1]])
			handleEvent("PieceMoved",{target:t} )
		}	}
	return true	// pass on event for other handlers
	}
function checkDropTargetOff(e,t) {
	if (t.dropTargetHit!=undefined) {
		t.dropTargetHit.drops.remove(t)
		delete t.dropTargetHit
		}
	return true	// pass on event for other handlers
	}
addEventHandler("DragElementDrop",checkDropTargetOn)
addEventHandler("DragElementGrab",checkDropTargetOff)

