// Rubikword - ticker for animations

// Two models...

// 1. simple ticker with set interval
var tickRunning = false ;
var tickInterval = 100 ; // ms
function tickTick() {
    // the main ticker cycle - used internally
}




// 2. event queuer with arbitrary timings

const now = ( () => ( new Date().getTime() ) );

// var masterCount = 0 ;

// //start with a forever away job marking end of queue
// var jobQueue = [ [ now() * 2 , null ] ] ;
var jobQueue = [ ] ;
var jobQueueDoing = false ;
// each entry in the queue is a pair [ t , j ]
//	t = time it's scheduled to be done ( in ms time as returned by now() )
//	j = job (object)

// main internal function - do top job on queue, or if not time yet set timer to come back when it (nearly) is
function jobQueueDo() {
//     masterCount ++ ;
//     if ( masterCount > 20 ) return;
    // we could set a timeout to come back and check later when queue is empty, but
    //  this shouldn't be necessary because launching any new action involves restarting
    if (jobQueueDoing) console.log("DOUBLE UP!"); // debugging (obviously!)
    if ( jobQueue.length ) {
	jobQueueDoing = true ;
	let j = jobQueue[ 0 ] ;
	let toGo  = j[ 0 ] - now() ;
// 	console.log( j[ 0 ] , toGo ) ;
	if ( toGo > 50 ) {
	    // we're early - come back closer to time - aim for 30ms ahead of schedule
	    jobQueueDoing = false ;
	    setTimeout( jobQueueDo , toGo - 20 ) ;
	}
	else {
	    // if within 50ms of target time (or behind schedule), just do it
	    // remove from queue
// 	    console.log(jobQueue);
	    jobQueue.splice( 0 , 1 );
// 	    console.log(jobQueue);
	    // and do
	    jobQueueDoing = false ;
	    j[ 1 ].doIt( ) ;
	}
    }
}

// actual class ... 
class jobQueueJob {
    f ; i ; n ; ft ;
    constructor( f , t , n , ft ) {
	// set it all up
	this.f  = f ;
	this.i  = 0 ;
	this.n  = n ;
	let t0 = now() ;
// 	console.log(t0)
	this.ft = ft ? ( i => t0 + ft( i ) ) : ( i => t0 + i * t ) ;
	// in normal case using t not ft, first call is already due, and we could
	// enhance efficiency by testing for that, but keeping it general...
	this.queue( ) ;
    }
    queue( ) {
	// queue next call
	// calculate when it's due
	let t = this.ft( this.i ) ;
// 	console.log( t )
	// find spot in queue (which is in order!)
	let done = false ;
	for ( let k in jobQueue ) {
	    if ( t < jobQueue[ k ][ 0 ] ) {
		jobQueue.splice( k , 0 , [ t , this ] ) ;
		done = true ;
		continue ;
	    }
	}
	// if reached end of queue, must go after the rest
	if (!done) jobQueue.push( [ t , this ] ) ;
	// now check if anything needs doing - often this job!
	jobQueueDo( ) ;
    }
    doIt( ) {
	// call the function, increment counter, queue next call if necessary
	let cont = this.f( this.i ) ;
	this.i += 1 ;
	if ( ( this.n && ( this.i < this.n ) ) || cont ) {
	    // if continuing, schedule the next one
	    this.queue() ;
	}
	else jobQueueDo( ) ;
    }
}	    
	  
