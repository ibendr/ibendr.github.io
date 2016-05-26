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

function xwdInitAll( ) { //alert('init')
    var xwdEls = document.getElementsByClassName( "xwd" ) ;
  //  alert (xwdEls);
    var xwds = [ ] ;
    if ( xwdEls ) {
	for ( var i = 0 ; i < xwdEls.length ; i++ ) {
	    xwds.push(  new xwdInterfaceHtml( xwdEls.item( i ) ) ) ;
	}
    }
    return xwds ;
}

function xwdInterfaceHtml( elXwd ) {
    if ( !elXwd ) return ;
    var  elKids   = elXwd.childNodes ;
//     var  xwdClues, xwdGrid
    // Find all child elements that are types of xwd information
    var  xwdParts = [ "Solution" , "Grid" , "Clues" , "Info" ] ;
    var  elsParts = { } ;
    this.srcParts = { } ;
    var self = this ;
    var raw = true ;  // raw if no labelled parts
    if ( elKids ) {
	for ( var i = 0 ; i < elKids.length ; i++ ) { 
	    var elKid = elKids.item( i ) ;//alert( elKid.className) ;
	    var thePartName = null ;
	    if        ( elKid.nodeType == elKid.ELEMENT_NODE ) {
		xwdParts.forEach( function( partName ) { //alert( partName ) ;
		    if ( elKid.classList.contains( 'xwd' + partName ) ) {
			thePartName = partName ;
			raw = false ;
		    }
		} ) ;
	    } // Instead of class-labelled elements,  we can put
	    // clues straight in as free text and solution/info as CDATA
	    else if ( ( elKid.nodeType == elKid.COMMENT_NODE ) ||
		      ( elKid.nodeType == elKid.CDATA_SECTION_NODE ) ) {
		thePartName = "CData" ;
	    }
	    else if   ( elKid.nodeType == elKid.TEXT_NODE ) {
		thePartName = "Text" ;		
	    }
	    if ( thePartName ) {
		elsParts[ thePartName ] = elKid ; // probably unused
		var lines = elKid.textContent.split("\n") ;
		if ( thePartName == "CData" )
			lines = lines.splice( 1 , lines.length - 2 ) ;
		self.srcParts[ thePartName ] = lines ;
	    }
	}
    }
    if ( raw ) { 
	if ( this.srcParts.CData ) {
	    this.srcParts.Info  = this.srcParts.CData ;
	    this.srcParts.Clues = this.srcParts.Text  ;
	}
	else {
	    this.srcParts.Info  = this.srcParts.Text  ;
	}
    }
    if ( this.srcParts.Info ) {
	this.readInfo( this.srcParts.Info ) ;	
    }
    if ( !this.srcParts.Grid ) this.srcParts.Grid = this.srcParts.Solution ;
    if ( !this.srcParts.Name ) {
	var url = document.URL;
	// take the puzzle name to be the filename stripped of path and (last) extension
	this.puzzleName = url.slice( url.lastIndexOf('/') + 1, url.lastIndexOf('.') ) || "Puzzle";
    }
    if ( this.srcParts.Grid && this.srcParts.Clues ) { 
	// make the crossword and abstract interface object
	xwdInterface.call( this , this.srcParts.Grid , this.srcParts.Clues )
	this.elHost = elXwd ;
	// Hide original clue list - if it was it's own element
	if      ( elsParts.Clues ) elsParts.Clues.style.display = "none" ;
	else if ( elsParts.Text )  elsParts.Text.textContent = "" ;
	// Make main layout elements
	this.elLay    = elem( 'table' ,   elXwd     , 'layout' ) ;
	this.elLrow   = elem(  'tr'   , this.elLay  ) ;
	this.elGridTd = elem(  'td'   , this.elLrow ) ;
	this.elHeader = elem(  'div'  , this.elGridTd , 'xwdHeader' ) ;
	this.makeHeading( ) ;
	this.elGrid   = elem(  'div'  , this.elGridTd , 'game-container' ) ;
	this.elGrid.style.width  = this.cellWidth  * this.size[ 0 ] + 1 ;
	this.elGrid.style.height = this.cellHeight * this.size[ 1 ] + 1 ;
	this.elFooter = elem(  'div'  , this.elGridTd , 'xwdFooter' ) ;
	this.makeButtons( ) ;
	this.elsClues = [ elem(  'td'   , this.elLrow , 'clues-container' ) ,
	                  elem(  'td'   , this.elLrow , 'clues-container' ) ] ;
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
    readInfo: function ( lines ) {
	// parse miscellaneous info from an array of strings
	var srcParts = this.srcParts ;
	// if no heading, we assume straight into the solution
	var partName = "Solution" ;
	lines.forEach( function( line , i ) {
	    var j = line.indexOf( ':' )
	    if ( j > -1 ) {
		// label for another part
		partName = line.slice( 0 , j ) ; // read new part name
		line =     line.slice( j + 1 ) ; // and data after colon
	    }
	    if ( line ) { //alert ( partName + ':' + line );
		if ( !srcParts[ partName ] )
		    srcParts[ partName ] = [ ] ;
		srcParts[ partName ].push( line ) ;
	    }
	}) ;
    },
    makeHeading: function( ) {
	if ( this.srcParts.Name ) {
	    var elHeading = elem( "h2" , this.elHeader , "xwdPuzzleName" ) ;
	    elHeading.textContent = this.srcParts.Name[ 0 ] ;
	}
    },
    buttons: [
	 [ "Reveal Word"   ,    "revealSpot"   ,   "P" , "Peek" ] ,
	 [ "Reveal  ALL"   ,    "revealAll"    ,   "Q" , "Quit" ] ,
	 [ "Clear Word"    ,    "clearSpot"    ,   "R" , "Rub" ] ,
	 [ "Clear  ALL"    ,    "clearAll"     ,   "S" , "Start Again" ] ,
	 [ "Check Word"    ,    "checkSpot"    ,   "U" , "Unsure" ] ,
	 [ "Check  ALL"    ,    "checkAll"     ,   "V" , "Verify" ]    ] ,
    makeButtons: function( ) {
	var self = this ;
	this.elButtons = []
	var unitW = this.elFooter.clientWidth / 16 ;
	this.buttons.forEach( function( button , i ) {
	    var newEl  = elem( 'div' , self.elFooter , 'xwdButton' ) ;
	    var styl   = newEl.style ;
	    styl.width = stSiz( unitW * 4 ) ;
	    styl.top   = stSiz( 12 + ( i & 1 ) * 45 ) ;
	    styl.left  = stSiz( unitW * ( 1 + 5 * ( i & 6 ) / 2 ) ) ;
	    newEl.textContent = button[ 0 ] ;
	    var callback = self[ button[ 1 ] ] ;
	    newEl.onclick = function( e ) { callback.apply( self , [ ] ) ; } ;
	    self.elButtons.push( newEl ) ;
	}) ;
	    // hover text
	this.buttons.forEach( function( button , i ) {
	    var newEl2  =  elem( 'div' , self.elButtons[ i ] , 'hoverHint' ) ;
	    newEl2.textContent = "ctrl-" + button[ 2 ] + ' : "' + button[ 3 ] + '"' ;
	    newEl2.style.zIndex = "1" ;
	}) ;
    },
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
	    var theTarget = this.mousePressedAtTarget; //alert (theTarget.className)
	    if ( theTarget.classList.contains( 'xwdButton' ) ) {
// 		event.preventDefault();
		return ;
	    }
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
// 	document.addEventListener( "mouseup" , function (event) {
// 	    self.nullCursor( ) ;
// 	});
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
				alert( 'Bodgy key command - ' + mapped )
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
    80: "revealSpot",  // P  peek
    81: "revealAll",   // Q  quit
    82: "clearSpot",   // R  rub-out
    83: "clearAll",    // S  start again
    84: "nextSpot",    // T  tab
    85: "checkSpot",   // U  unsure
    86: "checkAll"     // V  very unsure
}