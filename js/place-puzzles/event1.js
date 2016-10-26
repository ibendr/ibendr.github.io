// EVENTS

// requires : array1

// event handlers are functions f(e,t) where e is event object
//  (as passed by DOM in the case of html events,  available for
//  custom use for user-defined events) and t is the
//  target/source element.  f should return true if the event
//  should still be handled by other (previously added) handlers.

var eventHandlers=new Object()

function addEventHandler(name,fun,force,posn) {
	// (You will need to use initHandler first to intercept DOM events)
	// force=true makes handler be added even if it already has been (allows duplicate)
	// By default the newest added handlers are called first.  To override this,
	//  set posn to intended place in list for newly added handler - 0 is last executed.
	if (!(name in eventHandlers)) eventHandlers[name]=new Array()
	if ( (!eventHandlers[name].has(fun)) || force) {
		if (posn!=undefined) eventHandlers[name].splice(posn,0,fun)
		else eventHandlers[name].push(fun)
	}	}
function removeEventHandler(name,fun) { 
	if (!(name in eventHandlers)) { // error!
		alert("ERROR: tried to remove handler for "+name+" event - none defined.")
		}
	else eventHandlers[name].remove(fun)
	}

function initHandler(name,nonDoc) {
	// set nonDoc = true for user-generated events with no DOM listener
	var preex=null
	if (!nonDoc) {
		preex=eval('document.on'+name)
		eval('_on'+name+'=function(e) { return handleEvent("'+name+'",e) }')
		eval('document.on'+name+'=_on'+name)
	  }
	eventHandlers[name] = preex ? new Array(preex) : new Array()
	}

function handleEvent(name,e,t) {
// Handle event of given name
// e is event object (as passed by DOM)
// t (optional) is target - save wrapping it in e for user-defined events
	if (name in eventHandlers) {
		var hans=eventHandlers[name]
		if (hans.length) {
			if (e==undefined) e = window.event
			if (t==undefined) t = e.target || e.srcElement
			for (var i=hans.length-1; i>=0; i--) {
				var f=hans[i]
				if (!f(e,t,name)) return false
		}	}	}
	return true
	}

