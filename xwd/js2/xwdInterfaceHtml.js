/*
 *  Extension of the abstract xwdInterface to specific html setting
 * 
 */

// We'll find out our window dimensions in case that effects our layout
var elDoc = document.documentElement ;
var elBod = document.body || document.getElementsByTagName( 'body' )[ 0 ] ;
var windowSize = [ 
    window.innerWidth  || elDoc.clientWidth  || elBod.clientWidth ,
    window.innerHeight || elDoc.clientHeight || elBod.clientHeight ] ;

// but for now... 
var cellSizePx = [ 36 , 36 ]
var stUnits = "px"
function stSiz( x ) { return Math.round( x ) + stUnits ; }

// Simple shorthand for creating an element with a particular parent and class(es)
// Saves importing full dom module
function elem( tag , pa , clss ) {
    var el = document.createElement( tag ) ;
    if ( pa ) {
	pa.appendChild( el ) ;
	if ( clss ) {
	    if ( ! ( clss instanceof Array ) ) clss = [ clss ] ;
	    clss.forEach( function ( cls ) {
		el.classList.add( cls ) ;
	    } ) ;
	}
    }
    return el ;
}

function xwdInterfaceHtml( elXwd ) {
    if ( !elXwd ) return ;
    var elGrid   = null ;
    var elClues  = null ;
    var elKids   = elXwd.children ;
    var xwdClues, xwdGrid
    // Find the grid and clue elements
    if ( elKids ) {
	for ( var i = 0 ; i < elKids.length ; i++ ) {
	    elKid = elKids.item( i ) ;
	    if      ( elKid.classList.contains( "xwdSolution" ) ||
		      elKid.classList.contains( "xwdGrid" )        )
		elGrid   = elKid ;
	    else if ( elKid.classList.contains( "xwdClues" ) )
		elClues  = elKid ;
	}
    }
    if ( elGrid && elClues ) {
	// read grid and clues
	xwdGrid  =  elGrid.textContent.split("\n") ;
	xwdClues = elClues.textContent.split("\n") ;
	// make the crossword and abstract interface object
	xwdInterface.call( this , xwdGrid , xwdClues )
	this.elHost = elXwd ;
	// Hide original clue list
	elClues.style.display = "none"
	// Make main layout elements
	this.elLay    = elem( 'table' ,   elXwd     , 'layout' ) ;
	this.elLrow   = elem(  'tr'   , this.elLay  ) ;
	this.elGridTd = elem(  'td'   , this.elLrow ) ;
	this.elGrid   = elem(  'div'  , this.elGridTd , 'game-container' ) ;
	this.elGrid.style.width  = this.cellWidth  * this.size[ 0 ] + 1 ;
	this.elGrid.style.height = this.cellHeight * this.size[ 1 ] + 1 ;
	this.elsClues = [ elem(  'td'   , this.elLrow , 'clues-container' ) ,
	                  elem(  'td'   , this.elLrow , 'clues-container' ) ] ;
// 	//temp
// 	cl = elem( 'pre' , this.elsClues[0] )
// 	cl.textContent = elClues.textContent ;
	this.makeHtmlCells() ;
	this.makeHtmlCursor() ;
	this.makeClueBoxes() ;
	this.initCursor() ;	// trigger drawing it
	this.initListeners() ;
    }
}

function cellUpdateHtml( cont ) { //alert ( this + ' , ' + cont )
    this.el.textContent = cont
}
evWatch( xwdCell.prototype , 'content' ) ;
xwdCell.prototype.evWatchFields = { 'content' : [ cellUpdateHtml ] } ;

xwdInterfaceHtml.prototype = new xwdInterface

function currentCluesUpdateHtml( curr ) {
    this.clues.forEach( function( clue ) {
	if ( clue.el ) clue.el.classList.remove( 'highframe' ) ;
    } ) ;
    if ( curr ) {
	curr.forEach( function( clue ) {
	    if ( clue.el ) clue.el.classList.add( 'highframe' ) ;
	} ) ;
    }
}

function cursorSpotUpdateHtml( spot ) {
    self = this
    this.cells.forEach( function( cell ) {
	if ( cell.el ) {
	    if ( self.cursorSpot && cell.inSpots( [ self.cursorSpot ] ) ) {
		  cell.el.classList.add(    'highlight' ) ;
		  cell.el.classList.remove( 'highlight1' ) ;
	    }
	    else if ( cell.inSpots( self.cursorSpots || [] ) ) {
		  cell.el.classList.remove( 'highlight' ) ;
		  cell.el.classList.add(    'highlight1' ) ;
	    }
	    else {
		  cell.el.classList.remove( 'highlight' ) ;
		  cell.el.classList.remove( 'highlight1' ) ;
	    }	       
	}
    } ) ;
}

function cursorCellUpdateHtml( cell ) {
    if ( this.elCursor ) {
	var styl = this.elCursor.style ;
	if ( cell ) {
	    styl.display    = 'block' ;
	    styl.top        = stSiz( cell.pos[ 1 ] * self.cellHeight - 1 ) ;
	    styl.left       = stSiz( cell.pos[ 0 ] * self.cellWidth  - 1 ) ;
	}
	else {
	    styl.display    = 'none' ;	    
	}
    }
}
evWatch( xwdInterface.prototype , 'currentClues' ) ;
evWatch( xwdInterface.prototype , 'cursorSpot' ) ;
evWatch( xwdInterface.prototype , 'cursorSpots' ) ;
evWatch( xwdInterface.prototype , 'cursorCell' ) ;
xwdInterface.prototype.evWatchFields = { 
    'currentClues' : [ currentCluesUpdateHtml ] ,
    'cursorSpot'   : [ cursorSpotUpdateHtml   ] ,
    'cursorSpots'  : [ cursorSpotUpdateHtml   ] ,
    'cursorCell'   : [ cursorCellUpdateHtml   ] } ;

mergeIn( xwdInterfaceHtml.prototype, {
    // settings
    cellWidth:    cellSizePx[ 0 ] ,
    cellHeight:   cellSizePx[ 1 ] ,
    // methods
    makeHtmlCells: function( ) {
	self = this ;
	this.cells.forEach( function( cell ) {
	    // actual cells
	    cell.el     = elem( 'div' , self.elGrid , 'xwdCell' ) ;
	    cell.el.pos = cell.pos ;
	    var styl    = cell.el.style ;
	    styl.top        = stSiz( cell.pos[ 1 ] * self.cellHeight );
	    styl.left       = stSiz( cell.pos[ 0 ] * self.cellWidth  );
	    styl.height     = stSiz( self.cellHeight - 1 ) ;
	    styl.width      = stSiz( self.cellWidth  - 1 ) ;
	    styl.fontSize   = stSiz( self.cellHeight * 0.75 ) ;
	    styl.lineHeight = stSiz( self.cellHeight + 4 ) ;
	    // and labels
	    if ( cell.label ) {
		cell.elLbl  = elem( 'div' , self.elGrid , 'xwdCellLabel' ) ;
		var styl    = cell.elLbl.style ;
		styl.top    = stSiz( cell.pos[ 1 ] * self.cellHeight + 2 ) ;
		styl.left   = stSiz( cell.pos[ 0 ] * self.cellWidth  + 2 ) ;
		styl.height = stSiz( self.cellHeight / 3 ) ;
		styl.width  = stSiz( self.cellWidth  / 3 ) ;
		cell.elLbl.textContent = cell.label ;
	    }
	} ) ;
    } ,
    makeHtmlCursor: function( ) { // red box around current cell
	this.elCursor = elem( 'div' , self.elGrid , 'cellCursor' )
	var styl      = this.elCursor.style ;
	styl.height   = stSiz( self.cellHeight - 3 ) ;
	styl.width    = stSiz( self.cellWidth  - 3 ) ;
	styl.display  = "none" // only display once pos'n set
    } ,
    makeClueBoxes: function( ) {
	this.elsClue = [ [ ] , [ ] ] ;
	for ( var direction = 0 ; direction < 2 ; direction ++ ) {
	    var el    = this.elsClues[ direction ] ;
	    var els   = this.elsClue [ direction ] ;
	    var clues = this.cluesByDirection[ direction ] ;
	    elem( 'h3' , el ).textContent = directionNames[ direction ]
	    clues.forEach( function( clue , i ) {
		var newP = elem( 'div' , el , 'xwdClueBox' ) ;
		newP.textContent = clue.display ;
		newP.sourceClue = [ direction , i ] ;
		clue.el = newP ;
		els.push( newP ) ;
	    }) ;
	}
    } ,
    initListeners: function( ) {
	var self = this ;
	this.elHost.addEventListener("mousedown", function (event) {
	//       alert( event.pageX );
	    this.mouseIsDown = true;
	    this.mousePressedAtX = event.pageX;
	    this.mousePressedAtY = event.pageY;
	    this.mousePressedAtTarget = event.target;
// 	    alert ( event.target.className + ':' + event.pageX + ',' + event.pageY )
	    event.preventDefault();
	});

	this.elHost.addEventListener("mouseup", function (event) {
	    if (!this.mouseIsDown) {
	    return; // Ignore if initial press was before we were listening
	    }
	    this.mouseIsDown = false;
	    var dx = event.pageX - this.mousePressedAtX;
	    var dy = event.pageY - this.mousePressedAtY;
	    var absDx = Math.abs(dx);
	    var absDy = Math.abs(dy);
	    var theTarget = this.mousePressedAtTarget;
	    var pos = theTarget.pos ;
	    if ( pos ) {
		var axis = 0;
		if (Math.max(absDx, absDy) > 10) {
		    var axis =  absDx > absDy ? 1 : 2;
		}
		self.goto( pos[ 0 ] , pos[ 1 ] , axis )
	    }
	    else if ( pos = theTarget.sourceClue ) {
		var clue = self.cluesByDirection[ pos[ 0 ] ][ pos[ 1 ] ] ;
		self.moveCursorToSpot( clue && clue.spots && clue.spots[ 0 ] ) ;
	    }
	    else {
		self.nullCursor( ) ;
	    }
	});
// 	this.elGrid.addEventListener( "mousemove" , function (event) {
// 	    event.preventDefault();
// 	});  
	this.elGrid.addEventListener( "mousedown" , function (event) {
	//       alert( event.pageX );
	    this.mouseIsDown = true;
	    this.mousePressedAtX = event.pageX;
	    this.mousePressedAtY = event.pageY;
	    this.mousePressedAtTarget = event.target;
// 	    event.preventDefault();
	});
	document.addEventListener( "mousedown" , function (event) {
	    self.nullCursor( ) ;
	});
	    // 
	document.addEventListener( "keydown" , function (event) {
	    var extraModifiers = ( event.altKey ? 4 : 0 ) | ( event.ctrlKey ? 2 : 0 ) | ( event.metaKey ? 8 : 0 );
	    var shift = ( event.shiftKey ? 1 : 0 );
	    var modifiers = extraModifiers | shift;
	    var keyCode = event.which;
	//     // debug stuff
	//     keyLog.push( 1000 * modifiers + keyCode );
	//     if ( keyCode == 65 ) alert ( keyLog );
	    // If it's a letter - put it in the grid
	    if ( keyCode >= 65 && keyCode <= 90 ) {
		if (!modifiers) {
		    self.insert( keyCode );
		}
		else {  // unless modifiers - ctrl- gives certain commands
		    if ( event.ctrlKey ) {
			var mapped = keyCtrlAction[ keyCode ];
			if ( mapped ) {
			    if ( mapped in self ) {
				event.preventDefault();
				self[ mapped ].apply( self , [ keyCode , modifiers ] ) ;
			    }
			    else {
				alert( mapped )
			    }
			}
		    }
		}
	    }
	    else {
	    // check for move keys (arrows)
	    var mapped = keyMapMove[ keyCode ];
	    if ( mapped !== undefined ) {
		if ( !extraModifiers ) {
		event.preventDefault();
	// 	  alert( 'move' + ( mapped + ( shift ? 4 : 0 ) ) )
		self.move( mapped + ( shift ? 4 : 0 ) ) ;
		}
		else {
		// check for ctrl- or alt- arrow combinations here
		}
	    }
	    else {
		// Finally check for command keys - Home, End, Del, Esc etc.
		var mapped = keyMapAction[ keyCode ];
		if ( mapped !== undefined ) {
		event.preventDefault();
		self[ mapped ].apply( self , [ keyCode , modifiers ]) ;
		}
	    }
	    }
	});
    }
} ) ;
var keyMapMove = {
    39: 0, // Right
    40: 1, // Down
    37: 2, // Left
    38: 3, // Up

  };

var keyMapAction = {
    27: "quit",
     9: "nextSpot",
    36: "home",
    35: "end",
    46: "clearCell",	// was 'delete'
    13: "enter",
     8: "backUp"
}
var keyCtrlAction = {
    81: "quit",        // Q  - won't do anything!
    82: "clearAll",    // R  "restart"
    83: "revealAll",   // S  "solve"
    84: "nextSpot",    // T  tab
    85: "checkSpot",   // U  unsure
    86: "checkAll"     // V  very unsure
}