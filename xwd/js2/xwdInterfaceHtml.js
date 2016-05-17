/*
 *  Extension of the abstract xwdInterface to specific html setting
 * 
 */

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
	this.elGrid   = elem(  'td'   , this.elLrow , 'game-container' ) ;
	this.elGrid.style.width  = this.cellWidth  * this.size[ 0 ] + 3 ;
	this.elGrid.style.height = this.cellHeight * this.size[ 1 ] + 3 ;
	this.elClues  = elem(  'td'   , this.elLrow , 'clues-container' ) ;
	//temp
	cl = elem( 'pre' , this.elClues )
	cl.textContent = elClues.textContent ;
	this.makeHtmlCells() ;
	this.makeHtmlCursor() ;
	this.initCursor() ;	// trigger drawing it
    }
}

function cellUpdateHtml( cont ) { //alert ( this + ' , ' + cont )
    this.el.textContent = cont
}
evWatch( xwdCell.prototype , 'content' ) ;
xwdCell.prototype.evWatchFields = { 'content' : [ cellUpdateHtml ] } ;

xwdInterfaceHtml.prototype = new xwdInterface

function cursorSpotUpdateHtml( spot ) {
    self = this
    this.cells.forEach( function( cell ) {
	if ( cell.el ) {
	    if ( spot && cell.inSpots( [ spot ] ) )
		  cell.el.classList.add(    'highlight' )
	    else  cell.el.classList.remove( 'highlight' )
	    if ( cell.inSpots( self.cursorSpots || [] ) )
		  cell.el.classList.add(    'highlight1' )
	    else  cell.el.classList.remove( 'highlight1' )
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

evWatch( xwdInterface.prototype , 'cursorSpot' ) ;
evWatch( xwdInterface.prototype , 'cursorCell' ) ;
xwdInterface.prototype.evWatchFields = { 
    'cursorSpot' : [ cursorSpotUpdateHtml ] ,
    'cursorCell' : [ cursorCellUpdateHtml ] } ;

mergeIn( xwdInterfaceHtml.prototype, {
    // settings
    cellWidth:    40 ,
    cellHeight:   40 ,
    // methods
    makeHtmlCells: function( ) {
	self = this ;
	this.cells.forEach( function( cell ) {
	    // actual cells
	    cell.el     = elem( 'div' , self.elGrid , 'xwdCell' ) ;
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
    makeHtmlCursor: function( ) {
	this.elCursor = elem( 'div' , self.elGrid , 'cellCursor' )
	var styl      = this.elCursor.style ;
	styl.height   = stSiz( self.cellHeight - 3 ) ;
	styl.width    = stSiz( self.cellWidth  - 3 ) ;
	styl.display  = "none" // only display once pos'n set
    }
} ) ;

