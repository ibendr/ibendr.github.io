/*
 *  Extension of the abstract xwdInterface to specific html setting
 *
 *  version adapted to mobile devices (phones, tablets)
 *
 *  The main reason this is needed is to accommodate the lack of a keyboard.
 *
 *  However, we shall also modify the layout to only display the grid and current clue, and
 *    a limited number of functional buttons, since screen real-estate will be limited, 
 *    especially once a virtual keyboard is brought up.
 * 
 */

include( 'virtualKeyboard' );
 


// We'll find out our window dimensions in case that effects our layout
var elDoc  = document.documentElement ;
var elBod  = document.body || document.getElementsByTagName( 'body' )[ 0 ] ;
var elHed = document.head ;

// add meta tag 	<meta name="viewport" content="width=device-width, initial-scale=1">
var elMetaViewport = document.createElement('META') ;
elMetaViewport.setAttribute( "name" ,    "viewport" ) ; 
elMetaViewport.setAttribute( "content" , "width=device-width, initial-scale=1" ) ; 
elHed.appendChild( elMetaViewport ) ;

var windowSize = [ /*window.screen.width , window.screen.height ] ;*/
    window.innerWidth  || elDoc.clientWidth  || elBod.clientWidth ,
    window.innerHeight || elDoc.clientHeight || elBod.clientHeight ] ;

// but for now... 
//      alert(windowSize); // test results: 
     // desktop: 980,1522 
     // desktop: 1280,720      
     // mobile: 360,640
var csp = Math.floor( windowSize[ 0 ]  / 15 ) - 1 ;
// if ( csp < 16 ) csp = 16 ;
var cellSizePx = [ csp , csp ]
var stUnits = "px"
// function stSiz( x ) { return Math.round( x ) + stUnits ; }
// Using CSS pixels not physical pixels, we want finer than 1px adjustment ...
function stSiz( x ) { return ( Math.round( x*10 ) / 10 ) + stUnits ; }

// Simple shorthand for creating an element with a particular parent and class(es)
// Saves importing full dom module
function elem( tag , pa , clss ) {
    var el = document.createElement( tag ) ;
    if ( pa ) {
	pa.appendChild( el ) ;
    }
    if ( clss ) {
	if ( ! ( clss instanceof Array ) ) clss = [ clss ] ;
	clss.forEach( function ( cls ) {
	    el.classList.add( cls ) ;
	} ) ;
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
    this.puzzleName = ( this.srcParts.Name && this.srcParts.Name[ 0 ] )
    if ( !this.puzzleName ) {
	var url = document.URL;
	// take the puzzle name to be the filename stripped of path and (last) extension
	this.puzzleName = url.slice( url.lastIndexOf('/') + 1, url.lastIndexOf('.') ) || "Puzzle";
    }
    if ( this.srcParts.Grid && this.srcParts.Clues ) { 
	// make the crossword and abstract interface object
	xwdInterface.call( this , this.srcParts.Grid , this.srcParts.Clues ) ;
	// then adjust grid-cell size to screen-size
	var maybeCellSize = Math.floor( ( windowSize[ 0 ] - 3 ) / ( this.size[ 0 ] + 1 ) )
// 	alert( maybeCellSize + ' -- ' + cellSizePx[ 0 ] ) ;
// 	if ( maybeCellSize > cellSizePx[ 0 ] ) {
	    cellSizePx = [ maybeCellSize , maybeCellSize ] ;
	    this.cellHeight = this.cellWidth = maybeCellSize ;
	    elXwd.style.fontSize = stSiz( maybeCellSize * 0.8 ) ;
// 	}
	this.gridPixelWidth = this.cellWidth  * this.size[ 0 ] + 3 ;
	this.elHost = elXwd ;
	// Hide original clue list - if it was it's own element
	if      ( elsParts.Clues ) elsParts.Clues.style.display = "none" ;
	else if ( elsParts.Text )  elsParts.Text.textContent = "" ;
	// set up local storage
	this.storage = window.localStorage || null ;
	this.storeKey = 'xwd' + this.puzzleName ;
	// Make main layout elements
// 	this.elLay    = elem( 'table' ,   elXwd     , 'layout' ) ;
// 	this.elLrow   = elem(  'tr'   , this.elLay  ) ;
// 	this.elGridTd = elem(  'td'   , this.elLrow ) ;
	this.elHeader = elem(  'div'  , this.elHost , 'xwdHeader' ) ;
	this.elHeader.style.width  = this.gridPixelWidth ;
	this.makeHeadings( ) ;
	this.elClue =    elem( 'div' , this.elHost , 'clueBox' ) ;
	var styl = this.elClue.style
	styl.width  = this.gridPixelWidth ;
	styl.height  = stSiz( this.gridPixelWidth / 6 ) ;
 	styl.border = 'solid black 1px' ;
 	styl.textWrap = 'wrap' ;
// 	this.elsClues = [ ] ;
// 	this.elsClues = [ elem( 'div' , this.elClues , 'clues-container' ) ,
// 			  elem( 'div' , this.elClues , 'clues-container' ) ] ;
// 	for (var i=0;i<2;i++) { this.elsClues[i].style.position  = 'absolute' ; }
// 	this.makeClueBoxes() ;
	this.elGrid   = elem(  'div'  , this.elHost , 'game-container' ) ;
	this.elGrid.style.width  = this.gridPixelWidth ;
	this.elGrid.style.height = this.cellHeight * this.size[ 1 ] + 3 ;
// 	this.elClueTds = [ elem( 'td' , this.elLrow ) ,
// 					    elem( 'td' , this.elLrow ) ] ;
	this.makeHtmlCells() ;

// 	this.elLrow2    = elem(  'tr' , this.elLay   ) ;
// 	this.elFooterTd = elem(  'td' , this.elLrow2 ) ;
// 	this.elFooterTd.colSpan = 2;
// 	this.elGridTd.rowSpan   = 2 ;
	
	this.makeHtmlCursor() ;
	this.initCursor() ;	// trigger drawing it
	this.initListeners() ;
	// Do the favicon - needs to be in the head
	var newEl = elem( 'link' , document.head ) ;
	newEl.setAttribute( 'rel'  , 'shortcut icon' ) ;
	newEl.setAttribute( 'href' , 'favicon.ico'   ) ;
/* 	// Create a dummy text input box to trigger virtual keyboard on mobile devices
	// We need to hide it from view, but how we do it will matter - actually
	//   setting display='none' would disable it which we don't want
	this.elInput = elem( 'input' , this.elGrid , 'dummy' ) ;
	this.elInput.setAttribute( 'type' , 'text' ) ;
	this.elInput.setAttribute( 'value' , '.' ) ; // Will an initial value prevent initial upper case?
	// this.elInput.setAttribute( 'onkeydown' , 'return false' ) ; // currently steals F5 etc.
	this.elInput.focus( ) ;*/
	var kbdTyp = virtualKeyboardTypes[ 'alphaUpperNav' ] ;
	var xtraRow = [ ]
	var self = this
	this.buttons.forEach( function( button , i ) {
		xtraRow.push( [ button[ 0 ] , 2.5 , [ self[ button[ 1 ] ] , self , [ ] ] ] ) ;
	} ) ;
// 	alert( xtraRow ) ;
	kbdTyp.rows.push( xtraRow ) ;
	kbdTyp.offsets.push( 0 ) ;
	this.vKbd = new virtualKeyboard( null , kbdTyp ) ;

// 	this.elFooter =  elem( 'div' , this.elHost , 'xwdFooter' ) ;
// 	styl = this.elFooter.style ;
// 	styl.width  = this.gridPixelWidth ;
// 	styl.height  = stSiz( this.gridPixelWidth / 6 ) ;
//  	styl.border = 'solid black 1px' ;
//  	
// 	this.makeButtons( ) ;

    }
}

xwdInterfaceHtml.prototype = new xwdInterface

function cellUpdateHtml( cont ) { //alert ( this + ' , ' + cont )
    this.el.textContent = cont
}
// could have this listener in the abstract xwdInterface module,
// but so far it has no .content fields and doesn't use watcher.js
// function clueCompletionUpdate( clue ) {
//     var blanks = 0 ;
//     clue.spots.forEach( function( spot ) {
// 	spot.cells.forEach( function( cell ) {
// 	    if ( !cell.content ) blanks++
// 	} );
//     } ) ;
//     if ( clue.blanks != blanks ) clue.blanks = blanks ;
// }
// function cellCluesCompletionUpdate( ) {
//     this.spots.forEach( function( spot ) {
// 	spot[ 0 ].clues.forEach( clueCompletionUpdate ) ;
//     } );
// }
evOnChange ( xwdCell.prototype , 'content' , 
	     [ cellUpdateHtml /*, cellCluesCompletionUpdate*/ ] ) ;

// function clueCompletionUpdateHtml( blanks ) {
//     this.el.classList[ blanks ? 'remove' : 'add' ]( 'answered' ) ;
// }
// evOnChange ( xwdClue.prototype , 'blanks' , clueCompletionUpdateHtml ) ;

function currentCluesUpdateHtml( curr ) {
    if ( this.elClue  ) {
	var txt = '' ;
	if ( curr ) {
	    curr.forEach( function( cl ) {
			if ( txt ) txt += '\n' ;
			txt += cl.updateDisplay( ) ;
		} ) ;
	    this.elClue.textContent = txt ;
	}
    }
}

function cursorSpotUpdateHtml( spot ) {
    self = this ;
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
		cell.el.focus() ;
		styl.display    = 'block' ;
		styl.top        = stSiz( cell.pos[ 1 ] * self.cellHeight - 1 ) ;
		styl.left       = stSiz( cell.pos[ 0 ] * self.cellWidth  - 1 ) ;
	}
	else {
		styl.display    = 'none' ;	    
	}
    }
}
var xIp = xwdInterface.prototype ;
evOnChange( xIp ,  'cursorClues' , currentCluesUpdateHtml ) ;
evOnChange( xIp ,  'cursorSpot'  , cursorSpotUpdateHtml   ) ;
evOnChange( xIp ,  'cursorSpots' , cursorSpotUpdateHtml   ) ;
evOnChange( xIp ,  'cursorCell'  , cursorCellUpdateHtml   ) ;

Object.defineProperty( xwdInterfaceHtml.prototype , 'content' , {
    get: function( ) {
	var out = '' ;
	self = this ;
	this.cells.forEach( function( cell ) {
	    out += cell.content || '.' ;
	} ) ;
	return out ;
    },
    set: function( src ) {
	self = this ;
	this.cells.forEach( function( cell , i ) {
	    var c = src.charAt( i ) ;
	    cell.content = ( c != '.' ) ? c : '' ;
	} ) ;
    }
} ) ;

mergeIn( xwdInterfaceHtml.prototype, {
    // settings
    cellWidth:    cellSizePx[ 0 ] ,
    cellHeight:   cellSizePx[ 1 ] ,
    // methods
    leaveToHome: function( ) {
	window.location = '../index.html' ;
    } ,
    leaveToIndex: function( ) {
	window.location = 'index.html' ;
    } ,
    save: function( ) {
	if ( this.storage ) {
	    this.storage[ this.storeKey ] = this.content ;
	}
    } ,
    load: function( ) {
	if ( this.storage && this.storeKey in this.storage ) { 
	    this.content = this.storage[ this.storeKey ] ;
	}
    } ,
    makeHtmlCells: function( ) {
	self = this ;
	this.cells.forEach( function( cell ) {
	    // actual cells
	    cell.el     = elem( 'div' , self.elGrid , 'xwdCell' ) ;
	    // cell.el.setAttribute( 'contenteditable' , true ) ;
	    cell.el.pos = cell.pos ;
	    var styl    = cell.el.style ;
	    styl.top          = stSiz( cell.pos[ 1 ] * self.cellHeight );
	    styl.left         = stSiz( cell.pos[ 0 ] * self.cellWidth  );
	    styl.height       = stSiz( self.cellHeight + 1 ) ;
	    styl.width        = stSiz( self.cellWidth  + 1 ) ;
	    styl.fontSize     = stSiz( self.cellHeight * 0.9 ) ;
	    styl.fontWeight  = "bold" ;
	    styl.lineHeight   = stSiz( self.cellHeight + 4 ) ;
	    // and labels
	    if ( cell.label ) {
		cell.elLbl    = elem( 'div' , self.elGrid , 'xwdCellLabel' ) ;
		var styl      = cell.elLbl.style ;
		styl.top      = stSiz( cell.pos[ 1 ] * self.cellHeight - 1 ) ;
		styl.left     = stSiz( cell.pos[ 0 ] * self.cellWidth  + 1 ) ;
		styl.height   = stSiz( self.cellHeight / 3 ) ;
		styl.width    = stSiz( self.cellWidth  / 3 ) ;
		styl.fontSize = stSiz( self.cellHeight / 3.2 ) ;
		styl.color    = "blue"
		cell.elLbl.textContent = cell.label ;
	    }
	} ) ;
    } ,
    makeHtmlCursor: function( ) { // red box around current cell
	this.elCursor = elem( 'div' , self.elGrid , 'cellCursor' )
	var styl      = this.elCursor.style ;
	styl.height   = stSiz( self.cellHeight + 3 ) ;
	styl.width    = stSiz( self.cellWidth  + 3 ) ;
	styl.display  = "none" // only display once pos'n set
    } ,
    makeClueBoxes: function( ) {
		// el  is an element - the parent for the individual clue box elements
		// els is an array to add them to
	var el    = this.elClues ;
	var els   = this.elsClues ;
	for ( var direction = 0 ; direction < 2 ; direction ++ ) {
	    var clues = this.cluesByDirection[ direction ] ;
// 	    elem( 'h3' , el ).textContent = directionNames[ direction ]
	    // NOTE: hardwired pixel value!
	    var clueBoxWidth = this.gridPixelWidth - 56 ;
	    clues.forEach( function( clue , i ) {
		var newP = elem( 'div' , el , 'xwdClueBox' ) ;
		newP.style.width  = clueBoxWidth ;
		newP.style.position  = 'absolute' ;
		newP.style.border = 'red dotted' ;
// 		newP.style.display = 'block' ;
// 		newP.style.visibility  = 'hidden' ;
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
    makeHeadings: function( ) {
// 	var self = this ;
// 	this.elHeadings = [ ] ;
// 	[ "Name" , "Author" , "Copyright" ].forEach( function ( head , i ) {
// 	    if ( self.srcParts[ head ] ) {
// 		var elHead = elem( "h" + ( i + 1 ) , self.elHeader , "xwd" + head ) ;
// 		elHead.textContent = self.srcParts[ head ][ 0 ] ; // join?
// 		self.elHeadings.push( elHead ) ;
// 	    }
// 	} );	
	document.title = this.srcParts[ "Name" ] || "Crossword" ;
    },
    buttons: [
	  [ "SHOW"   ,    "revealSpot"   ,  "P" , "Peek" ] ,
	  [ "RUB"    ,    "clearSpot"    ,  "R" , "Rub" ] ,
	  [ "CHECK"  ,    "checkAll"     ,  "V" , "Verify" ] ,
	  [ "QUIT"   ,    "leaveToIndex" ,  "Q" , "Quit" ]
    ],
//     makeButtons: function( ) {
// 	var self = this
// 	var elPa = this.elFooter ;
// 	this.elButtons = [ ]
// 	this.buttons.forEach( function( button , i ) {
// 	    var newEl  = elem( 'div' , elPa , 'xwdButton' ) ;
// 	    var labelText = button[ 0 ] ;
// 	    newEl.textContent = labelText ;
// 	    var callback = self[ button[ 1 ] ] ;
// 	    if ( labelText.indexOf( "ALL" ) > -1 ) {
// 		// We want to confirm these more drastic actions
// 		newEl.onclick = function( e ) {
// 			// if ( confirm( "Confirm " + labelText + "?" ) ) {
// 				// callback.apply( self , [ ] ) ;
// 			// }
// 			if ( this.classList.contains( "xwdConfirm" ) ) {
// 				this.classList.remove( "xwdConfirm" ) ;
// 				callback.apply( self , [ ] ) ;
// 			}
// 			else {
// 				this.classList.add( "xwdConfirm" ) ;
// 				var it = this ;
// 				setTimeout( function() { it.classList.remove( "xwdConfirm" ) } , 3000 ) ;
// 			}
// 		}
// 	    }
// 	    else {
// 		newEl.onclick = function( e ) { callback.apply( self , [ ] ) ; } ;	
// 	    }
// 	    self.elButtons.push( newEl ) ;
// 	    }) ;
// 	    // hover text
// 	this.buttons.forEach( function( button , i ) {
// 		var newEl2  =  elem( 'div' , self.elButtons[ i ] , 'hoverHint' ) ;
// 		newEl2.textContent = "ctrl-" + button[ 2 ] + ' : "' + button[ 3 ] + '"' ;
// 		newEl2.style.zIndex = "1" ;
// 	}) ;
// 	this.styleButtons( ) ;
//     },
//     styleButtons: function( ) {
// 	var unitW = this.gridPixelWidth / 16 ;
// 	this.elButtons.forEach( function( elButton , i ) {
// 		var styl   = elButton.style ;
// 		styl.width = stSiz( unitW * 4 ) ;
// 		styl.top   = stSiz( 12 + ( i & 1 ) * 45 ) ;
// 		styl.left  = stSiz( unitW * ( 1 + 5 * ( i & 6 ) / 2 ) ) ;
// 	    } ) ;
// 	
//     },	
    initListeners: function( ) {
	var self = this ;
	window.addEventListener("resize", function () {
// 	    self.styleButtons() ;
		// TODO should restyle virtual keyboard
	} ) ;
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
	    // If click in current cell - change axis
	    var changeAxis = theTarget.classList.contains( 'cellCursor' )
	    var pos = changeAxis ? ( self.cursorCell && self.cursorCell.pos ) : theTarget.pos ;
	    if ( pos ) {/* alert(pos)*/
		var axis = 0
		if ( changeAxis && self.cursorSpot )
		    axis = 2 - self.cursorSpot.dir ;
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
	this.elHost.addEventListener(this.eventTouchstart, function (event) {
	    if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
		event.targetTouches.length > 1) {
		return; // Ignore if touching with more than 1 finger
	    }
	    if (window.navigator.msPointerEnabled) {
		this.touchStartClientX = event.pageX;
		this.touchStartClientY = event.pageY;
	    } else {
		this.touchStartClientX = event.touches[0].clientX;
		this.touchStartClientY = event.touches[0].clientY;
	    }
	    this.touching = true ;
	    this.touchStartAtTarget = event.target;
	    event.preventDefault();
	});

	this.elHost.addEventListener(this.eventTouchmove, function (event) {
	    event.preventDefault();
	});

	this.elHost.addEventListener(this.eventTouchend, function (event) {
	    if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
		event.targetTouches.length > 0) {
	    return; // Ignore if still touching with one or more fingers
	    }
	    this.touching = false ;

	    var touchEndClientX, touchEndClientY;

	    if (window.navigator.msPointerEnabled) {
		this.touchEndClientX = event.pageX;
		this.touchEndClientY = event.pageY;
	    } else {
		this.touchEndClientX = event.changedTouches[0].clientX;
		this.touchEndClientY = event.changedTouches[0].clientY;
	    }
	    var dx = this.touchEndClientX - this.touchStartClientX;
	    var dy = this.touchEndClientY - this.touchStartClientY;
	    var absDx = Math.abs(dx);
	    var absDy = Math.abs(dy);

	    var theTarget = this.touchStartAtTarget; //alert (theTarget.className)
	    if ( theTarget.classList.contains( 'xwdButton' ) ) {
// 		event.preventDefault();
		return ;
	    }
	    event.preventDefault();
	    // If click in current cell - change axis
	    var changeAxis = theTarget.classList.contains( 'cellCursor' )
	    var pos = changeAxis ? ( self.cursorCell && self.cursorCell.pos ) : theTarget.pos ;
	    if ( pos ) {/* alert(pos)*/
		var axis = 0
		if ( changeAxis && self.cursorSpot )
		    axis = 2 - self.cursorSpot.dir ;
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
	} );
	document.addEventListener( "keydown" , function ( event ) { 
	    var extraModifiers = ( event.altKey ? 4 : 0 ) | ( event.ctrlKey ? 2 : 0 ) | ( event.metaKey ? 8 : 0 );
	    var shift = ( event.shiftKey ? 1 : 0 );
	    var modifiers = extraModifiers | shift;
	    var keyCode = event.which || event.charCode ;
		 // alert( keyCode ) ;
		// We only proceed if it's not a special (non-printable) key
		if ( ! keyCode ) return ;
		// And if it is printable, we exclude it from being entered into the dummy input
// 		event.preventDefault() ;
	    // If it's a letter - put it in the grid.
		// First need to make key-reading case-insensitive, as soft keyboard
		//    automatically goes to upper case at start and then back to lower
	    if ( keyCode >= 97 && keyCode <= 112 )	keyCode -= 32
	    if ( keyCode >= 65 && keyCode <= 90  ) {
		if ( ! extraModifiers ) {
		    self.insert( keyCode );
			event.preventDefault() ;
		}
		else {  // unless modifiers (other than shift) - ctrl- gives certain commands
		    if ( event.ctrlKey ) {
			var mapped = keyCtrlAction[ keyCode ];
			if ( mapped ) {
			    if ( mapped in self ) {
				event.preventDefault();
				self[ mapped ].apply( self , [ keyCode , modifiers ] ) ;
				// return false ;
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
				// return false ;
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
				// return false ;
		    }
		}
	    }
	} /*,  { capture: true } */ );
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
