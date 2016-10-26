// PLACEMENT

/* Generate functions for placing sequences of items.
Each place<Scheme> function returns a new (anonymous) function,
based on the given parameters, which takes one integer variable
and returns an [x,y] position vector.

Requires : object1  (for func function)

*/

function placeRow(x,y,xd,yd) {  return func(
	"(i) { return ["+x+"+i*"+xd+","+y+"+i*"+yd+"] }" ) }
function placeGrid(x,y,xd,yd,nx) { return func(
	"(i) { return ["+x+"+(i%"+nx+")*"+xd+","+y+"+Math.floor(i/"+nx+")*"+yd+"] }" ) }
function placeArc(x,y,r,n,a1,a2) {
	if  (n==undefined) n=16
	a1 = Math.PI * ( (a1==undefined) ? -1 : (a1/180 - 1) )
	a2 = Math.PI * ( (a2==undefined) ?  1 : (a2/180 - 1) )
	var th=(a2-a1)/n
	return func( "(i) { var th="+a1+"+i*"+th+"; var r="+r+
		"; return ["+x+"-r*Math.sin(th),"+y+"+r*Math.cos(th)] }" ) }
function placeRandom(x,y,w,h) { return func(
	"(i) { return ["+x+"+Math.random()*"+w+","+y+"+Math.random()*"+yd+"] }" ) }
