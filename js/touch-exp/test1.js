// testing touchscreen interaction

var it = document.getElementById( "mainFrame" ) ;
it.style.height = window.screen.height - 48 ;
var console = document.createElement( 'div' ) ;
it.appendChild( console ) ;
console.write = function( s ) {
  console.appendChild( document.createTextNode( s ) ) ;
  console.appendChild( document.createElement( 'br' ) ) ;
} ;
console.report = function( obj ) {
  s = ' ' ;
  for ( p in obj ) {
    s = s + p + ': ' + obj[ p ] + ';  ' ;
  }
  this.write( s ) ;
}

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
    console.report( touch ) ;
    t = touchTrackers[ touch.identifier ] ;
    // We'll ignore angle for now
    t.style.width  = 10 + 2 * touch.radiusX ;
    t.style.height = 10 + 2 * touch.radiusY ;
    t.style.left   = touch.pageX ;
    t.style.top    = touch.pageY ;
  }
}
function trackEnd( touch , event ) {
  console.write ( touch.pageX + ' , ' + touch.pageY ) ;
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
