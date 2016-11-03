// testing touchscreen interaction

var it = document.getElementById( "mainFrame" ) ;
it.style.height = window.screen.height - 48 ;
var console = document.createElement( 'div' ) ;
it.appendChild( console ) ;
console.write = function( s ) {
  var txt = document.createTextNode( s ) ;
  console.appendChild( s ) ;
  console.appendChild( document.createElement( 'br' ) ) ;
} ;

var touchTrackers = { } ;

function trackStart( touch , event ) {
  trackEnd( touch , event ) ;
  var t = document.createElement( 'div' ) ;
  t.classList.add( "touchTracker" ) ;
  document.body.appendChild( t ) ;
  touchTrackers[ touch.identifier ] = t ;
  trackMove( touch , event )
}
function trackMove( touch , event ) {
  if ( touch.identifier in touchTrackers ) {
    t = touchTrackers[ touch.identifier ] ;
    // We'll ignore angle for now
    t.style.width  = event.radiusX ;
    t.style.height = event.radiusY ;
    t.style.left   = event.pageX ;
    t.style.top    = event.pageY ;
  }
}
function trackEnd( touch , event ) {
  console.write ( touch ) ;
  if ( touch.identifier in touchTrackers ) {
    document.body.removeChild( touchTrackers[ touch.identifier ] ) ;
  }
}
function fNull( ) {
}
var actions = { touchstart : trackStart , touchmove : trackMove , touchend : trackEnd } ;
function TouchHandler(event) {
  event.preventDefault() ;
  var touches = event.changedTouches ;
  var action = actions[ event.type ] || fNull
  for (var i = 0; i < touches.length; ++i) {
    var touch = touches[i] ;
//    var touchId = touch.identifier  ;
    action( touch , event) ;
  }
}
var b = document ; 
b.ontouchstart = b.ontouchmove = b.ontouchend = TouchHandler ;
