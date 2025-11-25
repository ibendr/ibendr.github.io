#!/usr/bin/python

"""
Simple program to create html xwd files from 'draft'
text xwd files - where each clue is in format:
  <n>. <SOLUTION> (<LENGTH>) <CLUE>
and of course we want it as:
  <n>. <CLUE> (<LENGTH>)
We also move the solution (grid) to the end,
and add 3 intervening lines of html.
WARNING: This is a crude program, e.g. demands
exactly one blank line between lines of grid
and clues, only translates clue format if the
clue fits the test just right.
"""

import sys , subprocess , re , os
import random

# Global variables

# DEFAULT - keep annos + defs but not other extra stuff (same as using -a)
keepXtra = False
keepAnno = True
html1 = '<!doctype html><html><head><script type="text/javascript" src="../js/xwdMaster5.js"></script></head>\n<body><pre class="xwd">'
html2 = 'Solution:'
html3 = '</pre></body></html>\n'
foutpath = '../'
#defInfo = { "Author" : "by BenDR" }
defInfo = { "Author" : file( 'authorName' ).read( ) }

def doEntities( s ):
#     make a string safe(r) to put into html or XML
    entities = ( ('&','amp'),('<','lt'),('>','gt'),('"','quot') )
    for ent in entities:
	s = s.replace( ent[ 0 ] , '&' + ent[ 1 ] + ';' )
    return s

if __name__ == "__main__":
    import sys
    for fname in list ( sys.argv[ 1 : ] ):
	# check for switches - crude
	if fname[ 0 ] == '-':
		sw = fname[ 1: ]
		if sw == "k":
			# KEEP all extra lines (ones that don't parse as clues)
			keepXtra = True
			continue
		if sw == "l":
			# LOSE extra lines (including possible annos / defs )
			keepXtra = False
			keepAnno = False
			continue
		if sw == "a":
			# LOSE extra lines except first after valid clue, as anno
			keepXtra = False
			keepAnno = True
			continue
	# if only anumber given, prefix it by "puzzle"
	if fname.isdigit():
		fname = "puzzle" + fname
	print fname
	src = file( fname ).read( ).splitlines( )
	grid, clues, annos, defs = [ ] , [ ] , [ ] , [ ]
	i = 0
	# Up to first blank line is grid
	while i < len( src ) and src[ i ].strip( ):
	    grid.append( src[ i ].upper( ) )
	    i += 1
	# Then clues and annos
	i += 1
	clueJustDone = False
	annoJustDone = False
	while i < len( src ) and src[ i ].strip( ):
	    l = src[ i ].strip( )
	    # To count as a clue, must have digit first, then  . ( ) in that order
	    if l[0] in '123456789' and ( 0 < l.find( '.' ) < l.find( '(' ) ) and ')' in l[ l.find( '(' ) + 1 : ]:
		# Translate ( move def ) if more stuff after last ')'
		if l[ ::-1 ].find( ')' ) > 2:
		    # BUT we move everything after FIRST ( ... )
		    l = l[ : l.find( '.' ) + 1 ] + l[ l.find( ')' ) + 1 : ] + \
			l[ l.find( '(' ) - 1 : l.find( ')' ) + 1 ]
		# if line contains ":" we must prefix it with one also
		if l.find( ':' ) > -1:
		    l = ':' + l
		clues.append( doEntities( l ) )
		# note label of clue just done
		clueJustDone = l[:l.find('.')].strip()
	    else:
		# keep labels e.g. Across: , Down:
		if l[-1]==":":
		    # Should be an Across: or Down: heading
		    clues.append( l )
		    # announce direction in annos and defns as well
		    annos.append( 'Annos-' + l )
		    defs.append(  'Defs-'  + l )
		# keep "see..." clues (but don't count as valid clue to follow with anno), or keep everything if keepXtra is set
		elif keepXtra or 0 < l.find( '.' ) < l.find( ' see ' ) < len( l ) - 2 or 0 < l.find( '.' ) < l.find( ' See ' ) < len( l ) - 2:
		    clues.append( doEntities( l ) )
		# non-clue line immediately following clue line is annotation (from Sep 2025)
		elif keepAnno and clueJustDone:
		    #clues.append( '.' + l.strip() )
		    annos.append( clueJustDone + '. ' + doEntities( l ) )
		    annoJustDone = clueJustDone
		elif keepAnno and annoJustDone:
		    # also keep defs (from Nov 2025) on line/s after anno - must be a faithful extract of clue
		    if l in clues[ -1 ]:
			defs.append( annoJustDone + '. ' + doEntities( l ) )
			# leave annoJustDone set in case multiple defs
		    else:
			# once we strike one invalid def line we ignore any further ones
			annoJustDone = False
		clueJustDone = False
	    i += 1
	# then any other info
	info = { }
	#defaults
	inf0 = defInfo
	fout = foutpath + fname + '.html'
	# name inserting - custom for BenDR, SteveLT
	if fname[ : 6 ] == 'puzzle':
	    inf0[ "Name" ] = "Puzzle " + fname[ 6 : ].strip( )
	if fname[ 3 : 6 ] == 'slt':
	    inf0[ "Name" ] = "Puzzle " + fname[ : 3 ]
	    fout =  '../slt07-' + fname[ : 3 ] + '.html'
	i += 1
	while i < len( src ) and src[ i ].strip( ):
	    l = src[ i ].strip( )
	    if ':' in l:
		j = l.find( ':' )
		info[ l[ : j ].strip( ) ] = l[ j + 1 : ].strip( )
	    i += 1
	#print info
	
	# We'll add a name tag if it's in the puzzle<n> series...
	for label in ( "Name" , "Author" , "Copyright" , "CursorStart" ):
	    val = None
	    if label in info:
		val = info[ label ]
	    elif label in inf0:
		val = inf0[ label ]
	    if val:
		grid.append( label + ": " + doEntities( val ) )

	out = [ html1 ] + clues + [ html2 ] + grid + annos + defs + [ html3 ]
	# output
	file( fout , 'w' ).write( '\n'.join( out ) )
	if ( fname[ : 6 ] == 'puzzle' ) or ( fname[ 3 : 6 ] == 'slt' ):
	    # don't git add for satquiz puzzles
	    os.system( 'git add ' + fname + ' ' + fout  )
	#file( '../' + fname + '.html' , 'w' ).write( '\n'.join( out ) )
	#file( '/home/ben/programming/ibendr.github.io/xwd/' + fname + '.html' , 'w' ).write( '\n'.join( out ) )

	
      
      
