/* Simple single job queue
*
* Next step would be to bundle it into a queue object,
*	and allow several to operate in parallel
*
* 2015	- made length of array for each job variable:
*		- parameters array defaults to []
*		- optional third parameter for context object ("this")
* 	- updated code style ( added ;s , spaces , changed indents )
*/


var jobQueue_jobs = new Array() ;
var stopped = true ;
var step_time = 50 ;

function jobQueue_addJobs(jobss) {
    // queue up jobs to do at subsequent steps
    // and start stepper if necessary
    // jobss is an array of arrays of jobs
    // each job is array [fun,[par,...]] meaning call fun(par,...)
    for (var i=0; i<jobss.length; i++) {
	var jobs = jobss[ i ] ;
	if (jobs) {
	    if ( ! jobQueue_jobs[ i ] ) jobQueue_jobs[ i ] = jobs ;
	    else   jobQueue_jobs[ i ] = jobQueue_jobs[ i ].concat( jobs ) ;
    }	}
    if ( stopped ) { stopped = false ; jobQueue_step() }
}
function jobQueue_clear() {	// cancel waiting jobs
    jobQueue_jobs = new Array() ;
    stopped = true ;
}
function jobQueue_finish() {	// finish jobs (rush)
    while (jobQueue_jobs.length)
	jobQueue_doNextJobs() ;
    stopped = true ;
}

function jobQueue_step() {	// step,  using timeout
    if (jobQueue_jobs.length) {
	jobQueue_doNextJobs() ;
	setTimeout( "jobQueue_step()" , step_time ) ;
    }
    else stopped = true ;  // Stop when run out of jobs
}

function jobQueue_doNextJobs() {
    var jobs = jobQueue_jobs.shift();
    if ( jobs ) {
	for ( var i=0 ; i<jobs.length ; i++ ) {
	    job = jobs[ i ];
	    job[ 0 ].apply( ( job[ 2 ] || null ) , ( job[ 1 ] || [ ] ) ) ;
}   }	}
