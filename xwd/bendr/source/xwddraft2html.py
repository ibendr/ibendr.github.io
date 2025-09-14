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

keepXtra = True
keepAnno = False
html1 = '<!doctype html><html><head><script type="text/javascript" src="../js/xwdMaster5.js"></script></head>\n<body><pre class="xwd">'
html2 = 'Solution:'
html3 = '</pre></body></html>\n'
fpath = '../'

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
			# KEEP extra lines (ones that don't parse as clues)
			keepXtra = True
			continue
		if sw == "l":
			# LOSE extra lines
			keepXtra = False
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
	grid, clues, annos = [ ] , [ ] , [ ]
	i = 0
	# Up to first blank line is grid
	while i < len( src ) and src[ i ].strip( ):
	    grid.append( src[ i ].upper( ) )
	    i += 1
	# Then clues and annos
	i += 1
	clueJustDone = False
	while i < len( src ) and src[ i ].strip( ):
	    l = src[ i ].strip( )
	    # To translate, must have  . ( ) in that order ... and (Sep 2025) start with number
	    if ( 0 < l.find( '.' ) < l.find( '(' ) < l.find( ')' ) < len( l ) - 2 ) and l[0] in '123456789':
		l = l[ : l.find( '.' ) + 1 ] + l[ l.find( ')' ) + 1 : ] + \
		    l[ l.find( '(' ) - 1 : l.find( ')' ) + 1 ]
		# if line contains ":" we must prefix it with one also
		if l.find( ':' ) > -1:
		    l = ':' + l
		clues.append( doEntities( l ) )
		# note label of clue just done
		clueJustDone = l[:l.find('.')].strip()
	    else:
		# non-clue line immediately following clue line is annotation (from Sep 2025)
		if keepAnno and clueJustDone:
		    #clues.append( '.' + l.strip() )
		    annos.append( clueJustDone + '. ' + doEntities( l.strip() ) )
		# keep "see..." clues (but don't count as valid clue to follow with anno), or keep everything if keepXtra is set
		# also keep labels e.g. Across: , Down:
		elif l[-1]==":":
		    clues.append( l )
		    # announce direction in annos as well
		    annos.append( 'Annos-' + l )
		elif keepXtra or 0 < l.find( '.' ) < l.find( ' see ' ) < len( l ) - 2 or 0 < l.find( '.' ) < l.find( ' See ' ) < len( l ) - 2:
		    clues.append( doEntities( l ) )
		clueJustDone = False
	    i += 1
	# then any other info
	info = { }
	#defaults
	inf0 = { "Author" : "by BenDR" }
	if fname[ : 6 ] == 'puzzle':
	    inf0[ "Name" ] = "Puzzle " + fname[ 6 : ].strip( )
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

	out = [ html1 ] + clues + [ html2 ] + grid + annos + [ html3 ]
	# output
	fout = fpath + fname + '.html'
	file( fout , 'w' ).write( '\n'.join( out ) )
	if fname[ : 6 ] == 'puzzle':
	    # don't git add for satquiz puzzles
	    os.system( 'git add ' + fname + ' ' + fout  )
	#file( '../' + fname + '.html' , 'w' ).write( '\n'.join( out ) )
	#file( '/home/ben/programming/ibendr.github.io/xwd/' + fname + '.html' , 'w' ).write( '\n'.join( out ) )

	
      
      
