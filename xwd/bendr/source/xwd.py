#!/usr/bin/python

"""
Abstract crossword class, interactive (or autopilot) crossword filler

code reworked from an5
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
cPrefixForce = '-'
cPrefixPosit = '|'

def pQBS( s ):
  # protect quote and backslash - i.e. insert backslashes before them
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
    I.nam   = "%2d%s" % ( I.numb , dirnNamC[ I.dirn ] ) 
    I.nameL = "%2d. %s" % ( I.numb , directionNames[ I.dirn ] )

class clue:
  # This class needn't be used when just composing a grid
  # A clue is a piece of text suggesting answer/s for a spot or sequence of spots
  spots	= ( )
  text	= ""	# actual text of clue
  punct	= ""	# optional specification of word breaks and punctuation
  anno	= ""	# optional explanatory text of clues working (for cryptics mainly)
  soln	= ""
  nam	= ""
  nameL	= ""
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
  def __len__( I ):
    # length of clue is total length of its cells
    return sum( map( len, I.spots ) )
  def __repr__( I ):
    # short name e.g. 3a
    return I.nam
  def __str__( I ):
    # name and text and enum of clue
    return "%s. %s (%s)" % ( I.nam , I.text or I.soln , I.enum() )
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

class xwd( object ):
  
  contradiction = False
  dispPrefix = ""
  
  def __init__( I , src = None , raw = False ):
    """
    src should be a filename or a list of lines of text
    Use raw = True to avoid analysis
    """
    if debug >=3: print lines
    
    I.width        = 0
    I.height       = 0
    
    I.cells        = [ ]	# flat list of all the cells
    I.cellByPos    = [ ]	# cell or None references by I.cellByPos[ j ][ i ]
    
    I.spots        = [ [ ] , [ ] ]     # Across and down spots - lists of pointers to cells
    I.spotByIndex  = [ { } , { } ]	# indexed by head number
    
    # added in 2024 ... since we may use this as main conversion program
    I.clues	   = [ [ ] , [ ] ]	# Clues - each is a tuple ( spot OR list of spots , clue text [ , punct ] )
    
    I.cellLabels   = dict()            # Number / label in cell
    #I.spotLabels   = dict()            # ( d , n ) where d is direction: 0 Across, 1 Down
			               ## and n is label in head cell (usually number)
    
    I.cellContent  = dict()	# Possible content for the cells, as sets of possibilities
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
    I.spotContent = dict()    # Possible content for the spots, as lists of words
    I.spotRegExp  = dict()
    
    I.wordsUsed  = set()      # words already used -> to avoid repeats
    
    I.spotsToAdjust = set()   # spots that need adjustment
    I.posits = []             # trialled entries - linked with cull history
    I.cullHistory = []
    I.cullHistoryNew()        # sets up I.cullHistory , I.cullSpots , I.cullCells

    if src:
      if isinstance ( src , list ) and src and \
	    isinstance ( src[ 0 ] , str ):
	I.from_lines( src )
	if not raw:
	  I.analyse( )
      elif isinstance( src , str ) and src:
	I.from_lines( file( src ).read().splitlines() )
	if not raw:
	  I.analyse( )
    
  def to_lines( I , shaded="=", endofline="|", blank=" "  ):
    return [ ''.join( [ ( c and showContent( I.cellContent[ c ] , blank ) ) or shaded \
		for c in cellRow ] ) + endofline for cellRow in I.cellByPos ] + [ "" ]

  def to_iPuz( I ):
    # get year for copyright ... two methods both required an import
    #from subprocess import check_output
    #yr = checkoutput( [ 'date' , '+%Y' ] ).strip()
    from datetime import datetime
    yr = str( datetime.now().year )
    return """
{
  "version":   "http://ipuz.org/v2",
  "kind":    [ "http://ipuz.org/crossword" ],
  "title":     "%s",
  "copyright": "%s",
  "author":    "%s",
  "dimensions": { "width": %d , "height": %d },
  "showenumerations": true,
  "puzzle":   %s,
  "solution": %s,
  "clues:" %s
}
""" % ( "" , yr , "BenDR", I.width, I.height ,
	str( I.to_iPuzGrid() ) , str( I.to_iPuzSoln() ) , str( I.to_iPuzClues() ) )

  def to_iPuzSoln( I ):
    return '[ [ "' + '" ],\n\t\t[ "'.join( [ '","'.join( line ) 
	 for line in I.to_lines( "#" , "" )[ : -1 ] ]	) + '"] ]' 
  def to_iPuzGrid( I ):
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
    return '[ [ ' + ' ],\n\t\t[ '.join( [ ','.join(
	    [ ( n + 1 ) and ( '%3d' % n ) or '  #' for n in outL ] ) for outL in out ] ) + ' ] ]'
    
  def to_iPuzClues( I ):
    # returns a string, but we'll make 
    # TODO nuances
    out = [ [ ] , [ ] ]
    for d in 0,1:
      for cl in I.clues[d]:
        if len( cl.spots ) == 1 and cl.punct == "":
	  out[ d ].append( '[ %d, "%s" ]' % ( cl.spots[ 0 ].numb, pQBS( cl.text ) ) )
	  continue
        outL = '{ "number": %d,\n\t  "clue": "%s"' % ( cl.spots[ 0 ].numb, pQBS( cl.text ) )
        if len( cl.spots ) > 1:
	  outL += ',\n\t  "continued": [ ' + ',\n\t\t\t '.join(
		[ '{ "direction": "%s" , "number": "%d" }' % 
			( directionNames[ sp.dirn ] , sp.numb ) for sp in cl.spots[ 1: ] ] ) + ']'
	if cl.punct:
	  outL += ',\n\t  "enumeration": "%s"' % pQBS( cl.punct )
	outL += ' }'
        out[ d ].append( outL )
    return '{\n    "Across": [\n\t' + ' ],\n    "Down":   [\n\t'.join(
	    [ ',\n\t'.join( out[ d ] ) for d in 0,1 ] ) + ' }'
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
      print '~'+line
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
	# parsing clues
	flaw = False # general flag we can set if anything doesn't parse
	if line[ -1 ] == ":":
	  # check for "Across:" or "Down:" heading
	  if line[ : -1 ] in directionNames:
	    dirn = directionNames.index( line[ : -1 ] )
	    print 'direction: ' + line
	    continue
	iDot = line.find('.')
	if iDot > 0:
	  # spots are comma-separated list before dot
	  spotsTL = line[ : iDot ].strip().split(',')
	  print spotsTL
	  # and trim the remainder of the line
	  text = line[ iDot + 1 : ]
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
              print 'spot ' + str(numb) + '...' + tail + '->' + str( dirn2 )
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
	    if text and text[ -1 ] == ")" and "(" in text:
	      iPar = text.rfind( "(" )
	      punct = text[ iPar + 1 : -1 ]
	      text = text[ : iPar ].strip()
	    else:
              punct = ""
	  if not flaw:
	    cl = clue( tuple( spots ) , text , punct )
	    print ' %d clue %s ' % ( dirn , cl )
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

  def setNewSpotContent( I , sp , newList , 
	byCulls = False , forceMsg = "  -> " , prefixXtra = cPrefixForce ):
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
  if settings.fill:
    if it.contradiction:
      return
    else:
      it.tryToFill( )
      if it.contradiction:
	return
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
      ff.write( it.to_iPuz() )
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
  #settings["iPuz"] = True
  
  them = main( )
  x = them[ 0 ]


