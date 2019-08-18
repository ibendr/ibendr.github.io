// Some functions to provide dice rolling, random numbers etc. in html display


function rand( n ) {
	return Math.floor( Math.random() * n );
}
var calMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] ;
var calMonLenSums = [ 31, 59 , 90 , 120 , 151 , 181 , 212 , 243 , 273 , 304 , 334 , 365 ] ;

doFunctions = {
	gored: function( it ) {
		console.log( it ) ; it.style.color = "red" ; 
	} ,
	rolldice: function( it ) {
		var v = rand( 6 ) + 1 ;
		it.innerText = "" + v;
		return v ;
	} ,
	pickdate: function( it ) {
		var d = rand( 365.2425 ) ;
		var m = 0 ;
		for ( var n = 0 ; n < 12 ; n++ ) {
			if ( d < calMonLenSums[ n ] ) { 
				if ( n ) d -= calMonLenSums[ n - 1 ] ;
				m = n + 1 ;
				n = 12 ;
			}
		}
		if ( m == 0 ) {
			m = 2 ;
			d = 29 ;
		}
		var v = calMonths[ m - 1 ] + " " + ( d + 1 ) ;
		it.innerText = v ;
		return v ;
	}
		
}
var theData ;

var betPoss = [
	'reddice' , 'whitedicetotal' , 'orderABC' ,
	'whitediceset' , 'alldicetotal' , 'calmonth' , 
	'orderWXYZ' , 'mysteryalphanum' , 'calday' ,
	'alldice' , 'calmonthday' , 'orderABCorderXYZ'
	] ;
var startScore = 100 ;

function doData() {
// 	var it = theData.split('","') ;
	var it = theDatas ; 
	var i = 0 ;
	while ( i < it.length ) {
		var s = it[ i ] ;
		if ( s.search( "@uysc" ) > 3 ) {
			i += 2
			var nam = s.slice( 0 , 3 ).toUpperCase() ;
			var bts = { } ;
			var cst = 0 ;
			for ( var j = 0 ; j < betPoss.length ; j ++ ) {
				var v = it[ i + 3 * j ] ;
				if ( s ) {
					bts[ betPoss[ j ] ] = v ;
					cst ++ ;
				}
			}
			players.push( { name: nam , bets: bts , cost: cst , score: startScore } )
			i += 3 * betPoss.length - 1 ;
		}
		i ++ ;
	}
}

function init() {
// 	theData = prompt( "Data please..." ) ;
// 	console.log( theData ) ;
	doData() ;
	var scoreboard = document.getElementById( "scoreboard" )
	if ( scoreboard ) {
		for (var k = 0 ; k < players.length ; k++ ) {
			var player = players[ k ] ;
			var scoreEl = document.createElement( 'div' )
			scoreEl.innerHTML = player.name + ':<span id="scoreEl' + player.name + '">' + player.score + '</span>'
			scoreboard.appendChild( scoreEl ) ;
		}
	}
}

var gogoint = 1000 ;
function gogo( interv ) {
	if ( interv ) gogoint = interv ;
	go() ;
	setTimeout( gogo , gogoint ) ;
	gogoint = 20 + Math.floor( ( gogoint - 20 ) * 0.99 ) 
}

function go() {
	// Find all elements that "do" something and get them to
	doers = document.getElementsByClassName("doer") ;
	for (var i = 0 ; i < doers.length; i++) { 
		var doer = doers[ i ] ;
		var doerId = doer.id ; 
		var classes = doer.classList ;
		for (var j = 0 ; j < classes.length ; j++) {
			var cls = classes[ j ] ;
				console.log( cls ) ;
			if ( cls in doFunctions ) {
				var val = doFunctions[ cls ]( doer ) ;
			}
		}
		console.log( doer + ":" + doer.id + ":" + val ) ;
		// var players = doer.players ;
		if ( players && players.length ) {
			for (var k = 0 ; k < players.length ; k++ ) {
				var player = players[ k ] ;
				if ( doerId in player.bets ) {
					playVal = player.bets[ doerId ] ;
					console.log( playVal + "..." + val )
					if ( playVal == val ) {
						player.score += parseInt( doer.getAttribute("worth") ) ;
					}
				}
			}
		}
	}
	if ( players && players.length ) {
	for (var k = 0 ; k < players.length ; k++ ) {
		var player = players[ k ] ;
			player.score -= player.cost ;
			if ( player.score <= 0 ) {
				player.bets = [ ] ; player.cost = 0 ; player.score = 0 ;
				document.getElementById( "scoreEl" + player.name ).style.color = 'red' ;
			}
			document.getElementById( "scoreEl" + player.name ).innerText = player.score ;
		}
	}
}

