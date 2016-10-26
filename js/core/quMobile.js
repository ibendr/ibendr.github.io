// Combines functionality of mobile html elements with jobQueue

// Hence depends on htmlMobile, htmlElement, dom and jobQueue

// rewrap setXY to put object in arguments and integerize arguments
function _setXY(obj,x1,y1) { obj.setXY( [Math.floor(x1),Math.floor(y1)] ) }

// Send an object to a new position,  over time
function slideTo(obj,dest,t) {
	var x0 = obj.xy[0]
	var y0 = obj.xy[1]
	var xd = dest[0] - x0
	var yd = dest[1] - y0
	// If time not specified,  use 2 x distance
	if (t==undefined) t=xd+yd /*t=2*Math.sqrt(xd*xd+yd*yd)*/
	if (t<1) t=1
	var xv = xd / t
	var yv = yd / t
	var jobss = []
	for (var i=Math.floor(t); i>=0; i--)
		jobss.push([[_setXY,[obj,dest[0]-i*xv,dest[1]-i*yv]]])
// 	alert(jobss)
	jobQueue_addJobs(jobss)
	}