#!/usr/bin/python

"""
Version 2 from 2025-01-13
(some changes done just before that - crude early versions of ipuz and SQ-ipuz output)

Abstract crossword class, interactive (or autopilot) crossword filler

Restructure:
Now that we are going to be using this as
a swiss army knife for file conversions (a la sox / imageMagic)
we will have a bigger set of fields attached to a standard xwd object.
Also being mindful of other formats, particularly exet/exolve and ipuz
and keeping conversions easy
And more 2-way information (?)

2025 updates...

Main file formats we expect to deal with...

human / plain		grid - letters or spaces with '=' for blocked cells
					<first blank line>
				(optionally) clues, headed "Across:" and "Down:"
				(this was output by pre-2025 version, but not read(?))
					<second blank line>
				(rest ignored)
draft			As per human / plain, but a draft will often have lines of rough working in between clues
				which are ignored (like code comments), and only distinguished
				from actual clues by not fitting clue format.
				Also, clue lines may be in the form
					3. BAD NEWS (3 4) Bands we ruined with unfortunate update?
				i.e. index. SOLUTION (enum) clue
colon			Sort of enhanced human, with fields defined in colon notation, ~ neater version of JSON
				with single string values on same line, such as
					Author: BenDR
				or multi-line on following lines... (optionally indented, leading whitespace stripped? not for grid!)
					Across:
					<across clues, one per line>
				NB: my ideal version of colon notation would support subobjects, but not needed here (?)
html			from version 5 onwards of solving interface, the html is just a wrap of the colon notation
ipuz			open(?) format from Puzzazz, as used by Sat Quiz. JSON
exet/exolve		format used by Viresh Ratnakar's software

INTERNALLY...

Finally implement extra generality of grid geometry, so that we can adapt to
things like 3D / 4D grids, hexagonal grids, etc. without too much extra work.

At most general, a grid can be any list of cells and a list of "spots" which
are sequences of the cells. (We no longer have a class for cells; they
can be any immutable objects, such as string label or tuples of coordinates,
which are then used as keys for various dictionary objects.)

So any "custom" grid could be set up by simply listing the cells and spots. But hand
enumerating the cells in each spot would be quite tedious and error-prone for large
hexagonal or 3D grids.

BUT, if you provide a grid geometry, i.e. define a set of movements from cell to cell,
then the general principle of spots being composed of maximal sequences of consecutive
cells moving in the same direction will be applied for you.

"Standard" grid geometry of n-dimensional cartesian coordinates is already provided.


"""

import sys , subprocess , re
import random

# Global variables

global wordLists, debug, settings, keepSingletons
wordLists = { }		# loaded word lists as { len : [ ... ] , ... }
debug = 0		# level of verbosity of comments
settings = { }
keepSingletons = False

# Constants

directionNames = "Across" , "Down"
dirnNamC = "a" , "d"

matchesPending = [] ; collisions = []
fileRoot = "words-len-"
lenLimit = 19

# Various characters of significance

ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
abc = ABC.lower()

cAlphas = ABC + abc

# characters used to denote live cells (input and output),
# and number of possibile letters (as output)
cWilds = "123456789;;;;::::,,,,.... "

cClash = '*'     # to record a contradiction     \
cBlock = '+='    # possible blocking characters  /  both unused (?)

cCells = cAlphas + cWilds + cClash

cEnds = "|#/\\<>"  # characters denoting end of line of crossword (comments etc. may follow)

# For pretty formatting progress monitor with indents...
cPrefixForce = '>'
cPrefixPosit = '?'

def invDict( D ):
	# swap keys and items around
  return dict(map(tuple,map(reversed,D.items())))

def pQBS( s ):
  # protect quote and backslash - i.e. insert backslashes before them
  # replace  single \  by \\ ,   then    " by \"
  return s.replace('\\','\\\\').replace('"','\\"')
def parseInt( s , allowNeg=False ):
    if not s:
      return
    i = 0
    n = 0
    sign = 1
    if s[0]=='-' and allowNeg:
      sign = -1
      i = 1
    while i < len(s) and s[i].isdigit():
      n = 10 * n + int( s[i] )
      i += 1
    return sign * n

# cell and spot classes are structural info only - content or possible content elsewhere
#	SHOULD BE OBSOLETE
class cell:
  # A cell is a square of the crossword ( in which one letter / character is entered )
  # These are class default values,  and illustrative of format
  pos = ( 0 , 0 )	# position on grid
  spots = ( )		# A tuple ( sp , n ) for each spot it is part of ...
			#  sp is pointer to spot and n its position ( index ) in that spot
  def __init__( I , i , j ):
    I.pos = ( i , j )
  def __repr__( I ):
    if I.pos[ 0 ] >= 25 or I.pos[ 1 ] >= 25:
      return ABC[ I.pos[ 1 ] / 25 ] + ABC[ I.pos[ 1 ] % 25 ] + \
	     abc[ I.pos[ 0 ] / 25 ] + abc[ I.pos[ 0 ] % 25 ]
    # Print row first for correct ordering
    return ABC[ I.pos[ 1 ] ] + abc[ I.pos[ 0 ] ]

#	SHOULD BE OBSOLETE
class spot:
  # A spot is a sequence of cells - ( in which a word is entered )
  # This class now DOES record the direction and label number of a spot,
  # but not automatically at _init__.  Likewise name
  cells = ( )	# The cells of the spot - default value with no cells shouldn't get used
  dirn  = -1
  numb  = -1
  nam   = ""
  nameL = ""
  def __len__( I ):
    # length of spot is how many cells in it - hence equal to length of word required
    return len( I.cells )
  def __str__( I ):
    """Return short name if available, else cell-based name"""
    return I.nam or I.__repr__ ( )
  def __repr__( I ):
    """cell based name - strung together cell names  e.g.  De-Ee-Fe-Ge-He"""
    return '-'.join( [ c.__repr__() for c in I.cells ] )
  def setLabels( I , d , n ):
    I.dirn , I.numb = d , n
    I.nam   = "%d%s" % ( I.numb , dirnNamC[ I.dirn ] ) 
    I.nameL = "%2d %s" % ( I.numb , directionNames[ I.dirn ] )

class clue:
  # This class needn't be used when just composing a grid
  # A clue is a piece of text suggesting answer/s for a spot or sequence of spots
  spots	  = ( )
  text	  = ""	# actual text of clue
  punct   = ""	# optional specification of word breaks and punctuation
  anno    = ""	# optional explanatory text of clues working (for cryptics mainly)
  soln	  = ""
  nam	  = ""
  namDisp = ""
  nameL	  = ""
  def __init__( I , spots , text , punct="" ):
    ## to parse from text (including spots and punct), set spots to direction (0 ac, 1 dn)
    #if spots in (0,1):
      #line = text.strip()
      ##TODO		CHANGED ... parsing can happen elsewhere to make ignoring some lines easier
    ## otherwise spots is tuple of spots, text is just the clue text only, punct e.g. "3-5" if needed
    #else:
    I.spots = spots
    I.text = text
    I.punct = punct
    I.nam = ','.join( [ spot.nam for spot in I.spots ] )
    # omitting direction label for any spots in same direction, and indenting according to width of label number
    I.namDisp = ( ( 5 - len( I.spots[ 0 ].nam ) ) * ' ' ) + ','.join( [
	    ( spot.nam , spot.nam[ : -1 ] )[ spot.dirn == spots[0].dirn ] for spot in I.spots ] )
  def __len__( I ):
    # length of clue is total length of its cells
    return sum( map( len, I.spots ) )
  def __repr__( I ):
    # short name e.g. 3a
    return I.nam
  def __str__( I ):
    # name and text and enum of clue
    # or just name and text for 'see ...'
    if I.text[:4]=="see ":
	#TODO condition of actually being referenced in other clue
      if ( True ):
	return "%s. %s" % ( I.nam , I.text or I.soln )
    return "%s. %s (%s)" % ( I.nam , I.text or I.soln , I.enum() )
  def disp( I ):
    # same as __str__ but without explicit direction (see namDisp )
    if I.text[:4]=="see ":
	#TODO condition of actually being referenced in other clue
      if ( True ):
	return "%s. %s" % ( I.namDisp , I.text or I.soln )
    return "%s. %s (%s)" % ( I.namDisp , I.text or I.soln , I.enum() )
  def enum( I ):
    # text of enum to put in () at end of clue - includes punctuation if given
    return I.punct or ' '.join( [ str( len( sp ) ) for sp in I.spots ] )
 

# Stuff to deal with "content" - a set of possible values of a cell

def regExpContentC( cont ):
  # make a chunk of regular expression based on options for content
  # All word lists are imported as upper and we just work in upper
  conL = list( cont )
  if len( conL ) == 1:
    return conL[ 0 ]
  return '[' + ''.join( conL ) + ']'

def regExpContentW( sp , cont ):
  # make the full regular expression for the possibilities for a spot
  # cellContent object has to be passed as cont since it is not global
  return ''.join( [ regExpContentC( cont[ cl ] ) for cl in sp.cells ] )

def showContentSpot( cont , sp , blanks = None ):
  # What to display ( one character per cell ) for possibilities for a spot
  #  stringing together characters from showContent()
  # NB: in this case cont is the whole I.cellContent object!
  return ''.join( [ showContent( cont[ cl ] , blanks )
			for cl in sp.cells ] )
def showContent( cont , blanks = None ):
  # What to display ( in one character ) for a given set of possibilities
  # cont is a set of letters ( for a cell )
  # use blanks = " " (or other) to leave undetermined cells blank, otherwise
  # characters are provided to hint at number of possibilities remaining
  l = len( cont )
  if l == 0:	return cClash
  if l == 1:	return list( cont )[ 0 ]
  return blanks or cWilds[ min ( l , 26 ) - 1 ]

def showLabel( lbl ):
  return directionNames[ lbl[ 0 ] ] + ' ' + str( lbl[ 1 ] )

# New abstract approach (2025)... grid is at heart a list of indeces to be used by other structures

class grid( list ):
  """
  grid 	- list of "cells" - not actual objects but values to use as keys for various dictionary objects
	- plus set of "spots" - sequences of the cells
	- when based on a "geometry", there will be 'move' functions (in inverse pairs) to get from one cell to another
  """
  def __init__( I , cells , spots = [] ):
    list.__init__( I , cells )
    I.spots = [ ]
    I.spotsThru = { }
    I.heads = [ ]
    for spot in spots:
      I.addSpot( spot )
    #I.spotsFrom = dict( [ ( cell , [ spot for spot in spots if I.spot[ 0 ] == cell ] ) for cell in I ] )
    #I.heads = I.spotsFrom.keys( )
    #I.heads = list( set( [ spot[ 0 ] for spot in spots ] ) )
  def content( I , spot , cont={} ):
    return ''.join( [ cont.get( cell , ' ' ) for cell in spot ] )
  def toStr( I ):
    return list.__repr__( I ) + '\n' + list.__repr__( I.spots )
  __repr__ = toStr
  def addSpot( I , spot ):
    head = spot[ 0 ]
    if not head in I.heads:
      I.heads.append( head )
    I.spots.append( spot )
    for ( i , cell ) in enumerate( spot ):
      I.spotsThru.setdefault( cell , [ ] ).append( ( spot , i + 1 ) )
    #I.spotsFrom.setdefault( head , [ ] ).append( spot )
  def label( I , cell ):
    if cell in I.heads:
      return str( I.heads.index( cell ) + 1 )
    return ''

class geometryGrid( grid ):
  """
  grid with underlying geometry, i.e. a set of 'moves' (and their inverses)
    to get from one cell to another. (Returning None if block or edge of grid reached.)
    Note this needs to be subclassed with function geometryMove for __init__ to call
  """
  numDirns = 0
  def __init__( I , cells , bars={} ):
    grid.__init__( I , cells )
    I.bars = bars	# dictionary {cell:tuple of directions barred}
    #I.heads = list( )
    if I.numDirns:
      I.inferSpots( )
  def move( I , cell , dirn , rev = False ):
    # individual geometries provide the inner function
    out = I.geometryMove( cell , dirn , rev )
    # check for bar in this direction
    if rev:
      if out in I.bars:
	if dirn in I.bars[ out ]:
	  return None
    else:  
      if cell in I.bars:
	if dirn in I.bars[ cell ]:
	  return None
    # and we confirm it is in grid
    return ( out and out in I and out ) or None
  def addSpot( I , spot , dirn ):
    grid.addSpot( I , spot )
    I.spotsByDirn[ dirn ].append( spot )
  def inferSpots( I ):
    I.spotsByDirn = [ [] for dirn in range( I.numDirns ) ]
    for cell in I:
      for dirn in range( I.numDirns ):
	# cell is start of a spot if cell ahead but not behind
	if I.move( cell , dirn ) and not I.move( cell , dirn , True ):
	  spot = [ ]
	  cell1 = cell
	  while cell1:
	    spot.append( cell1 )
	    cell1 = I.move( cell1 , dirn )
	  I.addSpot( tuple( spot ) , dirn )
def ndTups( size , base = 1 ):
  """Recursive function to generate caretsian product of ranges in natural order"""
  return ( not size and [ (), ] ) or [ tuple( [ i ] + sub )
	for i in range( base, base + size[ 0 ] ) for sub in map( list , ndTups( size[ 1 : ] , base ) ) ]
def gridStr( size , fun , base = 1 , tup = () , sep = None ):
  """display some content returned by fun() called on tuples in ndTups( size ),
    prepended by tup (mainly there for recursive calling)"""
  l = len( size )
  if l == 0:
    return fun( tup )
  if sep is None:
    if l < 4:
      sep = ( l > 1 and '\n' ) or ''
    else:
      sep = '\n' + ( l/2 - 1 ) * ( '%s\n' % ( '+#'[ l&1 ].join( size[ -2 ] * [ size[ -1 ] * '-='[ l&1 ] ] ) ) )
  return sep.join( [ gridStr( size[ 1 : ] , fun , base , tup + ( i, ) , ( l == 3 ) and '|' or None )
		    for i in range( base , base + size[ 0 ] ) ] )
		      
class cartesianGrid( geometryGrid ):
  dimLim = 6	# default limit on number of dimensions
  def __init__( I , size , blocks = [] , bars = {} , rotn = 2 ):
    """
    size	tuple/list of dimensions - usually (width,height)
    blocks	where cells aren't - list of cells
    bars	breaks connection between cells, a list for each direction
    rotn = 2 for 180 degree rotational symmetry (all coordinates inverted)
      or 4 for 90 degree (only in 2D, square), other for none
    """
    geometryGrid.__init__( I , [] )
    if isinstance( size, str ):
      I.soln = I.fromStr( size )
      size = I.size
    else:
      I.size = size
      I.dim = len( size )
      I.soln = {}		# shouldn't really be here but may be handy
    I.numDirns = I.dim
    #cells = [ ]
    # extend blocks and bars by rotational symmetry
    # blocks shouldn't be used in conjunction with string input, but bars could be
    if blocks or bars:
      if rotn == 2 or rotn == 4:
	blocks = blocks + [ tuple( [ siz + 1 - pos for ( siz , pos ) in zip ( size , block ) ] ) for block in blocks ]
	for cell in dict( bars ):
	  for d in bars[ cell ]:
	    bars.setdefault( tuple ( [ size[ i ] + ( i != d ) - cell[ i ] for i in range( I.dim ) ] ) , [ ] ).append( d )
	#for d in range( I.dim ):
	  #bars[ d ] = bars[ d ] + [ tuple ( [ size[ i ] + ( i != d ) - bar[ i ] for i in range( I.dim ) ] ) for bar in bars[ d ] ]
      if rotn == 4 and len( size ) == 2 and size[ 0 ] == size[ 1 ]:
	blocks = blocks + [ ( size[ 0 ] + 1 - x , y ) for ( y , x ) in blocks ]
	oldbars = dict( bars )
	for ( y , x ) in oldbars:
	  for d in oldbars[ ( y , x ) ]:
	    # d=0 => same cell (bar under -> bar right) but d=1 => behind cell (bar right -> bar above)
	    bars.setdefault( ( size[ 0 ] + 1 - x - d , y ) , [ ] ).append( 1 - d )
	#bars[ 0 ] = bars[ 0 ] + [ (  size[ 0 ] - x , y ) for ( y , x ) in bars[ 1 ] ]
	#bars[ 1 ] = bars[ 1 ] + [ (  size[ 0 ] - x , y ) for ( y , x ) in bars[ 0 ][ : - len( bars[ 1 ] ) ] ]
    #I.blocks = blocks
    I.bars = bars
    if not len( I ):
      # when grid not read from string source
      I[ : ] = [ c for c in ndTups( size , 1 ) if not c in blocks ]
    I.inferSpots( )
    #return geometryGrid.__init__( I , [ c for c in ndTups( size , 1 ) if not c in blocks ] , bars )
  def geometryMove( I , cell , dirn , rev = False ):
    posn = list( cell )
    posn[ dirn ] += 1 - 2 * rev
    return tuple( posn )
  def toStr( I , cBlock = '#' , cCell = '.' , nums = False ):
    # display of grid
    chars = ( cBlock , cCell )
    if nums:
      return gridStr( I.size ,
	lambda t : ( t in I.heads and '%2d' % ( I.heads.index( t ) + 1 ) ) or ( 2 * chars[ t in I ] ) )
    else:
      return gridStr( I.size , lambda t : chars[ t in I ] )
  def __repr__( I ):
    return I.soln and I.toStrContent( I.soln , '=' ) or I.toStr( )
  def toStrContent( I , inp , cBlock = '#' ):
    # display content
    return gridStr( I.size , lambda t : inp.get( t , cBlock ) )
  def upDim( I , siz , dicts , addNew = False ):
    """on-the-fly increase dimension - with siz for new size
    will prepend (1,) to all coordinates of existing cells
    and similarly change the keys in any dictionaries passed in dicts
    If addNew True, adds all the new coordinates starting with 2, 3, etc.
    """
    I.size = ( siz , ) + I.size
    I.dim = I.numDirns = len( I.size )
    oldI = list( I )
    for cell in oldI:
      newcell = ( 1 , ) + cell
      I.remove( cell )
      I.append( newcell )
      for dic in dicts:
	if cell in dic:
	  dic[ newcell ] = dic[ cell ]
	  del dic[ cell ]
    if addNew:
      # being careful to maintain natural ordering
      for i in range( 2 , siz + 1 ):
	for cell in oldI:
	  I.append( ( i , ) + cell )
	
  def fromStr( I , inp , limDim = None ):
    """ read grid, along with possible content (returned)
    use limDim to restrict number of dimensions. Otherwise,
    every distinct separator is treated as a higher dimension.
    although typically separators are '', '|', '\n' , ~'\n----\n'
    DOES NOT update spots
    """
    out = { }		# content of cells
    I.dim = 1
    I.size = ( 0, )
    inSep = ''		# separator mid-read
    seps = [ ]		# separators used so far
    pos = [ 1 ]		# position in grid
    for c in inp:
      if c in cCells or c in cBlock:
	if inSep:
	  # process separator we've just finished reading
	  if not inSep in seps:
	    # not one already used so need to increment dimension - if allowed
	    if I.dim < ( limDim or I.dimLim ):
	      seps.append( inSep )
	      pos = [ 1 ] + pos
	      I.upDim( 2 , [out] ) # go straight to size 2 since we have more content
	    else:
	      # if run out of dimensions, replace last separator so we increment same dimension again
	      seps[ -1 ] = inSep
	  d = - 2 - seps.index( inSep )
	  pos[ d ] += 1
	  if pos[ d ] > I.size[ d ]:
	    I.size = tuple( I.size[ : d ] + ( pos[ d ] , ) + I.size[ d+1 : ] )
	  pos[ d + 1 : ] = ( - d - 1 ) * [ 1 ]
	  inSep = ''
	# assign cell - if not a block
	if c in cCells:
	  tup = tuple( pos )
	  I.append( tup )
	  # and note content if it's a letter
	  out[ tup ] = ( c in cAlphas ) and c or None
	# update size if necessary
	if pos[ -1 ] > I.size[ -1 ]:
	  I.size = tuple( I.size[ : -1 ] + ( pos[ -1 ] , ) )
	# increment pointer
	pos[ -1 ] += 1
      else:
	inSep += c
    #I.inferSpots( )
    return out
    
class grid2D( cartesianGrid ):
  # we can add 2d-specific things here
  dimLim = 2
  def __init__( I , size=0 , *args ):
    if isinstance( size , int ):
      # assume square if single dimension passed
      size = ( size , size )
    if not isinstance( size , str ) and len( size ) !=2:
      raise ValueError
    return cartesianGrid.__init__( I , size , *args )
      
  
class xwd( object ):
  contradiction = False
  dispPrefix = ""  
  def __init__( I , src = None , raw = False ):
    """
    src should be a filename or a list of lines of text or ( grid , solution , clues )
    Use raw = True to avoid analysis
    """
  
    I.grid         = None
    I.clues	   = None
    I.solution	   = dict( )
    I.current	   = dict( )
    I.name	   = ""
    I.author	   = "BenDR"
    
			  # Possible content for the cells, as sets of possibilities
			  # After processing -
			  # dictionary from cell (ptr) to a set of of permitted letters
			  #  .... dict of letter -> [ n0 , n1 ] lists
			  # where letter is a letter which could go in the cell, and
			  # n0 , n1  are the number of words currently permissible (in
			  # the across and down spots respectively) which agree with
			  # this letter assignment;  one for unused direction.  (Zero
			  # should not occur 'naturally' or else letter not in set
			  # At input stage - 
			  # dictionary from cell(ptr) to string (content) or number (priority)

    # stuff for when filling grid - should be moved to subclass of xwdConstruction
    I.spotContent = dict()    # Possible content for the spots, as lists of words
    I.spotRegExp  = dict()
    
    I.wordsUsed  = set()      # words already used -> to avoid repeats
    
    I.spotsToAdjust = set()   # spots that need adjustment
    I.posits = []             # trialled entries - linked with cull history
    I.cullHistory = []
    I.cullHistoryNew()        # sets up I.cullHistory , I.cullSpots , I.cullCells

    if src:
      if isinstance( src , str ) and src:
	src = file( src ).read().splitlines()
      if isinstance( src , ( list , tuple ) ):
	# lots of options here...
	# ( grid , solution , clues )
	if len( src ):
	  if isinstance( src[ 0 ] , grid ):
	    I.grid = 
      # if src is a single string, take it to be a filename
      #if isinstance ( src , list ) and src and isinstance ( src[ 0 ] , str ):
	#lines = src
      if debug >=3: print lines
    if not raw:
      I.analyse( )
    
  def to_lines( I , shaded="=", endofline="|", blank=" "  ):
    return [ ''.join( [ ( c and showContent( I.cellContent[ c ] , blank ) ) or shaded \
		for c in cellRow ] ) + endofline for cellRow in I.cellByPos ] + [ "" ]

  def to_iPuzSQ( I ):
    # version for less-than-concise ipuz style for Sat Quiz
    from datetime import datetime
    yr = str( datetime.now().year )
    return '{\n  "copyright": "%s",\n  "showenumerations": true,\n  "title": "%s",\n  "version": "http://ipuz.org/v2",\n  "empty": ":",\n  "dimensions": { "width": %d, "height": %d },\n  "kind": ["http://ipuz.org/crossword#1"],\n  "author": "%s",\n  "puzzle": [\n%s\n  ],\n  "solution": [\n%s\n  ],\n  "clues": {\n%s\n  }\n}\n' % ( yr , I.name , I.width , I.height , I.author or "BenDR" , I.to_iPuzGrid( True ) , I.to_iPuzSolnSQ() , I.to_iPuzClues( True ) )
  def to_iPuzShort( I ):
    # get year for copyright ... two methods both required an import
    #from subprocess import check_output
    #yr = checkoutput( [ 'date' , '+%Y' ] ).strip()
    from datetime import datetime
    yr = str( datetime.now().year )
    template = '{\n  "version":   "http://ipuz.org/v2",\n  "kind":    [ "http://ipuz.org/crossword#1" ],\n  "title":     "%s",\n  "copyright": "%s",\n  "author":    "%s",\n  "dimensions": { "width": %d , "height": %d },\n  "showenumerations": true,\n  "puzzle":   %s,\n  "solution": %s,\n  "clues": %s\n}'
    return template % ( "" , yr , "BenDR", I.width, I.height , str( I.to_iPuzGrid() ) , str( I.to_iPuzSoln() ) , str( I.to_iPuzClues() ) )

  def to_html( I ):
    return  '<!doctype html><html><body><pre class="xwd" style="display: none">\n%s</pre></body><script type="text/javascript" src="../js/xwdMaster5.js"></script></html>\n' % I.to_colon( )
  def to_colon( I ):
    return I.to_colonClues( ) + '\nSolution:\n%sName: %s\nAuthor: %s\n' % ( '\n'.join( I.to_lines( '=', '' ) ) , "" , "BenDR" )
  def to_colonClues( I ):
    return '\n'.join( [ directionNames[ d ] + ':\n' + '\n'.join(
			[ clue.disp() for clue in I.clues[ d ] ] )
			for d in ( 0 , 1 ) ] )
  def cellLabelAt( I , y , x ):
    return I.cellLabels.get( I.cellByPos[ y ][ x ] )
  def to_iPuzSolnSQ( I ):
    return '    [\n      ' + '\n    ],\n    [\n      '.join( [ ',\n      '.join(
		[ c=="#" and '"#"' or '{ "value": "%s", "cell": %s }'
			% ( c , I.cellLabelAt( y , x ) or '":"'  ) 
			for ( x , c ) in enumerate( line ) ] ) 
			for ( y , line ) in enumerate( I.to_lines("#","")[ : -1 ] ) ] ) + '\n    ]'
  
  def to_iPuzGrid( I , SQ = False ):
    lines = I.to_lines("#","")[:-1]
    out = [ ]
    for line in lines:
      outL = [ ]
      for c in line:
	if c=="#":
	  outL.append( -1 )
	else:
	  outL.append( 0 )
      out.append( outL )
    #for s in I.allSpots:
      #x,y = s.cells[0].pos
      #out[ y ][ x ] = s.numb
    for (c,n) in I.cellLabels.items():
      x,y = c.pos
      out[ y ][ x ] = n
    if SQ:
      return '    [' + '],\n    ['.join( [ ', '.join(
	    [ ( n + 1 ) and ( n and ( '%d' % n ) or '":"' ) or '"#"' for n in outL ] ) for outL in out ] ) + ']'
    return '[ [ ' + ' ],\n\t\t[ '.join( [ ','.join(
	    [ ( n + 1 ) and ( '%3d' % n ) or '"#"' for n in outL ] ) for outL in out ] ) + ' ] ]'
    
  def to_iPuzClues( I , SQ = False ):
    # TODO nuances
    # returns a string, but we'll join it up last
    out = [ [ ] , [ ] ]
    for d in 0,1:
      for cl in I.clues[d]:
        if len( cl.spots ) == 1 and cl.punct == "" and not SQ:
	  out[ d ].append( '[ %d, "%s" ]' % ( cl.spots[ 0 ].numb, pQBS( cl.text ) ) )
	  continue
        if SQ:
	  outL = '      {\n        "number": %d,\n        "clue": "%s",\n        "enumeration": "%s"\n      }' % ( cl.spots[ 0 ].numb , pQBS( cl.text ) , pQBS( cl.punct.replace(',','').replace(' ',',') ) or str( len( cl.spots[ 0 ] ) ) )
	  if len( cl.spots ) > 1:
	    outL = outL[ : -8 ] + ',\n        "continued": [\n        ' + '\n        '.join (
		      [ '{ "direction": "%s" , "number": "%d" }' % 
			  ( directionNames[ sp.dirn ] , sp.numb ) for sp in cl.spots[ 1: ] ] ) + '\n        ]\n      }'
	else:
          outL = '{ "number": %d,\n\t  "clue": "%s"' % ( cl.spots[ 0 ].numb, pQBS( cl.text ) )
          if len( cl.spots ) > 1:
	    outL += ',\n\t  "continued": [ ' + ',\n\t\t\t '.join(
		[ '{ "direction": "%s" , "number": "%d" }' % 
			( directionNames[ sp.dirn ] , sp.numb ) for sp in cl.spots[ 1: ] ] ) + ']'
	  if cl.punct:
	    outL += ',\n\t  "enumeration": "%s"' % pQBS( cl.punct )
	  outL += ' }'
        out[ d ].append( outL )
    if SQ:
      return '    "Across": [\n' + '\n    ],\n    "Down": [\n'.join(
	    [ ',\n'.join( out[ d ] ) for d in 0,1 ] ) + '\n    ]'
    return '{\n    "Across": [\n\t' + ' ],\n    "Down":   [\n\t'.join(
	    [ ',\n\t'.join( out[ d ] ) for d in 0,1 ] ) + ' ] }'
  def transp( I , lines ):
    outL = []
    for j,line in enumerate( lines ):
      if not line:
	break
      for i,c in enumerate( line ):
	if c in cEnds:
	  # end of line - ignore following
	  break
	else:
	  while i >= len( outL ):
	    outL.append(' '*j)
	  outL[ i ] += c
    if debug > 2: print lines
    outL.append('')
    return outL
  def from_lines( I , lines ):
    if settings.transpose:
      lines = I.transp( lines )
    if debug>1: print "Establishing crossword structure..."

    # On the fly building of Across and Down spots ...
    #   ... a little tricky - reading cells in rows, so at any given
    #     time there is only one 'live' Across clue but several live
    #     Down clues.  Initially we allow spots of length 1,
    #     to save 'looking ahead' at next row.  Then cull afterwards.

    spotNowAcc = None	# Current 'across' spot
    spotsNowDn = dict()	# Current 'down' spots for each column

    stage = 0	# 0 = reading grid ; 1 = reading clues ; 2 = done
	# stage is advanced when blank line encountered
    dirn = 0	# default direction for when parsing clues
    for j,line in enumerate( lines ):
      cellRow = [ ]
      if not line:
	stage += 1
	if stage > 1:
	  break
        # finish grid stuff before doing clues
        # extend any short rows, so cellByPos has values for all valid i,j
        for cellRow in I.cellByPos:
          while len( cellRow ) < I.width:
	    cellRow.append( None )
        I.height = len( I.cellByPos )
        # Cull out any singleton spots and assign remaining spots to cells
        for d in 0,1:
          # Must use a ( slice ) copy of spots list because we are culling from original list
          for sp in I.spots[ d ][ : ]:
	    if keepSingletons or len( sp ) > 1:
	      for i,cl in enumerate( sp.cells ):
	        cl.spots += ( ( sp , i ) , )
	    else:
	      I.spots[ d ].remove( sp )
        # This will sometimes be convenient - and costs very little memory
        I.allSpots = I.spots[ 0 ] + I.spots[ 1 ]
        # Only after culling of singletons do we do cell and spot labels...
        headCells = list( set( [ sp.cells[ 0 ] for sp in I.allSpots ] ) )
        headCells.sort( None , repr )	# Sorts alphabetically with our Ce notation and hence
				  # in correct order of grid appearance
        # Number the cells that are the heads of spots ("head cells")
        for i,cl in enumerate( headCells ):
          I.cellLabels[ cl ] = i + 1
        # Then we can label the spots by direction and number in the customary manner
        for d in 0,1:
          for sp in I.spots[ d ]:
	    sp.setLabels( d , I.cellLabels[ sp.cells[ 0 ] ] )
            # and indexing by head cell numbers...
            I.spotByIndex[ d ][ sp.numb ] = sp
	    #labels = ( d , I.cellLabels[ sp.cells[ 0 ] ] )
	    #I.spotLabels[ sp ] = labels
	    #sp.dirn , sp.numb  = labels  
        continue
      if stage:
	# PARSING CLUES
	flaw = False # general flag we can set if anything doesn't parse
	if line[ -1 ] == ":":
	  # check for "Across:" or "Down:" heading
	  if line[ : -1 ] in directionNames:
	    dirn = directionNames.index( line[ : -1 ] )
	    #print 'direction: ' + line
	    continue
	iDot = line.find('.')
	if iDot > 0:
	  # spots are comma-separated list before dot
	  spotsTL = line[ : iDot ].strip().split(',')
	  #print spotsTL
	  # and trim the remainder of the line
	  text = line[ iDot + 1 : ].strip()
	  spots = []
	  for spotT in spotsTL:
	    # each spot is a number and optional direction
	    dirn2 = -1
            numb = parseInt( spotT )
            if numb:
              # look at what is after number
              tail = spotT[ len( str( numb ) ) : ]
	      if tail == '':
		dirn2 = dirn
	      elif tail in ('a','ac','across'):
		dirn2 = 0
	      elif tail in ('d','dn','down'):
		dirn2 = 1
	    if dirn2 >= 0 and numb in I.spotByIndex[ dirn2 ]:
              #print 'spot ' + str(numb) + '...' + tail + '->' + str( dirn2 )
	      spots.append( I.spotByIndex[ dirn2 ][ numb ] )
	    else:
	      flaw = True
	      break
	  # now to detect any enum
	  # TODO we could have a draft mode for 'n. SOLUTION (enum) clue' format
	  # until then we only recognise enum at end of line
	  if settings.draft:
	    # in draft mode, enum is content of first occuring set of parentheses, text is following
	    if text and "(" in text and ")" in text:
	      iPar = text.find( "(" )
	      iPar1 = text.find( ")" )
	      punct = text[ iPar + 1 : iPar1 ]
	      if punct:
		text = text[ iPar1 + 1 : ].strip( )
	      # for bog-standard enum matching spot length, leave blank
	      # note I.enum() will still return a string of the number
	      if len( spots ) == 1 and punct == str( len( spots[ 0 ] ) ):
		punct = ""
	    else:
	      punct = ""
	  else:
	    if text and text[ -1 ] == ")" and "(" in text:
	      iPar = text.rfind( "(" )
	      punct = text[ iPar + 1 : -1 ]
	      text = text[ : iPar ].strip()
	    else:
              punct = ""
	  if not flaw:
	    cl = clue( tuple( spots ) , text , punct )
	    #print ' %d clue %s ' % ( dirn , cl )
	    I.clues[ dirn ].append( cl )
	  
	  
	# didn't use else 'cos couldn't be bothered reworking indents (!)
	continue
      #parsing grid
      for i,c in enumerate( line ):
	if c in cEnds:
	  # end of line - ignore following
	  i -= 1	# point to correct width
	  break
	else:
	  if c in cCells:
	    # cell of crossword
	    newCell = cell( i , j )
	    if not spotNowAcc:
	      spotNowAcc = spot()
	      I.spots[ 0 ].append( spotNowAcc )
	    if not i in spotsNowDn:
	      spotsNowDn[ i ] = spot()
	      I.spots[ 1 ].append( spotsNowDn[ i ] )
	    I.cells.append( newCell )
	    cellRow.append( newCell )
	    spotNowAcc.cells += ( newCell, )
	    spotsNowDn[ i ].cells += ( newCell, )
	    if c in cAlphas:
	      I.cellContent[ newCell ] = set( [ c.upper() ] )
	      n = 1
	    else:
	      # Wildcard ... have to allow everything at first
	      I.cellContent[ newCell ] = set( ABC )   # can only populate later
	      n = cWilds.find( c ) + 1	#  n == 0  means  c == cClash
	    #I.cellScores[ newCell ] = n
	  else:
	    # assume block - could check == cBlock if requiring strict adherence
	    cellRow.append( None )
	    # Close current spots - remove from list if too short (now defered)
	    if spotNowAcc:
	      spotNowAcc = None
	    if i in spotsNowDn:
	      del spotsNowDn[ i ]
      # End of the line - finish off current across spot 
      if spotNowAcc:
	spotNowAcc = None
      I.cellByPos.append( cellRow )
      # seems bug-using to reference i outside what should be its scope,
      #  but it's convenient  -  will hold last valid value i.e. 1 less than width
      # I've checked and this is a documented and valued feature of python -
      #  the for loop is NOT a block so doesn't define separate scope
      if i >= I.width:
	I.width = i + 1

    # End of file
    return
  
  def cullHistoryNew( I ):
    """
    Start on a new block of cull history
    """
    I.cullSpots = { }   # spot : set of removed possibilities
    I.cullCells = { }   # cell : set of removed possibilities
    I.cullHistory.append( ( I.cullSpots , I.cullCells ) )
  
  def analyse( I ):
    """Do first analysis"""
    I.fetchWordLists()
    I.initAnalyse()
    # This is where we start a new cull history object
    # Note that adding these cull lists to the history
    #  does not remove them from view as I.cull<...> , so further
    #  culls can still be added (by subsequent analysis / posit)
    I.outerAnalyse()
    I.cullHistoryNew( )
    
  def posit( I , sp = None , w = None , depth = 1 ):
    """Try putting the word w in spot sp.
    Adjust spot and cell content, flag other spots affected,
    then do analysis if depth > 0 and
    recursive positing if depth > 1
    """
    if not sp:
      # By default we use the most restricted live spot (least possible words)
      spots = sorted( I.liveSpots.items() , None , lambda x:x[ 1 ] )
      if len( spots ):
	sp = spots[ 0 ][ 0 ]
      else:
	# No live spots left, grid must be (successfully?) filled
	return not I.contradiction
    oldList = I.spotContent[ sp ]
    # Return False (failed) if no words in the list, or w not in list
    if not oldList: return False
    if w:      
      if not w in oldList: return False
      if ( not settings.repeats ) and w in I.wordsUsed: return False
    #else:
      ## Default is a random choice of word (smarter strategies may exist)
      #w = random.choice( list( oldList ) )
      
    # Initiate new cull history event
    I.cullHistoryNew( )
    I.posits.append( ( sp , w ) )      
    # put word in
    I.setNewSpotContent( sp , [ w ] , False , "/===>" , cPrefixPosit )

    if depth:
      I.outerAnalyse( )
    
    return not I.contradiction

  def tryToFill( I ):
    I.dispPrefix = ""	# prefix to indicate current depth of search
    #ok = True
    while I.liveSpots:
      # Start of iteration
      # Sort spots with most restricted first
      spots = sorted( I.liveSpots.items() , None , lambda x:x[ 1 ] )
      sp = spots[ 0 ][ 0 ]
      cont = I.spotContent[ sp ]
      w = random.choice( list ( cont ) )
      #I.dispPrefix += '"'
      I.fullPosit( sp , w )
    # run out of live spots without a clash - must be done 
    return not I.contradiction

  def fullPosit( I , sp , w ):
    """posit word w in spot sp, and retract as necessary - which
    could extend to retracting a previous posit!"""
  
    I.posit( sp , w ) # starts new history event
    while I.contradiction:
      # Last posit failed,  withdraw it
      if I.posits:
	sp , w = I.posits.pop( )
	# Trim from last " in prefix
	I.dispPrefix = I.dispPrefix[ : 
	      - I.dispPrefix[ : : - 1 ].index( cPrefixPosit ) - 1 ]
	if debug:
	  print "%s\ %s" % ( I.dispPrefix , sp ) #, w.lower() )
	I.undoLastCull( ) # removes history event -
	I.contradiction = False
	I.setNewSpotContent( sp , set( ( w, ) ) , True )
	# This analysis may find a contradiction before we
	# get to do another posit,  hence this while loop
	I.outerAnalyse( )
      #else:
	## Ran out of posits to retract... search exhausted, failed
	#return False
    #return True

  def undoLastCull( I ):
    cullSpots , cullCells = I.cullHistory.pop( )
    for sp , culls in cullSpots.items():
      if len( I.spotContent[ sp ] ) == 1:
	# going back up from single possibility, i.e.
	# retracting commitment of a word
	I.wordsUsed -= I.spotContent[ sp ]
      I.spotContent[ sp ].update( culls )
      I.liveSpots[ sp ] = len( I.spotContent[ sp ] )
    for cl , culls in cullCells.items():
      I.cellContent[ cl ].update( culls )
    I.cullSpots , I.cullCells = I.cullHistory[ -1 ]

  def fetchWordLists( I ):  
    """Fetch relevant word lists - entire lists of required lengths,
    only fetching if not already in memory."""
    global wordLists
    if debug>1: print "Fetching word lists..."
    for sp in I.allSpots:
      l = len( sp )
      if not l in wordLists:
	try:
	  wordL = file( fileRoot + str( l ) ).read().split()
	except:
	  wordL = [ ]
	if settings.case:
	  wordLists[ l ] = [ w.upper() for w in wordL if w == w.lower() ]
	else:
	  wordLists[ l ] = [ w.upper() for w in wordL ]
	del wordL

  def initAnalyse( I ):
    I.liveSpots = dict()   # spot : n    where n is number of possibilities left
    I.spotsToAdjust = set( I.allSpots )
    for sp in I.allSpots:
      fixed = True
      for c in sp.cells:
	if not I.cellContent[ c ]:
	  I.contradiction = True
	  I.spotsToAdjust.clear()
	  return
	if len( I.cellContent[ c ] ) != 1:
	  fixed = False
	  break
      if fixed:
	# Pre-filled word
	w = ''.join( [ list( I.cellContent[ c ] )[ 0 ] for c in sp.cells ] )
	if settings.strict:
	  # Make sure it's legal - if required
	  if not w in wordLists[ len( w ) ]:
	    I.contradiction = True
	    I.spotsToAdjust.clear()
	    return
	I.wordsUsed.add( w )
	wl = [ w ]
	if debug > 1: print w ,
	I.spotsToAdjust.remove( sp )
      else:
	wl = wordLists[ len( sp ) ]
	I.liveSpots[ sp ] = len( wl )

      I.spotContent[ sp ] = set( wl )

  def outerAnalyse( I ):
    """
    Recursively go through the list of spots to adjust, restricting
    the cells in accordance with the spot restrictions, and flagging
    other spots that are thus affected (which is to say that if they had
    already been done, they'll be put back on the to-adjust list,
    to be picked up in the next iteration).
    """
    while I.spotsToAdjust and not I.contradiction:
      I.innerAnalyse( )

  def innerAnalyse( I ):
    if debug > 1:    print "Restricting %d spots" % len( I.spotsToAdjust ) ,
    if debug > 3:
      print ; print I.spotReport()

    for sp in list( I.spotsToAdjust ):
      if debug>2: print sp   #showLabel( I.spotLabels[ sp ] )

      # Update the regular expression

      regExp = regExpContentW( sp , I.cellContent )
      I.spotRegExp[ sp ] = regExp
      # Sneaky way to check for only one possibilty - no 'range'
      # indicators (e.g. [asdf] ) in the regular expression is the
      # only way it can be the same length as the spot it applies to
      if len( sp ) == len( regExp ):
	# forced word - but we must check it's a word (pre-filled 
	# words, if allowed unchecked, are 'let in' during initAnalyse( )
	if regExp in wordLists[ len( regExp ) ]:
	  newList = [ regExp ]
	else:
	  newList = [ ]
      else:
	try:
	  regExpComp = re.compile( regExp )
	except:
	  print '%s reg expn : %s ' % ( sp , regExp )
	  print '\n'.join( I.to_lines() )
	  raise "ERROR"
	if settings.repeats:
	  newList = [ w for w in I.spotContent[ sp ]
		    if regExpComp.match( w ) ]
	else:
	  newList = [ w for w in I.spotContent[ sp ]
		    if regExpComp.match( w ) and not w in I.wordsUsed ]
      I.setNewSpotContent( sp , newList )
      if I.contradiction:
	break
    if debug > 1: print

  def setNewSpotContent( I , sp , newList , byCulls = False , forceMsg = "  -> " , prefixXtra = cPrefixForce ):
    # Make newList ( a list ) the new set of possibilities
    # for spot sp,  and accordingly adjust cell contents and 
    # flag other affected spots.  If byCulls = True, use
    # newList argument as ( set ) culls, and skip reporting
    # if forced. forceMsg allows a different description
    # in the case where there is only one possibility
    cont = I.spotContent[ sp ]
    if byCulls:
      #if not newList.issubset( cont ):
	#print sp, newList, cont[:20]
	#raise "hell"
      culls = newList
      keeps = cont - culls
    else:
      #if not set( newList ).issubset( cont ):
	#print sp, newList, cont[:20]
	#raise "hell"
      keeps = set( newList )
      culls = cont - keeps
    newLen = len( keeps )
    
    I.liveSpots[ sp ] = newLen

    if not newLen:
      I.contradiction = ( sp , I.spotRegExp[ sp ] )
      # Contradiction reached as no words left for this spot
      if debug:
	print "%s XXXXX : %s : %s" % ( I.dispPrefix , sp , \
		I.spotRegExp[ sp ].lower() )
	      #showContentSpot( I.cellContent , sp , '.' ).lower() )
      # TODO: provide options here
      I.spotsToAdjust.clear()  # break outer cycle
      return
    if newLen == 1:
	del I.liveSpots[ sp ]
	I.wordsUsed.add( list( keeps )[ 0 ] )
	if debug and not byCulls:
	  print "%s %s : %s : %s " % \
		( I.dispPrefix , forceMsg , sp , newList[ 0 ] )
	  if debug > 2:
	    print '\n'.join( I.to_lines() )
	    raw_input('hit Enter to continue')
	I.dispPrefix += prefixXtra
	  
	if not I.liveSpots:
	  if debug > 2:
	    print "FILL COMPLETED."
	    print '\n'.join( I.to_lines() )
      
    # record changes ( if any )
    
    if culls:
      I.cullSpots.setdefault( sp , set() ).update( culls )
      cont -= culls
      transpose = zip( * keeps )
      newSpotContent = map ( set , transpose ) # turn each column into a set
      for i,cl in enumerate( sp.cells ):
	if len( newSpotContent[ i ] ) < len( I.cellContent[ cl ] ):
	  # Less permitted letters in this cell...
	  if debug > 1:   print cl , i ,
	  culls = I.cellContent[ cl ] - newSpotContent[ i ]
	  if culls:
	    #I.spotScores[ sp ][ i ] = newSpotContent[ i ]
	    I.cellContent[ cl ] -= culls
	    ## DEBUG: catch cells that have run out of possibilities,
	    ##  which shouldn't happen unless newSpotContent was
	    ##  disjoint with I.cellContent[ i ],  i.e. word
	    ##  chosen which didn't fit!
	    #if not I.cellContent[ cl ]:
	      #print sp , i , cl , culls , newSpotContent[ i ]
	      #print [ I.cellContent[ cl1 ] for cl1 in sp.cells ]
	      #print '\n'.join( I.to_lines( ) )
	      #raise 'exception'
	    I.cullCells.setdefault( cl , set() ).update( culls )

	    # Flag other spot(s) it's in

	    for ( sp1, i1 ) in cl.spots:
	      if not sp1 == sp:
		if sp1 in I.liveSpots:
		  I.spotsToAdjust.add( sp1 )

      # Mark this spot as done

    I.spotsToAdjust.discard( sp )

  def spotReport( I , showLen = False ):
    out = []
    for d in 0,1:
      out.append( directionNames[ d ] + ':' ) # "Across" or "Down"
      for sp in I.spots[ d ]:
	if showLen:
	  out.append("  %2d. %s (%d)" % \
		( sp.numb , showContentSpot( I.cellContent , sp ) , len ( sp ) ) )
	else:
	  out.append( "  %2d. %s " % \
		( sp.numb , showContentSpot( I.cellContent , sp ) ) )
    return out

  def shortListReport( I , n , cont , maxW = 84 ):
    """Produce lines of text displaying up to maxW of the
    n words listed in cont (should have n==len(cont))"""
    wpl = 84 / ( len( cont[ 0 ] ) + 5 )
    # trim number to display to 'reasonable' (depends on i)
    n1 = min( n , maxW )
    nrows = ( n1 - 1 ) / wpl + 1
    return [ ( ' '.join( [ "%3d:%s" % ( k + 1 , cont[ k ] )
	for k in range( j * wpl , min( ( j + 1 ) * wpl , n ) ) ] ) )
	    for j in range( nrows ) ]
      
    
  def report( I , verbose = 0 ):
    # Return report on current status, as list of lines
    out = []
    if verbose > 1:
      out += I.to_lines( )
    if I.contradiction:
      out.append( "Contradiction at %s : %s " % I.contradiction )
      return out
    if verbose:
      out += ( I.spotReport( True ) )
    # Sort spot-list with most restricted first
    shortList1 = [ ( n , sp ) for ( sp , n ) in I.liveSpots.items() ]
    shortList1.sort()
    I.shortList = [ ( i + 1 , sp , n , list ( I.spotContent[ sp ] ) ) 
	for ( i , ( n , sp ) ) in enumerate( shortList1[ : 8 ] ) ]
    for ( i , sp , n , cont ) in I.shortList[ :: -1 ]:
      if n!= len( cont ):
	print i, sp, n , len( cont ) , I.contradiction
      assert n == len( cont )
      out.append( " # %2d : %s : %d ..." % ( i , sp , n ) )
      # trim number to display to 'reasonable' (depends on i)
      out += I.shortListReport( n , cont , 
		( 984 , 84,40,20,16 , 12,10,8,7 , 6,5,5,4 )[ i ] )	       
    return out

def remark( s , i = 1 ):
  if debug > i: print s
  
def rem( s ):
  remark( s , 2 )


def getSettings( ):  
  parameters = [ 
    ( "h" , "help" , "show help and exit" ) ,
    ( "f" , "fill" , "autofill the grid" ) ,
    ( "r" , "repeats" , "allow repeated words" ) ,
    ( "c" , "case" , "DISALLOW words with upper case" ) ,
    ( "q" , "quiet" , "print no progress info" ) ,
    ( "v" , "verbose" , "print extra progress info" ) ,
    ( "i" , "interact" , "prompt user for choice of words" ) ,
    ( "s" , "strict" , "check words already in grid" ) ,
    ( "t" , "transpose" , "transpose grid after reading" ) ,
    ( "o" , "output", "output to start of input file (prepend)") ,
    ( "p" , "iPuz" , "generate an iPuz file" ) ,
    ( "d" , "draft" , "draft mode - allows 'SOL (enum) clue' format" )
    ]
  ret = parseArgs.parse_arguments( parameters )
  ret["debug"] = 1 + ( ret.verbose ) - ( ret.quiet )
  return ret
  

def doFile( f ):
  if debug > 1: print "Reading source file '%s'..." % f
  it = xwd( f )  # lines )
  it.name = it.name or f
  if settings.fill:
    if it.contradiction:
      return
    else:
      it.tryToFill( )
      if it.contradiction:
	return
  if not settings.quiet:
    print
    print '\n'.join( it.to_lines() )
    print '\n'.join( it.report( 1 ) )
  if it.contradiction:
    return
  if settings.interact:
    print " Enter <spot number>,<word number> to commit a word."
    print "q = quit, b = back,  <spot number> to see full list."
    going = True
    while going:
      # ask the user what to do
      prompt = ":"
      cmd = raw_input( prompt )
      sp , w = None , None
      if cmd == 'q':
	going = False
	continue
      elif cmd == 'b':
	it.undoLastCull()
      else:
	try: 
	  if ',' in cmd:
	    sp , w = map( int , cmd.split( ',' ) )
	  else:
	    sp = int( cmd )
	except:
	  print "Invalid command - use 'q' to quit, or use number(s)"
	  continue
	if sp:
	  if 0 < sp <= len( it.shortList ):
	    i , sp , n , cont = it.shortList[ sp - 1 ]
	  else:
	    print "Spot number out of range - only %d available." \
		    % len( it.shortList )
	    continue
	  if w:
	    if 0 < w <= n:
	      w = cont[ w - 1 ]
	    else:
	      print "Word number out of range - %s had only %d available." \
		      % ( sp , n )
	      continue
	    it.fullPosit( sp , w )
	  else:
	    # spot only entered - show full list
	    print '\n'.join( it.shortListReport( n , cont , 984 ) )
	    continue
      print '\n'.join( it.to_lines() )
      print '\n'.join( it.report( 1 ) )
  if settings.output:
      # prepend output to input file f
      ff = open( f , "r+" )
      fL = ff.read()
      ff.seek( 0 )
      ff.write( '\n'.join( it.to_lines() + [""] + it.report( 1 ) + [""] ) + fL )
      ff.close()
  if settings.iPuz:
      # output to file f.ipuz
      # TODO
      ff = open( f + ".ipuz" , "w" )
      ff.write( it.to_iPuzSQ() )
      #print '{   "Across:"\t[ [ ' + ' ],\n\t\t\t\t  [ '.join( [ str(spot.numb) + ', ""' for spot in it.spots[ 0 ] ] ) + ' ] ],\n' + \
	 #'\t\t\t"Down:"\t[ [ ' + ' ],\n\t\t\t\t  [ '.join( [ str(spot.numb) + ', ""' for spot in it.spots[ 1 ] ] ) + ' ] ] }'
      ff.close()
  return it

def main( ):
  global settings , debug
  print settings
  # temp fix - save replacing every debug with settings.debug
  debug = settings.debug
  return [ doFile( f ) for f in settings.arguments ]
  #for f in settings.arguments:
    #doFile( f )





global x, them
import args as parseArgs
settings = getSettings( )
print __name__
print list( sys.argv )
if __name__ == "__main__":  
  main( )
else:
  #settings["arguments"] = [ 'puzzle-2x2-1clue' ]
  settings["arguments"] = [ 'satquiz001' ]
  #settings["arguments"] = [ 'satquiz002' ]
  #settings["arguments"] = [ 'puzzle834' ]
  settings["draft"] = True
  settings["quiet"] = True
  #settings["iPuz"] = True
  
  them = main( )
  x = them[ 0 ]
  x.name = "SQ002"
  x.author = ""
  #print x.to_iPuzSolnSQ()
  #print x.to_iPuzGrid(True)
  #print x.to_iPuzSQ()
  #g.fillFromLines( ( 'ABC=DEF','G=H=I=J','KLMNO=P','Q=R=S=T','UVW=XYZ' ) )
  #g = grid2D()
  #h = g.fromStr( 'ABC~=DE|F=G~=HI|=JK~LM||NO=~PQ=|R=S~=TU|VW=~XYZ' )
  #print h
  #print g.toStrContent( h )
  # windmill
  g = cartesianGrid( (15,15) , [(2,2),(2,4),(2,6),(2,8),(4,2),(4,4),(4,6),(4,8),(6,2),(6,4),(6,6),(6,8),(8,2),(8,4),(8,6),(8,8),(1,8),(3,10),(5,7)] , [] , 4 )
  #g = grid2D( 'ABC~=DE|F=G~=HI|=JK~LM||NO=~PQ=|R=S~=TU|VW=~XYZ' )
  #g = cartesianGrid( 'ABCDE|FGHIJ|KLMNO|PQRST|UVWXY' , [] , {(1,2):[1,],(2,4):[0,]} , 4 )
  print g


