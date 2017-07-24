/*
 *  Extension of the abstract xwdInterface to specific html setting
 * 
 * ver 4: first numbered version, 4 for consistency with xwd4, xwdInterface4
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
// 	  alert ( 'about to make xwd ' + i )
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
	this.readInfo( this.srcParts.Info , "Solution" ) ;	
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
	xwdInterface.call( this , this.srcParts.Grid , this.srcParts.Clues )
	this.noClues = ! this.clues.length
	this.elHost = elXwd ;
	// Hide original clue list - if it was it's own element
	if      ( elsParts.Clues ) elsParts.Clues.style.display = "none" ;
	else if ( elsParts.Text )  elsParts.Text.textContent = "" ;
	// set up local storage
	this.storage = window.localStorage || null ;
	this.storeKey = 'xwd' + this.puzzleName ;
	// Make main layout elements
	this.elLay    = elem( 'table' ,   elXwd     , 'layout' ) ;
	this.elLrow   = elem(  'tr'   , this.elLay  ) ;
	this.elGridTd = elem(  'td'   , this.elLrow ) ;
	this.elHeader = elem(  'div'  , this.elGridTd , 'xwdHeader' ) ;
	this.makeHeadings( ) ;
	this.elGrid   = elem(  'div'  , this.elGridTd , 'game-container' ) ;
	this.elGrid.style.width  = this.cellWidth  * this.size[ 0 ] + 1 ;
	this.elGrid.style.height = this.cellHeight * this.size[ 1 ] + 1 ;
	// Changes Feb 2017 - add a table to contain all the clues, in  an effort to get equal widths
	this.elCluesTd  =   elem( 'td' , this.elLrow ) 
	this.elCluesTable = elem( 'table' , this.elCluesTd , 'clues-table' )
	this.elCluesTr  =   elem( 'tr' , this.elCluesTable ) ;
        this.elClueTds = [ ] ;
        this.elsClues = [ ] ;
        for ( var i = 0 ; i < nDirections ; i++ ) {
            this.elClueTds.push( elem( 'td' , this.elCluesTr ) ) ;
            this.elsClues.push( elem( 'div' , this.elClueTds[ i ] , 'clues-container' ) ) ;
        }
// 	this.elClueTds = [ elem( 'td' , this.elCluesTr ) ,
// 	                   elem( 'td' , this.elCluesTr ) ] ;
// 	this.elsClues = [ elem( 'div' , this.elClueTds[ 0 ] , 'clues-container' ) ,
// 	                  elem( 'div' , this.elClueTds[ 1 ] , 'clues-container' ) ] ;
	this.makeHtmlCells() ;
	this.makeClueBoxes() ;
        if ( xwdHasBars ) this.makeBars() ;
        
	this.elLrow2    = elem(  'tr' , this.elLay   ) ;
	this.elFooterTd = elem(  'td' , this.elLrow2 ) ;
	this.elFooterTd.colSpan = 2;
	this.elGridTd.rowSpan   = 2 ;
	this.elFooters = [ elem( 'div' , null , 'xwdFooter' ) ,
	                  elem( 'div' , null , 'xwdFooter' ) ] ;
	this.makeButtons( ) ;
	
	this.makeHtmlCursor() ;
	this.initCursor() ;	// trigger drawing it
        if ( xwdNoCursor ) {
            this.nullCursor() ;
        }
	this.initListeners() ;
	// Do the favicon - needs to be in the head
	var newEl = elem( 'link' , document.head ) ;
	newEl.setAttribute( 'rel'  , 'shortcut icon' ) ;
	newEl.setAttribute( 'href' , 'favicon.ico'   ) ;
    }
}

xwdInterfaceHtml.prototype = new xwdInterface

function cellUpdateHtml( cont ) { //alert ( this + ' , ' + cont )
    this.el.textContent = cont
}
// could have this listener in the abstract xwdInterface module,
// but so far it has no .content fields and doesn't use watcher.js
function clueCompletionUpdate( clue ) {
    var blanks = 0 ;
    clue.spots.forEach( function( spot ) {
	spot.cells.forEach( function( cell ) {
	    if ( !cell.content ) blanks++
	} );
    } ) ;
    if ( clue.blanks != blanks ) clue.blanks = blanks ;
}
function cellCluesCompletionUpdate( ) {
    this.spots.forEach( function( spot ) {
	spot[ 0 ].clues.forEach( clueCompletionUpdate ) ;
    } );
}
evOnChange ( xwdCell.prototype , 'content' , 
	     [ cellUpdateHtml , cellCluesCompletionUpdate ] ) ;

function clueCompletionUpdateHtml( blanks ) {
    this.el.classList[ blanks ? 'remove' : 'add' ]( 'answered' ) ;
}
evOnChange ( xwdClue.prototype , 'blanks' , clueCompletionUpdateHtml ) ;

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
var xIp = xwdInterface.prototype ;
evOnChange( xIp , 'currentClues' , currentCluesUpdateHtml ) ;
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
	window.location = '../../index.html' ;
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
	    cell.el.pos = cell.pos ;
	    var styl    = cell.el.style ;
	    styl.top        = stSiz( cell.pos[ 1 ] * self.cellHeight );
	    styl.left       = stSiz( cell.pos[ 0 ] * self.cellWidth  );
	    styl.height     = stSiz( self.cellHeight - 1 ) ;
	    styl.width      = stSiz( self.cellWidth  - 1 ) ;
	    styl.fontSize   = stSiz( self.cellHeight * 0.75 ) ;
	    styl.lineHeight = stSiz( self.cellHeight + 4 ) ;
	    // and labels
	    if ( cell.label && ! self.noClues ) {
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
    makeBars : function( ) { // barriers between words in same spot
        this.elBars = [ ] ;
        self = this;
        for ( var d = 0 ; d < 2 ; d++ ) {
            this.spots[ d ].forEach( function( spot ) {
                spot.bars.forEach( function( bar ) {
                    var cell = spot.cells[ bar ] ;
                    bar.el   = elBar = elem( 'div' , self.elGrid , 'xwdBar' + d ) ;
                    var styl = elBar.style ;
                    var thk = 2 ;
                    if ( d ) {
                        styl.top        = stSiz( cell.pos[ 1 ] * self.cellHeight - thk );
                        styl.left       = stSiz( cell.pos[ 0 ] * self.cellWidth  + thk );
                        styl.height     = stSiz( 2 * thk ) ;
                        styl.width      = stSiz( self.cellWidth  - 1 - thk * 2 ) ;
                    }
                    else {
                        styl.top        = stSiz( cell.pos[ 1 ] * self.cellHeight + thk );
                        styl.left       = stSiz( cell.pos[ 0 ] * self.cellWidth  - thk );
                        styl.height     = stSiz( self.cellHeight - 1 - thk * 2 ) ;
                        styl.width      = stSiz( 2 * thk ) ;
                    }
                    styl.fontSize   = stSiz( self.cellHeight * 0.75 ) ;
                    styl.lineHeight = stSiz( self.cellHeight + 4 ) ;
                    if ( cell.label ) {
                        if ( styl = cell.elLbl.style ) {
                            if ( d ) {
                                styl.top    = stSiz( cell.pos[ 1 ] * self.cellHeight + 2 + thk ) ;
                            }
                            else {
                                styl.left   = stSiz( cell.pos[ 0 ] * self.cellWidth  + 2 + thk ) ;
                            }
                        }
                    }
                    self.elBars.push( elBar ) ;
                }) ;
            }) ;
        }
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
	if ( ! this.noClues ) {
	  for ( var direction = 0 ; direction < nDirections ; direction ++ ) {
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
	}	
    } ,
    readInfo: function ( lines , partName ) {
	// parse miscellaneous info in "colon notation" from an array of strings
	// partName indicates an assumed first heading - defaults to "Comment"
	var srcParts = this.srcParts ;
	// if no heading, we assume straight into the solution
	partName = partName || "Comment" ;
	lines.forEach( function( line , i ) {
	    var j = line.indexOf( ':' )
	    if ( j > 0 ) {
		// label for another part...  <partName>:[1st line of data]
                // But leading ':' is to hide subsequent ones in a non-label line
		partName = line.slice( 0 , j ) ; // read new part name
            }
            if ( j > -1 ) {
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
	var self = this ;
	this.elHeadings = [ ] ;
	[ "Name" , "Author" , "Copyright" ].forEach( function ( head , i ) {
	    if ( self.srcParts[ head ] ) {
		var elHead = elem( "h" + ( i + 1 ) , self.elHeader , "xwd" + head ) ;
		elHead.textContent = self.srcParts[ head ][ 0 ] ; // join?
		self.elHeadings.push( elHead ) ;
	    }
	} );	
    },
    buttons: [
	[ [ "Reveal Word"   ,    "revealSpot"   ,   "P" , "Peek" ] ,
	  [ "Reveal  ALL"   ,    "revealAll"    ,   "Q" , "Quit" ] ,
	  [ "Clear Word"    ,    "clearSpot"    ,   "R" , "Rub" ] ,
	  [ "Clear  ALL"    ,    "clearAll"     ,   "T" , "sTart Again" ] ,
	  [ "Check Word"    ,    "checkSpot"    ,   "U" , "Unsure" ] ,
	  [ "Check  ALL"    ,    "checkAll"     ,   "V" , "Verify" ]    ] ,
	[ [  "Home Page"    ,    "leaveToHome"  ,   "B" , "Ben's games" ] ,
	  [  "Crosswords"   ,    "leaveToIndex" ,   "C" , "Cryptics index" ] ,
	  [   "SAVE"        ,    "save"         ,   "S" , "Save progress" ] ,
	  [   "LOAD"        ,    "load"         ,   "L" , "Load progress" ] ]
    ],
    makeButtons: function( ) {
	var self = this ;
	var elPas = this.elFooters ;
	this.elButtons = [ [ ] , [ ] ]
	elPas.forEach( function( elPa , n ) {
	    // n is which footer we're doing ( 0 , 1 )
	    self.buttons[ n ].forEach( function( button , i ) {
		var newEl  = elem( 'div' , elPa , 'xwdButton' ) ;
		var labelText = button[ 0 ] ;
		newEl.textContent = labelText ;
		var callback = self[ button[ 1 ] ] ;
		if ( labelText.indexOf( "ALL" ) > -1 ) {
			// We want to confirm these more drastic actions
			newEl.onclick = function( e ) {
				// if ( confirm( "Confirm " + labelText + "?" ) ) {
					// callback.apply( self , [ ] ) ;
				// }
				if ( this.classList.contains( "xwdConfirm" ) ) {
					this.classList.remove( "xwdConfirm" ) ;
					callback.apply( self , [ ] ) ;
				}
				else {
					this.classList.add( "xwdConfirm" ) ;
					var it = this ;
					setTimeout( function() { it.classList.remove( "xwdConfirm" ) } , 3000 ) ;
				}
			}
		}
		else {
			newEl.onclick = function( e ) { callback.apply( self , [ ] ) ; } ;	
		}
		self.elButtons[ n ].push( newEl ) ;
	    }) ;
	}) ;
	    // hover text - only bother if ctrl-keys are active
	if ( useCtrlKeys ) {
	    [0,1].forEach( function( n ) {
		self.buttons[ n ].forEach( function( button , i ) {
		    var newEl2  =  elem( 'div' , self.elButtons[ n ][ i ] , 'hoverHint' ) ;
		    newEl2.textContent = "ctrl-" + button[ 2 ] + ' : "' + button[ 3 ] + '"' ;
		    newEl2.style.zIndex = "1" ;
		}) ;
	    }) ;
	}
	this.styleButtons( ) ;
    },
    styleButtons: function( ) {
	var self = this ;
	// We see which column(s) have most room now clues rendered
        var clueHt = this.elsClues[ 0 ].clientHeight ;
        for ( var i = 1 ; i < nDirections ; i++ ) {
            if ( clueHt < this.elsClues[ i ] ) clueHt = this.elsClues[ i ] ;
        }
// 	var clueHt = Math.max( this.elsClues[ 0 ].clientHeight ,
// 			       this.elsClues[ 1 ].clientHeight ) ;
	var gridHt = this.elHeader.clientHeight + this.elGrid.clientHeight ;
	[ 0 , 1 ].forEach( function( n ) {
	    var elFootHost = self.elFooterTd ;
	    if ( ( clueHt > gridHt ) || ( self.noClues ) ){
		elFootHost = self.elGridTd ;
		gridHt += 102;
	    }
	    else clueHt += 102 ;
	    elFootHost.appendChild( self.elFooters[ n ] ) ;
	    var unitW = elFootHost.clientWidth / ( 16 - 5 * n ) ;
	    self.elButtons[ n ].forEach( function( elButton , i ) {
		var styl   = elButton.style ;
		styl.width = stSiz( unitW * 4 ) ;
		styl.top   = stSiz( 12 + ( i & 1 ) * 45 ) ;
		styl.left  = stSiz( unitW * ( 1 + 5 * ( i & 6 ) / 2 ) ) ;
	    } ) ;
	} ) ;
    },	
    initListeners: function( ) {
	var self = this ;
	window.addEventListener("resize", function () {
	    self.styleButtons() ;
	} ) ;
	this.elHost.addEventListener("mousedown", function (event) {
	//       alert( event.pageX );
	    this.mouseIsDown = true;
	    this.mousePressedAtX = event.pageX;
	    this.mousePressedAtY = event.pageY;
	    this.mousePressedAtTarget = event.target;
// 	    alert ( event.target.className + ':' + event.pageX + ',' + event.pageY )
	    event.preventDefault();
	    document.activeElement.blur();
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
                // grid cells have .pos field...
		var axis = 0
		if ( changeAxis && self.cursorSpot )
		    axis = 2 - self.cursorSpot.dir ;
		if ( Math.max( absDx , absDy ) > 10 ) {
		    var axis =  absDx > absDy ? 1 : 2;
		}
		self.goto( pos[ 0 ] , pos[ 1 ] , axis ) ;
	    }
	    // clue elements have .sourceClue instead
	    else if ( pos = theTarget.sourceClue ) {
                self.selectClue( self.cluesByDirection[ pos[ 0 ] ][ pos[ 1 ] ] ) ;
	    }
	    else {
		self.nullCursor( ) ;
	    }
	});
	document.addEventListener( "keydown" , function (event) {
	    var extraModifiers = ( event.altKey ? 4 : 0 ) | ( event.ctrlKey ? 2 : 0 ) | ( event.metaKey ? 8 : 0 );
	    var shift = ( event.shiftKey ? 1 : 0 );
	    var modifiers = extraModifiers | shift;
	    var keyCode = event.which;
	    // If it's a letter - put it in the grid
	    if ( keyCode >= 65 && keyCode <= 90 && self.cursorCell ) {
		if (!modifiers) {
		    self.insert( keyCode );
		}
		else {  // unless modifiers - ctrl- gives certain commands
		    if ( event.ctrlKey && useCtrlKeys ) {
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